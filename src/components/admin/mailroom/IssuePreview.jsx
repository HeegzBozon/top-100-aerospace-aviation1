const LOGO =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png';

const SERIF = "'Playfair Display', Georgia, serif";
const SANS = 'Arial, Helvetica, sans-serif';

// THE LETTER AS IT WILL ARRIVE — the same shell the send function renders, shown on the
// desk while it is being written. What an editor approves here is what reaches an inbox:
// the band, the rule, the three signals and the one key at the foot do not change.
export default function IssuePreview({ issue, firstName = 'Reader' }) {
  const meta = [
    issue?.issue_no ? `No ${issue.issue_no}` : '',
    issue?.issue_date || '',
  ].filter(Boolean).join(' · ');
  const signals = (issue?.sections || []).filter(
    (story) => String(story?.title || '').trim() || String(story?.body || '').trim(),
  );

  return (
    <div className="overflow-hidden rounded-sm" style={{ background: '#070c16' }}>
      <div style={{ background: '#ffffff' }}>
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ background: '#b87333' }}
        >
          <img src={LOGO} alt="" width="34" height="34" style={{ display: 'block', width: 34, height: 34 }} />
          <p style={{ margin: 0, fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: '#000000' }}>
            TOP 100 Aerospace &amp; Aviation
          </p>
        </div>

        {meta && (
          <div
            className="px-6 pb-3"
            style={{
              background: '#b87333',
              fontFamily: SANS,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '2.2px',
              textTransform: 'uppercase',
              color: '#000000',
            }}
          >
            {meta}
          </div>
        )}

        <div className="px-6 pt-6">
          <p
            style={{
              margin: '0 0 8px',
              fontFamily: SANS,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#8f5c2c',
            }}
          >
            {issue?.kicker || 'The Dispatch'}
          </p>
          <h3
            style={{
              margin: '0 0 10px',
              fontFamily: SERIF,
              fontSize: 26,
              lineHeight: 1.15,
              fontWeight: 700,
              color: issue?.headline ? '#1e3a5a' : '#8fa6bb',
            }}
          >
            {issue?.headline || 'The headline goes here'}
          </h3>
          <p style={{ margin: 0, fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: '#1e3a5a' }}>
            {issue?.standfirst || 'One sentence under the headline, carried as the preview line.'}
          </p>
        </div>

        <div className="mx-6 mt-4" style={{ height: 2, background: '#b87333' }} />

        <div className="px-6 pt-4">
          <p style={{ margin: 0, fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: '#1e3a5a' }}>
            Dear {firstName},
          </p>

          {signals.length === 0 && (
            <p className="py-4" style={{ margin: 0, fontFamily: SANS, fontSize: 12, color: '#8fa6bb' }}>
              The signals you file will be printed here, in order.
            </p>
          )}

          {signals.map((story, index) => (
            <div key={index} className="pt-4">
              {index > 0 && <div className="mb-3" style={{ height: 1, background: '#e5e5e5' }} />}
              {String(story?.label || '').trim() && (
                <p
                  style={{
                    margin: '0 0 5px',
                    fontFamily: SANS,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '1.8px',
                    textTransform: 'uppercase',
                    color: '#8f5c2c',
                  }}
                >
                  {story.label}
                </p>
              )}
              {String(story?.title || '').trim() && (
                <p
                  style={{
                    margin: '0 0 6px',
                    fontFamily: SERIF,
                    fontSize: 17,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    color: '#1e3a5a',
                  }}
                >
                  {story.title}
                </p>
              )}
              {String(story?.body || '').trim() && (
                <p style={{ margin: '0 0 6px', fontFamily: SANS, fontSize: 12, lineHeight: 1.6, color: '#1e3a5a' }}>
                  {story.body}
                </p>
              )}
              {String(story?.url || '').trim() && (
                <p style={{ margin: 0, fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#b87333' }}>
                  {story.label || 'Read it'} →
                </p>
              )}
            </div>
          ))}

          {String(issue?.closing || '').trim() && (
            <p
              className="pt-4"
              style={{
                margin: 0,
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontSize: 14,
                lineHeight: 1.6,
                color: '#1e3a5a',
              }}
            >
              {issue.closing}
            </p>
          )}

          {String(issue?.cta_label || '').trim() && (
            <div className="pb-6 pt-5">
              <span
                style={{
                  display: 'inline-block',
                  background: '#b87333',
                  borderRadius: 3,
                  padding: '11px 20px',
                  fontFamily: SANS,
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#000000',
                }}
              >
                {issue.cta_label}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 py-5">
        <p style={{ margin: '0 0 4px', fontFamily: SANS, fontSize: 12, color: '#c9a87c' }}>
          The record, one brief at a time.
        </p>
        <p style={{ margin: '0 0 8px', fontFamily: SANS, fontSize: 10, color: '#a3b8c9' }}>
          TOP 100 Aerospace &amp; Aviation · top100aero.space
        </p>
        <p style={{ margin: 0, fontFamily: SANS, fontSize: 9, lineHeight: 1.6, color: '#7d94aa' }}>
          You are reading this because you joined the Dispatch or hold a record in the house.
          <span style={{ color: '#a3b8c9', textDecoration: 'underline' }}> Leave the list</span>.
        </p>
      </div>
    </div>
  );
}