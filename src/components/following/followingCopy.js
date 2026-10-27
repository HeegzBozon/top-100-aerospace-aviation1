// What an action that did not go through says, in the register's own voice.
//
// Copy, not logic: an action that cannot be taken is explained rather than hidden, so a
// reader is told what is missing instead of being left to wonder whether the press
// registered at all.
const LINES = {
  'signed-out': 'Sign in to keep the people you follow, and a list of your own.',
  'no-address': 'No address on her record, so she cannot be kept yet.',
  'no-record': 'This name is not linked to a record yet.',
  cancelled: '',
  failed: 'That did not go through. Try it again.',
};

export const reasonLine = (reason) => LINES[reason] ?? LINES.failed;