import { Plus, X } from 'lucide-react';
import { describeRules } from './mailRoomConfig';

const input =
  'w-full rounded-md px-2.5 py-1.5 text-xs outline-none placeholder:text-[#5f7387]';
const style = {
  background: 'rgba(6,12,20,0.55)',
  color: '#efe9dc',
  border: '1px solid rgba(201,168,124,0.22)',
};

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: '#7d94aa' }}>
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {hint && <span className="mt-1 block text-[10px]" style={{ color: '#5f7387' }}>{hint}</span>}
    </label>
  );
}

// THE LETTER'S FIVE PARTS. An editor fills them; they do not rearrange them. That is the
// whole point of a house style: every issue arrives the same shape, so the only thing that
// changes week to week is what the house has to say.
export default function LetterForm({ issue, segments, seasons = [], onChange }) {
  const patch = (changes) => onChange({ ...issue, ...changes });
  const patchSection = (index, changes) =>
    onChange({
      ...issue,
      sections: (issue.sections || []).map((story, position) =>
        position === index ? { ...story, ...changes } : story,
      ),
    });

  const selected = segments.find((segment) => segment.id === issue.segment_id);
  const links = issue.quick_links || [];
  const patchLink = (index, changes) =>
    onChange({
      ...issue,
      quick_links: links.map((link, position) => (position === index ? { ...link, ...changes } : link)),
    });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Field label="No">
          <input
            value={issue.issue_no ?? ''}
            onChange={(event) => patch({ issue_no: Number(event.target.value) || 0 })}
            className={input}
            style={style}
            inputMode="numeric"
          />
        </Field>
        <div className="col-span-2">
          <Field label="Dated">
            <input
              value={issue.issue_date || ''}
              onChange={(event) => patch({ issue_date: event.target.value })}
              className={input}
              style={style}
            />
          </Field>
        </div>
      </div>

      <Field label="Kicker">
        <input
          value={issue.kicker || ''}
          onChange={(event) => patch({ kicker: event.target.value })}
          placeholder="The Dispatch · Weekly"
          className={input}
          style={style}
        />
      </Field>

      <Field label="Headline" hint="Also the subject line. State the substance; never tease it.">
        <input
          value={issue.headline || ''}
          onChange={(event) => patch({ headline: event.target.value })}
          placeholder="Three signals from the record this week"
          className={input}
          style={style}
        />
      </Field>

      <Field label="Standfirst" hint="One sentence, carried as the inbox preview line.">
        <input
          value={issue.standfirst || ''}
          onChange={(event) => patch({ standfirst: event.target.value })}
          placeholder="What moved, and who moved it."
          className={input}
          style={style}
        />
      </Field>

      <div className="space-y-2 border-t pt-3" style={{ borderColor: 'rgba(250,248,245,0.08)' }}>
        <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: '#c9a87c' }}>
          Signals · three slots, the last two may stay empty
        </p>
        {(issue.sections || []).map((story, index) => (
          <div key={index} className="rounded-md p-2.5" style={{ background: 'rgba(6,12,20,0.4)' }}>
            <div className="grid grid-cols-3 gap-2">
              <Field label={`Slot ${index + 1}`}>
                <input
                  value={story.label || ''}
                  onChange={(event) => patchSection(index, { label: event.target.value })}
                  placeholder="Launch"
                  className={input}
                  style={style}
                />
              </Field>
              <div className="col-span-2">
                <Field label="Title">
                  <input
                    value={story.title || ''}
                    onChange={(event) => patchSection(index, { title: event.target.value })}
                    placeholder="What happened, in a line"
                    className={input}
                    style={style}
                  />
                </Field>
              </div>
            </div>
            <div className="mt-2">
              <Field label="The gist" hint="The first sentence is set bold. Everything after it says why it matters.">
                <textarea
                  value={story.body || ''}
                  onChange={(event) => patchSection(index, { body: event.target.value })}
                  rows={2}
                  placeholder="The gist in one sentence. Then why it matters to the reader."
                  className={`${input} resize-y`}
                  style={style}
                />
              </Field>
            </div>
            <div className="mt-2">
              <Field label="Link">
                <input
                  value={story.url || ''}
                  onChange={(event) => patchSection(index, { url: event.target.value })}
                  placeholder="/profiles/… or https://top100aero.space/…"
                  className={input}
                  style={style}
                />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t pt-3" style={{ borderColor: 'rgba(250,248,245,0.08)' }}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: '#c9a87c' }}>
            Also on the record · {links.length}/5
          </p>
          {links.length < 5 && (
            <button
              type="button"
              onClick={() => patch({ quick_links: [...links, { title: '', url: '' }] })}
              className="desk-key desk-key-quiet"
            >
              <Plus className="h-3 w-3" /> Add line
            </button>
          )}
        </div>
        {!links.length && (
          <p className="text-[10px]" style={{ color: '#5f7387' }}>
            Optional quick hits under the brief: one line and a link each, printed as the letter closes.
          </p>
        )}
        {links.map((link, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-end gap-1.5">
            <Field label={`Line ${index + 1}`}>
              <input
                value={link.title || ''}
                onChange={(event) => patchLink(index, { title: event.target.value })}
                placeholder="What is behind it"
                className={input}
                style={style}
              />
            </Field>
            <Field label="Link">
              <input
                value={link.url || ''}
                onChange={(event) => patchLink(index, { url: event.target.value })}
                placeholder="/profiles/… or https://…"
                className={input}
                style={style}
              />
            </Field>
            <button
              type="button"
              onClick={() => patch({ quick_links: links.filter((_, position) => position !== index) })}
              className="mb-1 rounded p-1 hover:bg-white/10"
              title="Remove this line"
            >
              <X className="h-3 w-3" style={{ color: '#7d94aa' }} />
            </button>
          </div>
        ))}
      </div>

      <Field label="Closing" hint="The line the letter signs off with.">
        <textarea
          value={issue.closing || ''}
          onChange={(event) => patch({ closing: event.target.value })}
          rows={2}
          placeholder="Ad Astra. The record keeps itself."
          className={`${input} resize-y`}
          style={style}
        />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Key">
          <input
            value={issue.cta_label || ''}
            onChange={(event) => patch({ cta_label: event.target.value })}
            placeholder="Read the record"
            className={input}
            style={style}
          />
        </Field>
        <Field label="Where it goes">
          <input
            value={issue.cta_url || ''}
            onChange={(event) => patch({ cta_url: event.target.value })}
            placeholder="https://top100aero.space"
            className={input}
            style={style}
          />
        </Field>
      </div>

      <Field
        label="Addressed to"
        hint={selected ? describeRules(selected.rules, seasons) : 'Everyone the house can reach, minus anyone who left the list.'}
      >
        <select
          value={issue.segment_id || ''}
          onChange={(event) => patch({ segment_id: event.target.value })}
          className={input}
          style={style}
        >
          <option value="" style={{ color: '#111' }}>Everyone reachable</option>
          {segments.map((segment) => (
            <option key={segment.id} value={segment.id} style={{ color: '#111' }}>
              {segment.name} · {segment.count.toLocaleString()}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}