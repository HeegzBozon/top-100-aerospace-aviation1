import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { APPROVALS, APPROVAL_STATES, DESK, P, day } from './patronConfig';

// The internal gates, as a row of seats rather than a checkbox. Each gate names the seat that
// holds it and records the day it was cleared and who entered it, because "approved" without
// a name and a date is not an approval the house can stand behind.
//
// Beside them, the two instruments that make a slot real: the agreement and the settlement.

const AGREEMENT_STATES = [
  { key: 'none', label: 'Not started' },
  { key: 'sent', label: 'Sent' },
  { key: 'signed', label: 'Signed' },
  { key: 'declined', label: 'Declined' },
];

const PAYMENT_STATES = [
  { key: 'none', label: 'Not invoiced' },
  { key: 'invoiced', label: 'Invoiced' },
  { key: 'paid', label: 'Settled' },
  { key: 'void', label: 'Void' },
];

export default function DealGates({ deal, user, onChanged }) {
  const [busy, setBusy] = useState('');
  const gates = deal.approvals || {};
  const agreement = deal.agreement || {};
  const payment = deal.payment || {};

  const write = async (patch, label) => {
    setBusy(label);
    try {
      await base44.entities.PatronDeal.update(deal.id, patch);
      await onChanged?.();
    } finally {
      setBusy('');
    }
  };

  const recordGate = (key, status, holder) =>
    write(
      {
        approvals: {
          ...gates,
          [key]: {
            status,
            approver: holder,
            date: new Date().toISOString().slice(0, 10),
            note: `Entered by ${user?.email || 'the desk'}`,
          },
        },
      },
      key,
    );

  return (
    <div className={`${DESK.card} p-4`} style={{ borderColor: P.hair }}>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5" style={{ color: P.copper }} />
        <p className={DESK.label} style={{ color: P.copper }}>
          Clearances
        </p>
      </div>

      <ul className="mt-2.5 space-y-2">
        {APPROVALS.map((gate) => {
          const entry = gates[gate.key] || {};
          const current = entry.status || 'pending';
          return (
            <li key={gate.key} className="border-t pt-2 first:border-t-0 first:pt-0" style={{ borderColor: P.hair }}>
              <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                <p className="text-[11px] font-bold" style={{ color: P.navy }}>
                  {gate.label}
                  <span className="ml-1.5 text-[8.5px] font-normal uppercase tracking-[0.14em]" style={{ color: P.faint }}>
                    {gate.holder}
                  </span>
                </p>
                <p className="text-[8.5px] uppercase tracking-[0.12em]" style={{ color: P.faint }}>
                  {entry.date ? day(entry.date) : 'Not cleared'}
                </p>
              </div>
              <p className="mt-0.5 text-[10px] leading-relaxed" style={{ color: P.muted }}>
                {gate.why}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {APPROVAL_STATES.map((state) => {
                  const active = current === state.key;
                  return (
                    <button
                      key={state.key}
                      type="button"
                      disabled={busy === gate.key}
                      onClick={() => recordGate(gate.key, state.key, gate.holder)}
                      className="rounded-full px-2 py-1 text-[7.5px] font-bold uppercase tracking-[0.12em]"
                      style={{
                        background: active ? P.navy : 'white',
                        color: active ? P.cream : P.muted,
                        border: `1px solid ${active ? P.navy : P.hair}`,
                      }}
                    >
                      {state.label}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 grid gap-3 border-t pt-3 md:grid-cols-2" style={{ borderColor: P.hair }}>
        <div>
          <p className={DESK.label} style={{ color: P.copper }}>
            The agreement
          </p>
          <select
            className={`${DESK.input} mt-1.5`}
            style={{ borderColor: P.hair, color: P.navy }}
            value={agreement.status || 'none'}
            onChange={(event) => write({ agreement: { ...agreement, status: event.target.value } }, 'agreement')}
          >
            {AGREEMENT_STATES.map((state) => (
              <option key={state.key} value={state.key}>
                {state.label}
              </option>
            ))}
          </select>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <input
              className={DESK.input}
              style={{ borderColor: P.hair, color: P.navy }}
              defaultValue={agreement.version || ''}
              placeholder="Version"
              onBlur={(event) => write({ agreement: { ...agreement, version: event.target.value } }, 'agreement')}
            />
            <input
              type="date"
              className={DESK.input}
              style={{ borderColor: P.hair, color: P.navy }}
              value={agreement.signed_date || ''}
              onChange={(event) => write({ agreement: { ...agreement, signed_date: event.target.value } }, 'agreement')}
            />
          </div>
        </div>

        <div>
          <p className={DESK.label} style={{ color: P.copper }}>
            Settlement
          </p>
          <select
            className={`${DESK.input} mt-1.5`}
            style={{ borderColor: P.hair, color: P.navy }}
            value={payment.status || 'none'}
            onChange={(event) => write({ payment: { ...payment, status: event.target.value } }, 'payment')}
          >
            {PAYMENT_STATES.map((state) => (
              <option key={state.key} value={state.key}>
                {state.label}
              </option>
            ))}
          </select>
          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
            <input
              className={DESK.input}
              style={{ borderColor: P.hair, color: P.navy }}
              defaultValue={payment.reference || ''}
              placeholder="Invoice ref"
              onBlur={(event) => write({ payment: { ...payment, reference: event.target.value } }, 'payment')}
            />
            <input
              type="date"
              className={DESK.input}
              style={{ borderColor: P.hair, color: P.navy }}
              value={payment.paid_date || ''}
              onChange={(event) => write({ payment: { ...payment, paid_date: event.target.value } }, 'payment')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}