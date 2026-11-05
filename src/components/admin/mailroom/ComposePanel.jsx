import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Eye, FilePlus2, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LetterForm from './LetterForm';
import IssuePreview from './IssuePreview';
import { emptyIssue, ISSUE_STATUS_TONE, issueStatusLabel } from './mailRoomConfig';

function payloadOf(issue, segmentName) {
  return {
    issue_no: Number(issue.issue_no) || 0,
    issue_date: String(issue.issue_date || ''),
    kicker: String(issue.kicker || ''),
    headline: String(issue.headline || '').trim(),
    standfirst: String(issue.standfirst || ''),
    sections: (issue.sections || []).map((story) => ({
      label: String(story?.label || ''),
      title: String(story?.title || ''),
      body: String(story?.body || ''),
      url: String(story?.url || ''),
    })),
    closing: String(issue.closing || ''),
    cta_label: String(issue.cta_label || ''),
    cta_url: String(issue.cta_url || ''),
    segment_id: String(issue.segment_id || ''),
    segment_name: segmentName,
  };
}

// THE COMPOSER — write the issue, read it as it will arrive, then post it to a segment.
//
// A letter is saved before it is posted, and every run is filed against its own id, so a
// send that runs out of time is resumed rather than repeated. The desk never says a letter
// was delivered: it reports what the mail service accepted, and what it refused.
export default function ComposePanel({ room }) {
  const { toast } = useToast();
  const [letters, setLetters] = useState([]);
  const [current, setCurrent] = useState(null);
  const [currentId, setCurrentId] = useState('');
  const [currentStatus, setCurrentStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState('');
  const [pending, setPending] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  const segments = room.data?.segments || [];
  const nextNumber = letters.length
    ? Math.max(...letters.map((letter) => Number(letter.issue_no) || 0)) + 1
    : 1;

  const loadLetters = useCallback(async () => {
    try {
      const page = await base44.entities.MailIssue.list({ sort: '-issue_no', limit: 12 });
      const items = page?.items || [];
      setLetters(items);
      return items;
    } catch (loadError) {
      setError(loadError?.message || 'The letters could not be read.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLetters().then((items) => {
      if (!items.length) setCurrent(emptyIssue(1));
    });
  }, [loadLetters]);

  useEffect(() => {
    if (!current && letters.length) openLetter(letters[0]);
  }, [letters, current]);

  function openLetter(letter) {
    setCurrent({
      issue_no: letter.issue_no || 1,
      issue_date: letter.issue_date || '',
      kicker: letter.kicker || 'The Dispatch',
      headline: letter.headline || '',
      standfirst: letter.standfirst || '',
      sections: (letter.sections || []).length
        ? letter.sections
        : emptyIssue().sections,
      closing: letter.closing || '',
      cta_label: letter.cta_label || '',
      cta_url: letter.cta_url || '',
      segment_id: letter.segment_id || '',
    });
    setCurrentId(letter.id);
    setCurrentStatus(letter.status || 'draft');
    setReceipt(null);
    setPending(null);
    setError('');
  }

  const segmentName = segments.find((segment) => segment.id === current?.segment_id)?.name || '';

  const save = async () => {
    const headline = String(current?.headline || '').trim();
    if (!headline) {
      toast({ title: 'A letter needs a headline', description: 'The headline is also the subject line.', variant: 'destructive' });
      return '';
    }
    setSaving(true);
    setError('');
    try {
      const payload = payloadOf(current, segmentName);
      if (currentId) {
        await base44.entities.MailIssue.update(currentId, payload);
      } else {
        const created = await base44.entities.MailIssue.create({ ...payload, status: 'draft' });
        setCurrentId(created.id);
      }
      await loadLetters();
      toast({ title: 'Letter saved' });
      return currentId || 'saved';
    } catch (saveError) {
      setError(saveError?.message || 'The letter could not be saved.');
      return '';
    } finally {
      setSaving(false);
    }
  };

  const requestPost = async () => {
    setError('');
    setReceipt(null);
    setPosting('checking');
    try {
      const payload = payloadOf(current, segmentName);
      let id = currentId;
      if (id) {
        await base44.entities.MailIssue.update(id, payload);
      } else {
        const created = await base44.entities.MailIssue.create({ ...payload, status: 'draft' });
        id = created.id;
        setCurrentId(id);
      }
      const res = await base44.functions.invoke('sendMailIssue', { issue_id: id, dry_run: true });
      if (res?.data?.error) throw new Error(res.data.error);
      setPending({ id, ...res.data });
    } catch (postError) {
      setError(postError?.response?.data?.error || postError?.message || 'The cohort could not be read.');
    } finally {
      setPosting('');
    }
  };

  const confirmPost = async () => {
    const id = pending?.id;
    if (!id) return;
    setPending(null);
    setPosting('sending');
    setError('');
    let sent = 0;
    let failed = 0;
    let last = null;
    try {
      for (let round = 0; round < 8; round += 1) {
        const res = await base44.functions.invoke('sendMailIssue', { issue_id: id });
        const data = res?.data || {};
        if (data.error) throw new Error(data.error);
        last = data;
        sent += Number(data.sent) || 0;
        failed += Number(data.failed) || 0;
        if (!data.remaining) break;
      }
      setReceipt({
        sent,
        failed,
        remaining: Number(last?.remaining) || 0,
        cohort: Number(last?.cohort) || 0,
        failures: last?.failures || [],
      });
      setCurrentStatus(Number(last?.remaining) ? 'sending' : 'sent');
      await loadLetters();
    } catch (postError) {
      setError(postError?.response?.data?.error || postError?.message || 'The post stopped part way.');
    } finally {
      setPosting('');
    }
  };

  if (loading || !current) {
    return (
      <div className="desk-plate px-4 py-10 text-center">
        <p className="text-xs" style={{ color: '#7d94aa' }}>Opening the composer…</p>
      </div>
    );
  }

  const alreadyPosted = currentStatus === 'sent';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {letters.slice(0, 4).map((letter) => (
            <button
              key={letter.id}
              onClick={() => openLetter(letter)}
              className="inline-flex max-w-[210px] items-center gap-1.5 rounded px-2 py-1 text-[10px]"
              style={{
                border: '1px solid rgba(201,168,124,0.24)',
                background: letter.id === currentId ? 'rgba(201,168,124,0.16)' : 'transparent',
                color: letter.id === currentId ? '#f5efe4' : '#a3b8c9',
              }}
            >
              <span style={{ color: ISSUE_STATUS_TONE[letter.status] || '#c9a87c' }}>●</span>
              <span className="truncate">{letter.headline || 'Untitled'}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCurrent(emptyIssue(nextNumber));
              setCurrentId('');
              setCurrentStatus('draft');
              setReceipt(null);
              setPending(null);
              setError('');
            }}
            className="desk-key desk-key-quiet"
          >
            <FilePlus2 className="h-3.5 w-3.5" /> New letter
          </button>
          <button onClick={save} disabled={saving} className="desk-key">
            {saving ? 'Saving…' : 'Save draft'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="desk-plate p-3.5">
          <LetterForm issue={current} segments={segments} seasons={room.data?.seasons || []} onChange={setCurrent} />

          <div className="mt-4 border-t pt-3" style={{ borderColor: 'rgba(250,248,245,0.08)' }}>
            {pending ? (
              <div className="rounded-md p-3" style={{ background: 'rgba(184,115,51,0.14)', border: '1px solid rgba(201,168,124,0.4)' }}>
                <p className="text-xs font-semibold" style={{ color: '#f5efe4' }}>
                  Post “{current.headline}” to {pending.cohort.toLocaleString()} addresses?
                </p>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: '#a3b8c9' }}>
                  {pending.queued.toLocaleString()} will be written to now
                  {pending.already_sent ? ` · ${pending.already_sent.toLocaleString()} already filed on this letter` : ''}
                  {pending.queued === 0 ? ' · nobody is left to write to' : ''}.
                </p>
                <div className="mt-2.5 flex gap-2">
                  <button
                    onClick={confirmPost}
                    disabled={pending.queued === 0}
                    className="desk-key desk-key-primary"
                  >
                    <Send className="h-3.5 w-3.5" /> Post it
                  </button>
                  <button onClick={() => setPending(null)} className="desk-key desk-key-quiet">
                    Not yet
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={requestPost} disabled={posting !== '' || alreadyPosted} className="desk-key desk-key-primary">
                  <Send className="h-3.5 w-3.5" />
                  {posting === 'checking'
                    ? 'Reading the cohort…'
                    : posting === 'sending'
                      ? 'Posting…'
                      : alreadyPosted
                        ? 'Already posted'
                        : currentStatus === 'sending'
                          ? 'Resume the post'
                          : 'Post this issue'}
                </button>
                <p className="text-[10px]" style={{ color: '#7d94aa' }}>
                  {segmentName ? `Addressed to ${segmentName}.` : 'Addressed to everyone the house can reach.'}
                </p>
              </div>
            )}

            {error && (
              <p className="mt-2.5 rounded px-2.5 py-2 text-[11px]" style={{ background: 'rgba(242,161,161,0.1)', color: '#f2a1a1' }}>
                {error}
              </p>
            )}

            {receipt && (
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                {[
                  ['Accepted', receipt.sent, '#7ec89a'],
                  ['Refused', receipt.failed, '#f2a1a1'],
                  ['Left', receipt.remaining, '#c9a87c'],
                ].map(([label, value, tone]) => (
                  <div key={label} className="rounded px-2 py-1.5" style={{ background: 'rgba(6,12,20,0.5)' }}>
                    <p className="text-[8.5px] font-bold uppercase tracking-[0.16em]" style={{ color: '#7d94aa' }}>{label}</p>
                    <p className="font-heading text-lg leading-none tabular-nums" style={{ color: tone }}>
                      {Number(value).toLocaleString()}
                    </p>
                  </div>
                ))}
                {receipt.failures?.length > 0 && (
                  <p className="col-span-3 text-[10px] leading-relaxed" style={{ color: '#f2a1a1' }}>
                    {receipt.failures[0].email}: {receipt.failures[0].reason}
                  </p>
                )}
                {receipt.remaining > 0 && (
                  <p className="col-span-3 text-[10px]" style={{ color: '#c9a87c' }}>
                    The post stopped at its call budget. Post again to finish the remaining addresses — nobody is written to twice.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="xl:sticky xl:top-3 xl:self-start">
          <div className="mb-2 flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.24em]" style={{ color: '#c9a87c' }}>
              <Eye className="h-3 w-3" /> As it arrives
            </p>
            <p className="text-[10px]" style={{ color: '#7d94aa' }}>
              {issueStatusLabel(currentStatus)}
            </p>
          </div>
          <div className="desk-plate p-2">
            <IssuePreview issue={current} />
          </div>
        </div>
      </div>
    </div>
  );
}