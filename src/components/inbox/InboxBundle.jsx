import { Fragment } from 'react';
import InboxItemRow from './InboxItemRow';
import EnquiryDetail from './EnquiryDetail';
import EntryDetail from './EntryDetail';

// A bundle: one heading, its items, and a sweep that marks every unpinned item done.
export default function InboxBundle({ ownerEmail, label, items, states, onSet, showSweep, cursorKey, openKey, onOpen, onEnquiryStatus }) {
  if (!items.length) return null;
  const sweep = () => items.filter((i) => !states[i.key]?.pinned).forEach((i) => onSet(i.key, { done: true }));
  return (
    <section className="mb-3 rounded border border-editorial-navy/10 bg-white px-3 pt-2.5 md:mb-5 md:px-4 md:pt-3">
      <header className="flex items-center justify-between">
        <h3 className="pd-label">{label} · {items.length}</h3>
        {showSweep && (
          <button onClick={sweep} className="font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-editorial-copper">
            Sweep
          </button>
        )}
      </header>
      <ul>{items.map((i) => (
        <Fragment key={i.key}>
          <InboxItemRow item={i} state={states[i.key]} onSet={onSet} active={i.key === cursorKey} onOpen={onOpen} />
          {openKey === i.key && i.entry && <EntryDetail item={i} ownerEmail={ownerEmail} />}
          {openKey === i.key && i.enquiry && <EnquiryDetail item={i} enquiry={i.enquiry} onStatus={(s) => onEnquiryStatus(i, s)} />}
        </Fragment>
      ))}</ul>
    </section>
  );
}