const LOGO =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png';

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = 'Arial, Helvetica, sans-serif';
const INK = '#1e3a5a';
const MUTED = '#4a6b8a';
const DEEP = '#8f5c2c';
const ROSE = '#c9a87c';
const COVER = '#0e1e30';
const CREAM = '#faf8f5';
const HAIR = '#e8dfd2';

const pad = (n) => String(n).padStart(2, '0');

// The gist, set bold: the first sentence of a body is the line a reader can take in while the
// rest is still arriving. A one-sentence body stays plain — bolding all of it emphasises nothing.
function Gist({ body, size }) {
  const text = String(body || '').trim();
  const match = text.match(/^([^.!?\n]{1,200}[.!?])\s+/);
  const rest = match ? text.slice(match[1].length).trim() : '';
  return (
    <p style={{ margin: 0, fontFamily: SANS, fontSize: size, lineHeight: 1.68, color: INK }}>
      {match && rest ? (
        <>
          <strong style={{ fontWeight: 700 }}>{match[1]}</strong> {rest}
        </>
      ) : (
        text
      )}
    </p>
  );
}

function Rubric({ label }) {
  return (
    <div className="flex items-center gap-2.5" style={{ marginBottom: 9 }}>
      <span
        style={{
          fontFamily: SANS,
          fontSize: 8.5,
          fontWeight: 700,
          letterSpacing: '2.2px',
          textTransform: 'uppercase',
          color: DEEP,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span style={{ flex: 1, height: 1, background: ROSE, opacity: 0.6 }} />
    </div>
  );
}

// THE LETTER AS IT WILL ARRIVE — the shell base44/shared/mailShell.ts renders, shown on the
// desk while it is being written. The brief shape does not change here: the cover plate, the
// greeting, the lead item, the shorter items, the quick hits, the closing and the one key at
// the foot. What an editor approves here is what reaches an inbox, so the two files move
// together.
export default function IssuePreview({ issue, firstName = 'Reader' }) {
  const meta = [issue?.issue_no ? `No ${issue.issue_no}` : '', issue?.issue_date || '']
    .filter(Boolean)
    .join('  ·  ');
  const items = (issue?.sections || []).filter(
    (story) => String(story?.title || '').trim() || String(story?.body || '').trim(),
  );
  const quick = (issue?.quick_links || []).filter((link) => String(link?.title || '').trim());

  return (
    <div className="overflow-hidden rounded-sm" style={{ background: COVER }}>
      {/* THE COVER PLATE */}
      <div style={{ height: 4, background: '#b87333' }} />
      <div style={{ background: COVER, padding: '22px 26px 0' }}>
        <div className="flex items-center gap-2.5">
          <img src={LOGO} alt="" width="32" height="32" style={{ display: 'block', width: 32, height: 32 }} />
          <p
            style={{
              margin: 0,
              fontFamily: SANS,
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '2.4px',
              textTransform: 'uppercase',
              color: '#f3ead9',
            }}
          >
            TOP 100 Aerospace &amp; Aviation
          </p>
        </div>
        <div style={{ height: 1, background: 'rgba(201,168,124,0.42)', margin: '18px 0 0' }} />
        <p
          style={{
            margin: '18px 0 0',
            fontFamily: SANS,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: ROSE,
          }}
        >
          {issue?.kicker || 'The Dispatch'}
        </p>
        <h3
          style={{
            margin: '10px 0 0',
            fontFamily: SERIF,
            fontSize: 27,
            lineHeight: 1.14,
            fontWeight: 700,
            color: issue?.headline ? '#f7f2e8' : '#4b637a',
          }}
        >
          {issue?.headline || 'The headline goes here'}
        </h3>
        <p style={{ margin: '12px 0 0', fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: '#bcccda' }}>
          {issue?.standfirst || 'One sentence under the headline, carried as the preview line.'}
        </p>
        <p
          style={{
            margin: '20px 0 0',
            paddingBottom: 22,
            fontFamily: SANS,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '2.4px',
            textTransform: 'uppercase',
            color: ROSE,
          }}
        >
          {meta || 'No 1'}
        </p>
      </div>

      {/* THE PAPER */}
      <div style={{ background: '#ffffff' }}>
        <div style={{ background: CREAM, padding: '17px 26px 15px' }}>
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 16, lineHeight: 1.35, color: INK }}>
            Morning, {firstName}.
          </p>
          <p style={{ margin: '5px 0 0', fontFamily: SANS, fontSize: 9.5, lineHeight: 1.5, color: MUTED }}>
            What the record needs you to know this week.
          </p>
        </div>

        {items.length === 0 && (
          <p style={{ margin: 0, padding: '18px 26px', fontFamily: SANS, fontSize: 12, color: '#8fa6bb' }}>
            The items you file will be printed here — the gist first, then why it matters.
          </p>
        )}

        {items.map((story, index) => (
          <div key={index} style={{ padding: index === 0 ? '22px 26px 0' : '18px 26px 0' }}>
            {index > 0 && <div style={{ height: 1, background: HAIR, marginBottom: 18 }} />}
            {String(story?.label || '').trim() && <Rubric label={story.label} />}
            {String(story?.title || '').trim() && (
              <p
                style={{
                  margin: '0 0 8px',
                  fontFamily: SERIF,
                  fontSize: index === 0 ? 20 : 16,
                  fontWeight: 700,
                  lineHeight: 1.26,
                  color: INK,
                }}
              >
                {story.title}
              </p>
            )}
            {String(story?.body || '').trim() && <Gist body={story.body} size={index === 0 ? 12.5 : 12} />}
            {String(story?.url || '').trim() && (
              <p style={{ margin: '10px 0 0', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: DEEP }}>
                <span style={{ borderBottom: `1px solid ${ROSE}`, paddingBottom: 1 }}>
                  {story.label || (index === 0 ? 'Read it' : 'More')} →
                </span>
              </p>
            )}
          </div>
        ))}

        {quick.length > 0 && (
          <div style={{ padding: '22px 26px 0' }}>
            <div style={{ background: CREAM, borderLeft: `2px solid ${ROSE}`, padding: '15px 17px' }}>
              <p
                style={{
                  margin: '0 0 10px',
                  fontFamily: SANS,
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: '2.2px',
                  textTransform: 'uppercase',
                  color: DEEP,
                }}
              >
                Also on the record
              </p>
              {quick.map((link, index) => (
                <p
                  key={index}
                  style={{
                    margin: index === 0 ? 0 : '9px 0 0',
                    paddingTop: index === 0 ? 0 : 9,
                    borderTop: index === 0 ? 'none' : `1px solid ${HAIR}`,
                    fontFamily: SANS,
                    fontSize: 11.5,
                    lineHeight: 1.5,
                    fontWeight: 600,
                    color: INK,
                  }}
                >
                  {link.title} <span style={{ color: '#b87333', fontWeight: 700 }}>→</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {String(issue?.closing || '').trim() && (
          <div style={{ padding: '20px 26px 0' }}>
            <div style={{ background: CREAM, borderLeft: '2px solid #b87333', padding: '15px 17px' }}>
              <p style={{ margin: 0, fontFamily: SERIF, fontSize: 14, fontStyle: 'italic', lineHeight: 1.55, color: INK }}>
                {issue.closing}
              </p>
            </div>
          </div>
        )}

        {String(issue?.cta_label || '').trim() && (
          <div style={{ padding: '22px 26px 26px' }}>
            <span
              style={{
                display: 'inline-block',
                background: DEEP,
                borderRadius: 3,
                borderBottom: '2px solid #6f451f',
                padding: '12px 22px',
                fontFamily: SANS,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: '1.8px',
                textTransform: 'uppercase',
                color: '#fdf8f0',
              }}
            >
              {issue.cta_label}
            </span>
          </div>
        )}
      </div>

      {/* THE FOOT */}
      <div style={{ height: 2, background: '#b87333' }} />
      <div style={{ background: COVER, padding: '18px 26px 0' }}>
        <p style={{ margin: 0, fontFamily: SERIF, fontSize: 13.5, color: ROSE }}>
          The record, one brief at a time.
        </p>
        <p
          style={{
            margin: '10px 0 14px',
            fontFamily: SANS,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '2.2px',
            textTransform: 'uppercase',
            color: '#9fb4c7',
          }}
        >
          top100aero.space · Est. 2022
        </p>
        <div style={{ height: 1, background: 'rgba(201,168,124,0.28)' }} />
        <p style={{ margin: '12px 0 0', paddingBottom: 20, fontFamily: SANS, fontSize: 10, lineHeight: 1.7, color: '#7d94aa' }}>
          You are reading this because you joined the Dispatch or hold a record in the house.
          <span style={{ color: '#a3b8c9', textDecoration: 'underline' }}> Leave the list</span>.
        </p>
      </div>
    </div>
  );
}