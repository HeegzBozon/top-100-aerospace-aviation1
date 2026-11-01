import { Bot, Loader2, Paperclip } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useAgentHandoff from './useAgentHandoff';

export const entryContext = (e) => [
  `Type: ${e.kind}`, `Title: ${e.title}`, e.person_name && `With: ${e.person_name}`,
  e.due_date && `Follow up by: ${e.due_date}`, e.file_name && `Attached: ${e.file_name}`, `Notes: ${e.body || '(none)'}`,
].filter(Boolean).join('\n');

const btn = 'inline-flex items-center gap-1 rounded border px-2.5 py-1.5 font-body text-[11px] font-semibold uppercase tracking-[0.12em]';

// A captured entry opened: its notes, its file, and the Superagent's suggested next step.
export default function EntryDetail({ item, ownerEmail }) {
  const e = item.entry;
  const { handoff, status, handOver, close } = useAgentHandoff(item.key);
  const openFile = async () => window.open((await base44.integrations.Core.CreateFileSignedUrl({ file_uri: e.file_uri })).signed_url, '_blank');
  const ask = () => handOver({ owner_email: ownerEmail, source_title: e.title, context: entryContext(e),
    instruction: 'Suggest the next action, a follow-up message and any task to keep this relationship moving' });

  return (
    <div className="-mx-3 border-b border-editorial-navy/10 bg-editorial-cream px-3 py-3 md:-mx-4 md:px-4">
      {e.body && <p className="whitespace-pre-line font-body text-sm text-editorial-navy">{e.body}</p>}
      {e.file_uri && <button onClick={openFile} className={`${btn} mt-2 border-editorial-navy/20 text-editorial-navy`}><Paperclip className="h-3 w-3" /> {e.file_name || 'Open file'}</button>}
      <div className="mt-3 border-t border-editorial-navy/10 pt-2.5">
        <p className="pd-label flex items-center gap-1.5"><Bot className="h-3.5 w-3.5" /> Next action</p>
        {status === 'loading' ? <Loader2 className="mt-2 h-3.5 w-3.5 animate-spin text-editorial-copper" />
          : !handoff ? <button onClick={ask} className={`${btn} mt-2 border-editorial-copper/60 text-editorial-navy`}>Ask my Superagent</button>
          : handoff.status === 'requested' ? (
            <p className="mt-1 font-body text-xs text-editorial-navy/70">With your Superagent. Ask it to "draft my pending inbox handoffs" and its suggestion appears here.</p>
          ) : (<>
            {handoff.summary && <p className="mt-1 font-body text-xs italic text-editorial-navy/70">{handoff.summary}</p>}
            <p className="mt-2 whitespace-pre-line font-body text-sm text-editorial-navy">{handoff.draft_reply}</p>
            <div className="mt-2 flex gap-1.5">
              <button onClick={() => close('used')} className={`${btn} border-editorial-copper bg-editorial-copper text-editorial-cream`}>Got it</button>
              <button onClick={() => close('dismissed')} className={`${btn} border-editorial-navy/20 text-editorial-navy`}>Set aside</button>
            </div>
          </>)}
      </div>
    </div>
  );
}