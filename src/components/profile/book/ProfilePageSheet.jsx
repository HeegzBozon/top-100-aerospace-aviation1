import { ArrowUpRight, BadgeCheck, FileText, Mic, Play } from 'lucide-react';
import { EPISODE_TRACK, trackIndex, stageLabel } from '@/components/episode/episodeStages';

const NAVY = '#1E3A5A';
const CREAM = '#FAF8F5';
const COPPER = '#B87333';
const GOLD = '#C9A87C';
const LABEL = '#8F5C2C';

const Rule = ({ short }) => (
  <div style={{ height: 2, background: COPPER, width: short ? 44 : '100%' }} />
);

const Kicker = ({ children }) => (
  <p
    style={{
      fontFamily: 'var(--font-body)',
      fontSize: 8,
      fontWeight: 600,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: LABEL,
      margin: 0,
    }}
  >
    {children}
  </p>
);

const Body = ({ children, muted }) => (
  <p
    style={{
      fontFamily: 'var(--font-body)',
      fontSize: 10.5,
      lineHeight: 1.72,
      color: muted ? 'rgba(30,58,90,0.62)' : 'rgba(30,58,90,0.86)',
      margin: 0,
    }}
  >
    {children}
  </p>
);

// The running head of every page but the cover: where this page stands in the
// record, then the rule, then the page itself.
function PageHead({ page }) {
  return (
    <header style={{ flex: 'none', paddingBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Kicker>{page.label}</Kicker>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 9,
            letterSpacing: '0.16em',
            color: 'rgba(184,115,51,0.72)',
          }}
        >
          {page.number}
        </span>
      </div>
      <div style={{ marginTop: 7 }}>
        <Rule />
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: page.kind === 'cover' ? 30 : 22,
          lineHeight: 1.12,
          color: NAVY,
          margin: '14px 0 0',
          letterSpacing: '-0.01em',
        }}
      >
        {page.title}
      </h2>
      {page.standfirst && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 8.5,
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(30,58,90,0.5)',
            margin: '8px 0 0',
          }}
        >
          {page.standfirst}
        </p>
      )}
    </header>
  );
}

function FactRows({ facts }) {
  return (
    <dl style={{ margin: 0 }}>
      {facts.map((fact) => (
        <div
          key={fact.label}
          style={{
            borderTop: `1px solid rgba(184,115,51,0.24)`,
            padding: '7px 0',
            display: 'flex',
            gap: 10,
            alignItems: 'baseline',
          }}
        >
          <dt style={{ flex: 'none', width: 74 }}>
            <Kicker>{fact.label}</Kicker>
          </dt>
          <dd style={{ margin: 0, flex: 1 }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: 11.5, color: NAVY, lineHeight: 1.4 }}>
              {fact.value}
            </span>
            {fact.body && (
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-body)',
                  fontSize: 9,
                  color: 'rgba(30,58,90,0.55)',
                  marginTop: 2,
                }}
              >
                {fact.body}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// ── The cover ────────────────────────────────────────────────────────────────
function CoverPage({ page }) {
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden', background: NAVY }}>
      {page.cover && (
        <img
          src={page.cover}
          alt=""
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, height: '100%', width: '100%', objectFit: 'cover' }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(30,58,90,0.55) 0%, rgba(22,41,63,0.92) 58%, #16293F 100%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '30px 32px 26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 8,
              fontWeight: 600,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: GOLD,
              margin: 0,
            }}
          >
            TOP 100 · Aerospace &amp; Aviation
          </p>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 9,
              letterSpacing: '0.16em',
              color: 'rgba(201,168,124,0.6)',
            }}
          >
            {page.number}
          </span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {page.portrait && (
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: '50%',
                overflow: 'hidden',
                border: `1px solid ${GOLD}`,
                marginBottom: 18,
                boxShadow: '0 16px 34px -16px rgba(3,8,15,0.9)',
              }}
            >
              <img
                src={page.portrait}
                alt={page.title}
                style={{ height: '100%', width: '100%', objectFit: 'cover', objectPosition: 'center 22%' }}
              />
            </div>
          )}

          <div style={{ height: 2, width: 44, background: COPPER, marginBottom: 14 }} />

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 30,
              lineHeight: 1.04,
              letterSpacing: '-0.015em',
              color: CREAM,
              margin: 0,
            }}
          >
            {page.title}
          </h1>

          {page.standfirst && (
            <p
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 12,
                fontStyle: 'italic',
                lineHeight: 1.45,
                color: GOLD,
                margin: '12px 0 0',
              }}
            >
              {page.standfirst}
            </p>
          )}

          {page.facts.length > 0 && (
            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {page.facts.map((fact) => (
                <p
                  key={fact.label}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 9,
                    letterSpacing: '0.1em',
                    color: 'rgba(250,248,245,0.72)',
                    margin: 0,
                  }}
                >
                  <span style={{ color: 'rgba(201,168,124,0.85)' }}>{fact.label} </span>
                  {fact.value}
                </p>
              ))}
            </div>
          )}

          {page.lines.length > 0 && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 10,
                lineHeight: 1.7,
                color: 'rgba(250,248,245,0.6)',
                margin: '16px 0 0',
              }}
            >
              {page.lines[0]}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── The credential ───────────────────────────────────────────────────────────
function CredentialPage({ page }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <BadgeCheck size={15} color={COPPER} strokeWidth={1.8} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 9, letterSpacing: '0.12em', color: 'rgba(30,58,90,0.6)' }}>
          Claimed: {page.lines[0]?.includes('not been') ? 'no' : 'yes'}
        </span>
      </div>

      <div style={{ borderTop: `1px solid rgba(184,115,51,0.24)`, paddingTop: 10 }}>
        <FactRows facts={page.facts} />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderTop: `1px solid rgba(184,115,51,0.24)`, paddingTop: 9 }}>
        <Kicker>Influence band</Kicker>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: NAVY }}>{page.tier}</span>
      </div>

      <Body muted>{page.note}</Body>
    </div>
  );
}

// ── Availability ─────────────────────────────────────────────────────────────
function AvailabilityPage({ page, onEnquire }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Body>{page.standfirst}</Body>
      <FactRows facts={page.facts} />
      {onEnquire && (
        <button
          type="button"
          onClick={onEnquire}
          style={{
            alignSelf: 'flex-start',
            border: `1px solid ${COPPER}`,
            background: COPPER,
            color: CREAM,
            fontFamily: 'var(--font-body)',
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '9px 14px',
            cursor: 'pointer',
          }}
        >
          {page.action?.label}
        </button>
      )}
    </div>
  );
}

// ── In their own words ───────────────────────────────────────────────────────
function WordsPage({ page }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {page.lines.map((line, i) => (
        <div key={i} style={{ borderLeft: `2px solid rgba(184,115,51,0.5)`, paddingLeft: 11 }}>
          <Body>{line}</Body>
        </div>
      ))}

      {page.quotes?.map((quote) => (
        <blockquote key={quote.label} style={{ margin: 0, borderTop: `1px solid rgba(201,168,124,0.5)`, paddingTop: 10 }}>
          <Kicker>{quote.label}</Kicker>
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 12.5,
              lineHeight: 1.5,
              color: NAVY,
              margin: '5px 0 0',
            }}
          >
            “{quote.text.length > 170 ? `${quote.text.slice(0, 170)}…` : quote.text}”
          </p>
        </blockquote>
      ))}

      {page.note && <Body muted>{page.note}</Body>}
    </div>
  );
}

// ── Materials ────────────────────────────────────────────────────────────────
function MaterialsPage({ page }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', borderTop: `1px solid rgba(184,115,51,0.24)` }}>
      {page.files.map((file) => (
        <li key={file.label} style={{ borderBottom: `1px solid rgba(184,115,51,0.24)` }}>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 0',
              textDecoration: 'none',
            }}
          >
            <FileText size={12} color={COPPER} strokeWidth={1.7} />
            <span style={{ flex: 1, fontFamily: 'var(--font-heading)', fontSize: 12, color: NAVY }}>
              {file.label}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 7.5,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(30,58,90,0.42)',
              }}
            >
              Open
            </span>
            <ArrowUpRight size={11} color="rgba(30,58,90,0.35)" />
          </a>
        </li>
      ))}
    </ul>
  );
}

// ── The Eight ────────────────────────────────────────────────────────────────
function EightPage({ page }) {
  return (
    <div>
      <ol
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px 8px',
        }}
      >
        {page.slots.map((entry, i) => (
          <li key={i} style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 8, letterSpacing: '0.18em', color: COPPER, margin: 0 }}>
              {String(i + 1).padStart(2, '0')}
            </p>

            {entry ? (
              <>
                <div
                  style={{
                    margin: '6px auto 0',
                    height: 34,
                    width: 34,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#EFE7DC',
                    border: `1px solid rgba(184,115,51,0.35)`,
                  }}
                >
                  {entry.nominee_avatar ? (
                    <img
                      src={entry.nominee_avatar}
                      alt={entry.nominee_name || 'Named Fellow'}
                      style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  ) : (
                    <span
                      style={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-heading)',
                        fontSize: 13,
                        color: 'rgba(30,58,90,0.7)',
                      }}
                    >
                      {(entry.nominee_name || '?').charAt(0)}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 8.5,
                    lineHeight: 1.2,
                    color: NAVY,
                    margin: '5px 0 0',
                  }}
                >
                  {entry.nominee_name}
                </p>
              </>
            ) : (
              <>
                <div
                  style={{
                    margin: '6px auto 0',
                    height: 34,
                    width: 34,
                    borderRadius: '50%',
                    border: `1px dashed rgba(184,115,51,0.55)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-body)',
                    fontSize: 9,
                    color: 'rgba(184,115,51,0.8)',
                  }}
                >
                  +
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 7,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(30,58,90,0.4)',
                    margin: '5px 0 0',
                  }}
                >
                  Open
                </p>
              </>
            )}
          </li>
        ))}
      </ol>

      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 8.5,
          lineHeight: 1.6,
          color: 'rgba(30,58,90,0.55)',
          margin: '16px 0 0',
          borderTop: `1px solid rgba(184,115,51,0.24)`,
          paddingTop: 9,
        }}
      >
        {page.note}
      </p>
    </div>
  );
}

// ── Flightography ────────────────────────────────────────────────────────────
function FlightographyPage({ page }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {page.lines.map((line, i) => (
        <Body key={i}>{line}</Body>
      ))}

      {page.entries.length > 0 && (
        <div style={{ borderTop: `1px solid rgba(184,115,51,0.24)`, paddingTop: 9 }}>
          <Kicker>Career</Kicker>
          <ul style={{ margin: '7px 0 0', padding: 0, listStyle: 'none' }}>
            {page.entries.map((entry, i) => (
              <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 5 }}>
                <span style={{ flex: 1, fontFamily: 'var(--font-heading)', fontSize: 10, color: NAVY, lineHeight: 1.35 }}>
                  {entry.head}
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 8, color: 'rgba(30,58,90,0.45)', whiteSpace: 'nowrap' }}>
                  {entry.meta}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {page.education.length > 0 && (
        <div style={{ borderTop: `1px solid rgba(184,115,51,0.24)`, paddingTop: 9 }}>
          <Kicker>Education</Kicker>
          <ul style={{ margin: '7px 0 0', padding: 0, listStyle: 'none' }}>
            {page.education.map((entry, i) => (
              <li key={i} style={{ marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 10, color: NAVY }}>{entry.head}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 8.5, color: 'rgba(30,58,90,0.5)' }}>
                  {entry.meta ? ` · ${entry.meta}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {page.stats.length > 0 && (
        <div
          style={{
            borderTop: `1px solid rgba(184,115,51,0.24)`,
            paddingTop: 9,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 14px',
          }}
        >
          {page.stats.map((stat) => (
            <span key={stat.label}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 7.5,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: LABEL,
                }}
              >
                {stat.label}{' '}
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 10.5, color: NAVY }}>{stat.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Top Viral Post spread ────────────────────────────────────────────────────
function ViralPage({ page }) {
  return (
    <div
      style={{
        margin: '-6px -32px 0',
        background: NAVY,
        padding: '20px 32px 18px',
      }}
    >
      <Kicker>{page.label}</Kicker>
      <div style={{ height: 2, width: 44, background: COPPER, margin: '9px 0 12px' }} />
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, lineHeight: 1.1, color: CREAM, margin: 0 }}>
        {page.title}
      </h2>
      {page.standfirst && (
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 26, lineHeight: 1, color: CREAM, margin: '14px 0 0' }}>
          {page.standfirst}
        </p>
      )}
      {page.standfirst && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 7.5,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'rgba(250,248,245,0.55)',
            margin: '5px 0 0',
          }}
        >
          impressions
        </p>
      )}
      {page.lines.map((line, i) => (
        <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 10, lineHeight: 1.7, color: 'rgba(250,248,245,0.78)', margin: '12px 0 0' }}>
          {line}
        </p>
      ))}
      {page.quote && (
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 11.5,
            fontStyle: 'italic',
            lineHeight: 1.5,
            color: GOLD,
            borderLeft: `2px solid ${COPPER}`,
            paddingLeft: 10,
            margin: '12px 0 0',
          }}
        >
          “{page.quote}”
        </p>
      )}
      {page.link && (
        <a
          href={page.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: 14,
            border: `1px solid rgba(201,168,124,0.5)`,
            padding: '7px 11px',
            fontFamily: 'var(--font-body)',
            fontSize: 7.5,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: GOLD,
            textDecoration: 'none',
          }}
        >
          Read the post
        </a>
      )}
    </div>
  );
}

// ── Mission Rooms ────────────────────────────────────────────────────────────
function ConferencesPage({ page }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', borderTop: `1px solid rgba(184,115,51,0.24)` }}>
      {page.entries.map((entry, i) => (
        <li
          key={i}
          style={{
            borderBottom: `1px solid rgba(184,115,51,0.24)`,
            padding: '10px 0',
            display: 'flex',
            gap: 8,
            alignItems: 'baseline',
          }}
        >
          <span style={{ flex: 1, fontFamily: 'var(--font-heading)', fontSize: 11.5, color: NAVY, lineHeight: 1.3 }}>
            {entry.head}
          </span>
          {entry.meta && (
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 7.5,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(30,58,90,0.45)',
              }}
            >
              {entry.meta}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

// ── One chapter of the Fellow's arc ──────────────────────────────────────────
function ChapterPage({ page }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {page.lines.map((line, i) => (
        <p
          key={i}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 10.5,
            lineHeight: 1.78,
            color: 'rgba(30,58,90,0.86)',
            margin: 0,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

// ── The episode ──────────────────────────────────────────────────────────────
function EpisodePage({ page, isOwner, onOpenEpisode }) {
  const at = trackIndex(page.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {page.lines.map((line, i) => (
        <Body key={i}>{line}</Body>
      ))}

      {page.episode ? (
        <div style={{ borderTop: `1px solid rgba(184,115,51,0.24)`, paddingTop: 10 }}>
          <Kicker>Production</Kicker>
          <ol style={{ margin: '8px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {EPISODE_TRACK.map((stage, i) => {
              const done = at >= i;
              return (
                <li key={stage.key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span
                    style={{
                      height: 5,
                      width: 5,
                      borderRadius: '50%',
                      background: done ? COPPER : 'rgba(30,58,90,0.18)',
                      flex: 'none',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 8.5,
                      letterSpacing: '0.06em',
                      color: done ? NAVY : 'rgba(30,58,90,0.35)',
                    }}
                  >
                    {stage.label}
                  </span>
                </li>
              );
            })}
          </ol>
          {page.status && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 8,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: LABEL,
                margin: '9px 0 0',
              }}
            >
              {stageLabel(page.status)}
            </p>
          )}
        </div>
      ) : (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 8.5,
            lineHeight: 1.6,
            color: 'rgba(30,58,90,0.5)',
            margin: 0,
          }}
        >
          The episode opens from the Fellow&rsquo;s own record. Nothing is produced without their intake.
        </p>
      )}

      {isOwner && onOpenEpisode && (
        <button
          type="button"
          onClick={onOpenEpisode}
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: `1px solid ${COPPER}`,
            background: page.episode ? 'transparent' : COPPER,
            color: page.episode ? LABEL : CREAM,
            fontFamily: 'var(--font-body)',
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '8px 13px',
            cursor: 'pointer',
          }}
        >
          {page.episode ? <Mic size={10} /> : <Play size={10} />}
          {page.action?.label}
        </button>
      )}
    </div>
  );
}

// One page of the Fellow's book, composed at the design size the spread scales
// from. Every kind is drawn here so the flipbook and the accessible reader can
// never render the same page two different ways.
export default function ProfilePageSheet({ page, isOwner, onEnquire, onOpenEpisode }) {
  if (page.kind === 'cover') return <CoverPage page={page} />;

  const dark = page.kind === 'viral';

  return (
    <div
      className="pb-page"
      style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: '26px 32px 20px',
        color: NAVY,
        overflow: 'hidden',
      }}
    >
      {!dark && <PageHead page={page} />}

      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {page.kind === 'credential' && <CredentialPage page={page} />}
        {page.kind === 'availability' && <AvailabilityPage page={page} onEnquire={onEnquire} />}
        {page.kind === 'words' && <WordsPage page={page} />}
        {page.kind === 'materials' && <MaterialsPage page={page} />}
        {page.kind === 'eight' && <EightPage page={page} />}
        {page.kind === 'flightography' && <FlightographyPage page={page} />}
        {page.kind === 'viral' && <ViralPage page={page} />}
        {page.kind === 'conferences' && <ConferencesPage page={page} />}
        {page.kind === 'chapter' && <ChapterPage page={page} />}
        {page.kind === 'episode' && (
          <EpisodePage page={page} isOwner={isOwner} onOpenEpisode={onOpenEpisode} />
        )}
      </div>

      <footer
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid rgba(184,115,51,0.28)`,
          paddingTop: 7,
          marginTop: 10,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 6.5,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'rgba(30,58,90,0.35)',
          }}
        >
          TOP 100 Aerospace &amp; Aviation
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 6.5, letterSpacing: '0.2em', color: 'rgba(30,58,90,0.35)' }}>
          {page.number}
        </span>
      </footer>
    </div>
  );
}