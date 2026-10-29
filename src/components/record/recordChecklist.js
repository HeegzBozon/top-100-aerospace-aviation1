import { RECORD_SURFACES } from './recordMenu';

const text = (value) => String(value ?? '').trim();
const has = (value) => (Array.isArray(value) ? value.length > 0 : !!text(value));

const numbers = (object) =>
  object && typeof object === 'object'
    ? Object.values(object)
        .filter((value) => typeof value === 'number')
        .reduce((sum, value) => sum + value, 0)
    : 0;

const item = ({ key, label, hint, done, value, editor, to }) => ({
  key,
  label,
  hint,
  done: !!done,
  value: text(value),
  editor,
  to,
});

// An editable line: the checklist row carries its own field, so the missing item is
// added where it is read rather than behind a door.
const line = (key, label, hint, raw, { save = 'dossier', field = key, ...rest } = {}) =>
  item({
    key,
    label,
    hint,
    done: has(raw),
    value: raw,
    editor: { save, field, value: text(raw), ...rest },
  });

// The card is a card, not a form: eight things a card carries, each one a line to
// fill while it is missing.
const cardRows = (card) => [
  line('card_name', 'Name on the card', 'As you would hand it over.', card.card_name, {
    save: 'card',
    placeholder: 'Your name',
    maxLength: 60,
  }),
  line('role_line', 'Role', 'The line under your name.', card.role_line, {
    save: 'card',
    placeholder: 'Chief Engineer, Lunar Systems',
    maxLength: 80,
  }),
  line('organisation', 'Organisation', 'Who you are writing from.', card.organisation, {
    save: 'card',
    placeholder: 'Organisation or practice',
    maxLength: 90,
  }),
  line('contact_email', 'Address for the card', 'Your account address is never printed by default.', card.contact_email, {
    save: 'card',
    placeholder: 'name@organisation.com',
    maxLength: 90,
  }),
  line('phone', 'Number', 'Only printed when you show it.', card.phone, {
    save: 'card',
    placeholder: '+1 000 000 0000',
    maxLength: 40,
  }),
  line('website_url', 'Website', 'Where the work can be seen.', card.website_url, {
    save: 'card',
    placeholder: 'https://',
    maxLength: 140,
  }),
  line('linkedin_url', 'LinkedIn', 'The profile you keep current.', card.linkedin_url, {
    save: 'card',
    placeholder: 'https://linkedin.com/in/…',
    maxLength: 160,
  }),
  line('location', 'Base', 'City, or city and country.', card.location, {
    save: 'card',
    placeholder: 'City, Country',
    maxLength: 60,
  }),
  line('tagline', 'One line about the work', 'What you can be reached about.', card.tagline, {
    save: 'card',
    placeholder: 'Flight software, flown on four missions',
    maxLength: 100,
  }),
];

// Builds the six surfaces from one reading of the record: the account, the public
// record, the settings row, the card and the three counts that can only come from
// elsewhere (verified attendance, enquiries received, enquiries answered).
export function buildRecordSurfaces({ user, nominee, settings, card, counts = {} } = {}) {
  const account = user || {};
  const record = nominee || {};
  const config = settings || {};
  const businessCard = card || {};

  const hireOpen = config.intent_hire_enabled === true;
  const commercialOpen = config.intent_commercial_enabled === true;
  const availabilityOpen = hireOpen || commercialOpen;
  const sixWord = config.six_word_story || account.six_word_story || '';
  const about = account.bio || record.bio_extended || record.bio || record.description || '';
  const pitch = account.headline || record.title || record.professional_role || '';
  const portrait = account.avatar_url || record.avatar_url || record.photo_url || '';

  const rows = {
    view: [
      item({ key: 'portrait', label: 'Portrait', hint: 'A clear photograph, cut square.', done: has(portrait), to: '/Profile' }),
      item({ key: 'headline', label: 'Elevator pitch', hint: 'The line that sits under your name.', done: has(pitch), value: pitch, to: '/Profile' }),
      item({ key: 'about', label: 'About', hint: 'What you work on and what you have shipped.', done: has(about), to: '/Profile' }),
      item({ key: 'six_word', label: 'Six word story', hint: 'The whole record in six words.', done: has(sixWord), value: sixWord, to: '/Profile' }),
      item({
        key: 'verification',
        label: 'Verification checkpoint',
        hint: 'A checkpoint on the record, never a score.',
        done: !!record.verified_status && record.verified_status !== 'unverified',
        value: record.verified_status ? record.verified_status.replace(/_/g, ' ') : '',
        to: '/Profile',
      }),
      item({
        key: 'eight',
        label: 'Your TOP 100 on the record',
        hint: 'Your positions read publicly, in the order you set.',
        done: config.eight_public === true,
        to: '/selection-committee?tab=nominate',
      }),
      item({
        key: 'dossier',
        label: 'Dossier available to enquirers',
        hint: 'Lets a visitor take the one-page record with them.',
        done: config.dossier_enabled === true,
        to: '/Profile',
      }),
    ],
    card: cardRows(businessCard),
    dataroom: [
      line('one_word', 'One word', 'The word a colleague would use about your work.', account.one_word, {
        placeholder: 'RELENTLESS',
        maxLength: 24,
      }),
      line('six_word_story', 'Six word story', 'Exactly six words. Punctuation is free.', sixWord, {
        placeholder: 'Grounded dreamer. Built wings. Never landed.',
        maxLength: 60,
      }),
      line('headline', 'Elevator pitch', 'One line under your name.', account.headline || record.title || '', {
        placeholder: 'Building the next generation of lunar landers',
        maxLength: 140,
      }),
      line('bio', 'About', 'What you work on, what you shipped, what is next.', about, {
        multiline: true,
        maxLength: 1200,
        placeholder: 'A short account of the work.',
      }),
      item({ key: 'resume', label: 'Resume', hint: 'Kept on file once, reused everywhere.', done: has(account.resume_url), to: '/Profile' }),
      item({ key: 'cover_letter', label: 'Cover letter', hint: 'Your own words, on file.', done: has(account.cover_letter_url), to: '/Profile' }),
      item({ key: 'portfolio', label: 'Portfolio file', hint: 'A document or a sample of the work.', done: has(account.portfolio_url), to: '/Profile' }),
      item({ key: 'linkedin', label: 'LinkedIn', hint: 'The profile you keep current.', done: has(account.linkedin_url), to: '/Profile' }),
      item({
        key: 'attendance',
        label: 'Verified attendance',
        hint: 'Conferences attended, verified by a facilitator.',
        done: (counts.attendance || 0) > 0,
        value: counts.attendance ? `${counts.attendance} verified` : '',
        to: '/Profile',
      }),
      item({
        key: 'impact',
        label: 'Flightography',
        hint: 'Flights, programmes, patents, publications — the measured work.',
        done: numbers(record.impact_metrics) > 0 || has(record.impact_summary) || numbers(record.leadership_metrics) > 0,
        to: '/Profile',
      }),
      item({
        key: 'deck',
        label: 'Pitch deck',
        hint: 'The slide order and pace your record opens at.',
        done: (config.slide_order?.length || 0) > 0 || !!config.autoplay_mode,
        to: '/Profile?settings=presentation',
      }),
      item({
        key: 'cover',
        label: 'Cover',
        hint: 'One from the verified cover library.',
        done: !!config.cover_asset_id && config.cover_asset_id !== 'none',
        to: '/Profile',
      }),
    ],
    availability: [
      item({
        key: 'open',
        label: 'Open a door',
        hint: 'Job & Career, Deal & BD, or both. Each is your switch alone.',
        done: availabilityOpen,
        to: '/Profile',
      }),
      line('hire_pitch', 'What you want next', 'Two lines on the work you are looking for.', config.hire_pitch, {
        save: 'settings',
        placeholder: 'Two lines on the work you want next',
        maxLength: 280,
      }),
      item({ key: 'hire_capabilities', label: 'Capabilities', hint: 'Chosen from the approved set.', done: has(config.hire_capabilities), to: '/Profile' }),
      item({ key: 'hire_work_preference', label: 'Work arrangement', hint: 'Onsite, hybrid, remote, flexible.', done: has(config.hire_work_preference), to: '/Profile' }),
      item({ key: 'hire_availability', label: 'How open you are', hint: 'Informational only, never used to order anything.', done: has(config.hire_availability), to: '/Profile' }),
      item({ key: 'hire_regions', label: 'Regions', hint: 'Where the conversation can happen.', done: has(config.hire_regions), to: '/Profile' }),
      line('commercial_pitch', 'What you can be engaged for', 'The commercial line, in your own words.', config.commercial_pitch, {
        save: 'settings',
        placeholder: 'What you can be engaged to do',
        maxLength: 280,
      }),
      item({ key: 'commercial_offerings', label: 'Offerings', hint: 'Chosen from the approved set.', done: has(config.commercial_offerings), to: '/Profile' }),
      item({ key: 'commercial_engagements', label: 'Engagement state', hint: 'Open now, selective, or closed.', done: has(config.commercial_engagements), to: '/Profile' }),
      item({ key: 'inquiry_route', label: 'How you are reached', hint: 'The private form, with or without LinkedIn.', done: has(config.inquiry_route), to: '/Profile' }),
    ],
    inbox: [
      item({
        key: 'open',
        label: 'A door to write through',
        hint: 'Enquiries arrive through the availability layer.',
        done: availabilityOpen,
        to: '/Profile',
      }),
      item({ key: 'route', label: 'Contact preference', hint: 'The form alone, or the form and LinkedIn.', done: has(config.inquiry_route), to: '/Profile' }),
      item({ key: 'release', label: 'Dossier release', hint: 'What an enquirer may take with them.', done: config.dossier_enabled === true, to: '/Profile' }),
      item({ key: 'visited', label: 'Open the desk', hint: 'Read what has arrived, once.', done: has(config.inquiry_last_seen_at), to: '/Profile' }),
      item({
        key: 'received',
        label: 'First enquiry received',
        hint: 'Nothing to do but publish the record.',
        done: (counts.received || 0) > 0,
        value: counts.received ? `${counts.received} received` : '',
      }),
      item({
        key: 'answered',
        label: 'First enquiry answered',
        hint: 'Moved on from new.',
        done: (counts.answered || 0) > 0,
        value: counts.answered ? `${counts.answered} answered` : '',
        to: '/Profile',
      }),
    ],
    account: [
      item({ key: 'name', label: 'Your name', hint: 'As the institution prints it.', done: has(account.full_name), to: '/Profile' }),
      item({ key: 'accent', label: 'Domain accent', hint: 'Chosen from the approved set.', done: has(config.domain_accent), value: config.domain_accent, to: '/Profile' }),
      item({
        key: 'cover',
        label: 'Cover',
        hint: 'One from the verified cover library.',
        done: !!config.cover_asset_id && config.cover_asset_id !== 'none',
        to: '/Profile',
      }),
      item({ key: 'finish', label: 'Handheld finish', hint: 'The one you carry the record in.', done: has(config.hardware_finish), to: '/Profile' }),
      item({ key: 'status', label: 'Status', hint: 'One from the approved status set.', done: has(config.status_key), to: '/Profile' }),
      item({ key: 'bulletin', label: 'Bulletin board', hint: 'The tools you keep on your board.', done: has(config.bulletin_tools), to: '/Profile' }),
    ],
  };

  return RECORD_SURFACES.map((surface) => {
    const items = rows[surface.key] || [];
    const done = items.filter((entry) => entry.done).length;
    const total = items.length;
    return {
      ...surface,
      items,
      done,
      total,
      percent: total ? Math.round((done / total) * 100) : 0,
    };
  });
}

export function recordOverall(surfaces) {
  const done = surfaces.reduce((sum, surface) => sum + surface.done, 0);
  const total = surfaces.reduce((sum, surface) => sum + surface.total, 0);
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}