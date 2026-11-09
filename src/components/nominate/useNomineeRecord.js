import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// What the house already holds for a name being put forward.
//
// A Fellow's record is the canonical one, so the hub never asks a nominator to retype an
// identity the platform has already verified. The lookup answers with the record that best
// matches what has been typed — an address it holds, a LinkedIn handle it holds, or a name
// that is already on the record — and the card beside the field offers to use it.
//
// A miss is silent: the flow simply carries on asking for the details as it always has.

const escapeRe = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const norm = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
const titleCase = (value) => value.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
const rows = (page) => (Array.isArray(page) ? page : page?.items || []);

// The LinkedIn handle in a profile address, if that is what was typed.
function handleOf(url) {
  const raw = String(url || '').trim();
  if (!/linkedin\.com\//i.test(raw)) return '';
  const tail = raw.replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').filter(Boolean).pop() || '';
  return tail.length > 2 ? tail : '';
}

function best(records, { typed, mail, handle }) {
  const unique = [...new Map(records.filter((r) => r?.id).map((r) => [r.id, r])).values()];
  const byEmail = mail && unique.find((r) => norm(r.nominee_email) === mail || (r.secondary_emails || []).some((e) => norm(e) === mail));
  if (byEmail) return byEmail;
  const byHandle = handle && unique.find((r) => norm(r.linkedin_profile_url).includes(norm(handle)));
  if (byHandle) return byHandle;
  const exact = typed && unique.find((r) => norm(r.name) === norm(typed));
  if (exact) return exact;
  return unique[0] || null;
}

export default function useNomineeRecord({ name, email, link }) {
  const [record, setRecord] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const typed = String(name || '').trim().replace(/\s+/g, ' ');
    const mail = norm(email);
    const handle = handleOf(link);

    if (typed.length < 3 && !mail && !handle) {
      setRecord(null);
      setChecking(false);
      return undefined;
    }

    let active = true;
    setChecking(true);

    const timer = setTimeout(async () => {
      const queries = [];
      if (mail) queries.push({ nominee_email: mail });
      if (handle) queries.push({ linkedin_profile_url: { $regex: escapeRe(handle) } });
      if (typed.length >= 3) {
        queries.push({ name: { $regex: escapeRe(typed) } });
        const titled = titleCase(typed);
        if (titled !== typed) queries.push({ name: { $regex: escapeRe(titled) } });
      }

      let found = null;
      try {
        const pages = await Promise.all(queries.map((q) => base44.entities.Nominee.filter(q, { limit: 3 })));
        found = best(pages.flatMap(rows), { typed, mail, handle });
      } catch {
        // A lookup that cannot answer is simply no match: the fields stay as they are.
        found = null;
      }
      if (!active) return;
      setRecord(found);
      setChecking(false);
    }, 420);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [name, email, link]);

  return { record, checking };
}