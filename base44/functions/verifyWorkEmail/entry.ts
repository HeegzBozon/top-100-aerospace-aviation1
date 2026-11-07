import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { verifyWorkDomain, verifiedFields, domainOf, isWorkDomain } from '../../shared/verification.ts';
import { workEmailCodeHtml, workEmailCodeText } from '../../shared/verificationEmail.ts';

// ── The work-email desk ──
//
// The cheapest strong signal the record can carry: a person answering a code at the
// mailbox their employer gives them. Two moves, both here, so the code never leaves
// the server in any form a client could reuse.
//
//   request  — decides whether the address speaks for the employer named on the
//              record, then mails six digits to it.
//   confirm  — checks the digits and, only then, awards the employer check.
//
// Nothing is granted on the strength of a claim alone. The badge appears because a
// mailbox at that domain answered.

const CODE_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_AFTER_MS = 45 * 1000;
const REQUESTS_PER_HOUR = 5;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function makeCode(): string {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return String(100000 + (buffer[0] % 900000));
}

async function hashCode(code: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${code}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function firstNameOf(user: any): string {
  const full = String(user?.full_name || '').trim();
  const token = full.split(/\s+/)[0];
  if (token && token.length > 1) return token;
  const local = String(user?.email || '').split('@')[0].split(/[._\-0-9]/)[0];
  if (local && local.length > 1) return local.charAt(0).toUpperCase() + local.slice(1);
  return 'Fellow';
}

// The record is the Fellow's own, or this desk has nothing to say to them.
function ownsRecord(nominee: any, user: any): boolean {
  if (!nominee || nominee.claim_status !== 'approved') return false;
  if (nominee.claimed_by_user_id) return nominee.claimed_by_user_id === user.id;
  return !!nominee.claimed_by_user_email && nominee.claimed_by_user_email === user.email;
}

function pageItems(page: any): any[] {
  return Array.isArray(page) ? page : page?.items || [];
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((error) => (error.status === 401 ? null : Promise.reject(error)));
    if (!user) {
      return Response.json({ error: 'Sign in to confirm your employer.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action === 'confirm' ? 'confirm' : 'request';
    return action === 'confirm'
      ? await confirm(base44, user, body)
      : await request(base44, user, body);
  } catch (error) {
    console.error(`verifyWorkEmail failed: ${error?.message}`);
    return Response.json({ error: error?.message || 'Verification is unavailable.' }, { status: 500 });
  }
}

async function request(base44: any, user: any, body: any): Promise<Response> {
  const nomineeId = String(body?.nominee_id || '').trim();
  const workEmail = String(body?.work_email || '').trim().toLowerCase();

  if (!nomineeId) return Response.json({ error: 'A record is required.' }, { status: 400 });
  if (!EMAIL_RE.test(workEmail)) {
    return Response.json({ error: 'That does not look like an email address.' }, { status: 400 });
  }
  if (!isWorkDomain(workEmail)) {
    return Response.json(
      { ok: false, reason: 'personal', message: 'Use the address you work from. A personal mailbox cannot confirm an employer.' },
      { status: 200 },
    );
  }

  const nominee = await base44.entities.Nominee.get(nomineeId).catch((error) =>
    error.status === 404 ? null : Promise.reject(error),
  );
  if (!nominee) return Response.json({ error: 'Record not found.' }, { status: 404 });
  if (!ownsRecord(nominee, user)) {
    return Response.json(
      { error: 'Claim this record before you confirm an employer for it.' },
      { status: 403 },
    );
  }

  const verdict = verifyWorkDomain(workEmail, nominee);
  if (!verdict.ok) {
    const employer = nominee.company || nominee.organization || '';
    return Response.json(
      {
        ok: false,
        reason: verdict.reason,
        employer,
        message: employer
          ? `That address does not belong to ${employer}. Use the work address your employer gives you.`
          : 'This record names no employer yet. Add one, then confirm the address you work from.',
      },
      { status: 200 },
    );
  }

  // Already confirmed against this domain: nothing to prove twice.
  const flags = nominee.verification_status || {};
  if (flags.employer_verified) {
    return Response.json({ ok: true, already: true, message: 'Your employer is already confirmed.' });
  }

  const recent = pageItems(
    await base44.entities.VerificationRequest.filter(
      { nominee_id: nomineeId },
      { sort: '-created_date', limit: 20 },
    ),
  );
  const last = recent.find((row) => row.created_by_id === user.id || row.user_id === user.id);
  if (last && Date.now() - new Date(last.created_date).getTime() < RESEND_AFTER_MS) {
    return Response.json(
      { error: 'A code was just sent. Give it a minute before asking for another.' },
      { status: 429 },
    );
  }
  const lastHour = recent.filter(
    (row) => Date.now() - new Date(row.created_date).getTime() < 3600000,
  ).length;
  if (lastHour >= REQUESTS_PER_HOUR) {
    return Response.json(
      { error: 'Too many codes have been sent for this record in the last hour.' },
      { status: 429 },
    );
  }

  const code = makeCode();
  const row = await base44.entities.VerificationRequest.create({
    user_id: user.id,
    user_email: user.email,
    nominee_id: nomineeId,
    work_email: workEmail,
    work_domain: domainOf(workEmail),
    code_hash: await hashCode(code, `${user.id}:${workEmail}`),
    status: 'pending',
    attempts: 0,
    basis: verdict.basis,
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });

  const organisation = nominee.company || nominee.organization || '';
  try {
    const sent: any = await base44.asServiceRole.integrations.Core.SendEmail({
      to: workEmail,
      subject: 'Your confirmation code — TOP 100 Aerospace & Aviation',
      html: workEmailCodeHtml({ code, firstName: firstNameOf(user), organisation }),
      text: workEmailCodeText({ code, firstName: firstNameOf(user), organisation }),
      category: 'transactional',
    });
    if (sent && sent.success === false) {
      throw new Error(sent.message || 'The mail service refused the message.');
    }
  } catch (error) {
    await base44.entities.VerificationRequest.update(row.id, {
      status: 'refused',
      note: String(error?.message || 'The mail service did not answer.'),
    }).catch(() => {});
    return Response.json(
      { error: 'We could not send a code to that address. Check it and try again.' },
      { status: 502 },
    );
  }

  return Response.json({
    ok: true,
    request_id: row.id,
    sent_to: workEmail,
    expires_at: row.expires_at,
    message: `A six-digit code is on its way to ${workEmail}.`,
  });
}

async function confirm(base44: any, user: any, body: any): Promise<Response> {
  const requestId = String(body?.request_id || '').trim();
  const code = String(body?.code || '').replace(/\D/g, '');
  if (!requestId) return Response.json({ error: 'A request is required.' }, { status: 400 });
  if (code.length !== 6) {
    return Response.json({ ok: false, reason: 'code', message: 'Enter all six digits.' }, { status: 200 });
  }

  const row = await base44.entities.VerificationRequest.get(requestId).catch((error) =>
    error.status === 404 ? null : Promise.reject(error),
  );
  if (!row || row.user_id !== user.id) {
    return Response.json({ error: 'That request does not belong to you.' }, { status: 404 });
  }
  if (row.status !== 'pending') {
    return Response.json(
      { ok: false, reason: 'closed', message: 'That code is no longer open. Ask for a new one.' },
      { status: 200 },
    );
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await base44.entities.VerificationRequest.update(row.id, { status: 'expired' }).catch(() => {});
    return Response.json(
      { ok: false, reason: 'expired', message: 'That code has expired. Ask for a new one.' },
      { status: 200 },
    );
  }
  if ((row.attempts || 0) >= MAX_ATTEMPTS) {
    await base44.entities.VerificationRequest.update(row.id, { status: 'expired' }).catch(() => {});
    return Response.json(
      { ok: false, reason: 'locked', message: 'Too many tries. Ask for a new code.' },
      { status: 200 },
    );
  }

  const expected = await hashCode(code, `${user.id}:${row.work_email}`);
  if (expected !== row.code_hash) {
    const attempts = (row.attempts || 0) + 1;
    await base44.entities.VerificationRequest.update(row.id, { attempts }).catch(() => {});
    return Response.json(
      {
        ok: false,
        reason: 'code',
        attempts_left: Math.max(0, MAX_ATTEMPTS - attempts),
        message: 'That code does not match. Check the digits and try again.',
      },
      { status: 200 },
    );
  }

  const nominee = await base44.entities.Nominee.get(row.nominee_id).catch((error) =>
    error.status === 404 ? null : Promise.reject(error),
  );
  if (!nominee) return Response.json({ error: 'Record not found.' }, { status: 404 });
  if (!ownsRecord(nominee, user)) {
    return Response.json({ error: 'This record is not yours to confirm.' }, { status: 403 });
  }

  const fields = verifiedFields(nominee, { employer_verified: true });
  const updated = await base44.entities.Nominee.update(nominee.id, fields);
  await base44.entities.VerificationRequest.update(row.id, {
    status: 'confirmed',
    confirmed_at: new Date().toISOString(),
  });

  return Response.json({
    ok: true,
    nominee: updated,
    message: 'Your employer is confirmed.',
  });
}