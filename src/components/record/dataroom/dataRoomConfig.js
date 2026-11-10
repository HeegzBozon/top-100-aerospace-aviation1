// The data room, and the four audiences it is opened to.
//
// A data room is not a folder of files: it is the same record read by four different
// readers, and each of them opens the door with a different question. A founder asks what
// the venture is; an investor asks what the numbers are and who vouches for them; an
// employer asks whether the file behind the name is real; an employee asks what the work
// and the terms would be. So the room is filed by those four questions, and the kinds of
// document offered under each are the ones that reader actually asks for.
//
// Display only. Nothing filed here is read by discovery, ordering, influence tier or
// measurement, and no document moves a record's position anywhere.
export const ROOM_AUDIENCES = [
  {
    key: 'founder',
    label: 'Founder',
    hint: 'The venture, stated once. Read by a founder weighing you as a co-builder, a partner or a first customer.',
    kinds: ['one_pager', 'deck', 'numbers', 'sample'],
  },
  {
    key: 'investor',
    label: 'Investor',
    hint: 'Diligence, answered before it is asked: the numbers, the legal file and the people who vouch for them.',
    kinds: ['one_pager', 'deck', 'numbers', 'legal', 'reference'],
  },
  {
    key: 'employer',
    label: 'Employer',
    hint: 'What a hiring desk reads before the first call — the file behind the name.',
    kinds: ['one_pager', 'reference', 'sample', 'legal'],
  },
  {
    key: 'employee',
    label: 'Employee',
    hint: 'What someone joining your team is owed: the role, the terms and the work in front of them.',
    kinds: ['role', 'numbers', 'legal', 'deck'],
  },
];

export const ROOM_KINDS = {
  one_pager: 'One-pager',
  deck: 'Deck',
  numbers: 'Numbers',
  legal: 'Legal',
  reference: 'Reference',
  sample: 'Work sample',
  role: 'Role brief',
  other: 'Other',
};

export const roomAudience = (key) =>
  ROOM_AUDIENCES.find((audience) => audience.key === key) || ROOM_AUDIENCES[0];

export const kindLabel = (key) => ROOM_KINDS[key] || ROOM_KINDS.other;

export const filedCount = (items, audienceKey) =>
  items.filter((item) => item.audience === audienceKey).length;