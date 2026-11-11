import { ISSUE_42_BRIEF } from '@/components/magazine/briefs/issue42';

// Written briefs, by issue number.
//
// Most issues are composed from the roster or from the studio's own blueprint. An issue
// that is written — an argument the house wants to make in full — is authored as a brief
// in code and laid down in one press from the blueprint desk. Registering a new one is a
// line here and a file beside this one; nothing else has to know about it.
export const WRITTEN_BRIEFS = {
  42: ISSUE_42_BRIEF,
};

export function briefForIssue(issue) {
  if (!issue) return null;
  return WRITTEN_BRIEFS[Number(issue.issue_number)] || null;
}