import { Fragment } from 'react';
import InboxItemRow from './InboxItemRow';
import EnquiryDetail from './EnquiryDetail';

// A bundle: one heading, its items, and a sweep that marks every unpinned item done.
export default function InboxBundle({ label, items, states, onSet, showSweep, cursorKey, openKey, onOpen, onEnquiryStatus }) {
  if (!items.length) return null;
  const sweep = () => items.filter((i) => !states[i.key]?.pinned).forEach((i) => onSet(i.key, { done: true }));
  return (
    <section className="mb-5 rounded border border-editorial-navy/10 bg-white px-4 pt-3">
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
          {openKey === i.key && i.enquiry && <EnquiryDetail enquiry={i.enquiry} onStatus={(s) => onEnquiryStatus(i, s)} />}
        </Fragment>
      ))}</ul>
    </section>
  );
}