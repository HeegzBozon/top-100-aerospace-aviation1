const LOGO =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png';

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = 'Arial, Helvetica, sans-serif';
const INK = '#1e3a5a';
const DEEP = '#8f5c2c';
const ROSE = '#c9a87c';
const COVER = '#0e1e30';

const pad = (n) => String(n).padStart(2, '0');

// THE LETTER AS IT WILL ARRIVE — the same shell base44/shared/mailShell.ts renders, shown on
// the desk while it is being written. What an editor approves here is what reaches an inbox:
// the cover plate, the numbered signals, the closing held as a pull-quote and the one key at
// the foot do not change. The two files move together.
export default function IssuePreview({ issue, firstName = 'Reader' }) {
  const meta = [issue?.issue_no ? `No ${issue.issue_no}` : '', issue?.issue_date || '']
    .filter(Boolean)
    .join('  ·  ');
  const signals = (issue?.sections || []).filter(
    (story) => String(story?.title || '').trim() || String(story?.body || '').trim(),
  );

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
        <div style={{ background: '#faf8f5', padding: '18px 26px 15px' }}>
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 15, fontStyle: 'italic', color: INK }}>
            Dear {firstName},
          </p>
        </div>

        <div style={{ padding: '0 26px' }}>
          {signals.length === 0 && (
            <p style={{ margin: 0, padding: '18px 0', fontFamily: SANS, fontSize: 12, color: '#8fa6bb' }}>
              The signals you file will be printed here, in order, numbered like an index.
            </p>
          )}

          {signals.map((story, index) => (
            <div key={index}>
              {index > 0 && <div style={{ height: 1, background: '#e8dfd2' }} />}
              <div className="flex gap-3" style={{ padding: '16px 0 18px' }}>
                <p
                  style={{
                    margin: 0,
                    width: 34,
                    flex: 'none',
                    fontFamily: SERIF,
                    fontSize: 17,
                    lineHeight: 1,
                    color: ROSE,
                  }}
                >
                  {pad(index + 1)}
                </p>
                <div style={{ minWidth: 0, flex: 1 }}>
                  {String(story?.label || '').trim() && (
                    <p
                      style={{
                        margin: '0 0 5px',
                        fontFamily: SANS,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        color: DEEP,
                      }}
                    >
                      {story.label}
                    </p>
                  )}
                  {String(story?.title || '').trim() && (
                    <p
                      style={{
                        margin: '0 0 7px',
                        fontFamily: SERIF,
                        fontSize: 17,
                        fontWeight: 700,
                        lineHeight: 1.28,
                        color: INK,
                      }}
                    >
                      {story.title}
                    </p>
                  )}
                  {String(story?.body || '').trim() && (
                    <p style={{ margin: 0, fontFamily: SANS, fontSize: 12, lineHeight: 1.65, color: INK }}>
                      {story.body}
                    </p>
                  )}
                  {String(story?.url || '').trim() && (
                    <p style={{ margin: '9px 0 0', fontFamily: SANS, fontSize: 11, fontWeight: 700, color: DEEP }}>
                      <span style={{ borderBottom: `1px solid ${ROSE}`, paddingBottom: 1 }}>
                        {story.label || 'Read it'} →
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {String(issue?.closing || '').trim() && (
          <div style={{ padding: '4px 26px 0' }}>
            <div style={{ background: '#faf8f5', borderLeft: '2px solid #b87333', padding: '15px 17px' }}>
              <p style={{ margin: 0, fontFamily: SERIF, fontSize: 14, fontStyle: 'italic', lineHeight: 1.55, color: INK }}>
                {issue.closing}
              </p>
            </div>
          </div>
        )}

        {String(issue?.cta_label || '').trim() && (
          <div style={{ padding: '20px 26px 26px' }}>
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