import { base44 } from '@/api/base44Client';
import { readerDevice } from '@/components/newsletter/newsletterEvents';

// THE NOMINATION FUNNEL — the same staging the Dispatch uses, one prefix apart, so both
// funnels are read the same way on the platform's Analytics page.
//
//   nomination_form_viewed       the surface was opened (the way into the funnel)
//   nomination_form_started      the first character typed into it
//   nomination_stage_advanced    a stage was left for a later one (from → to)
//   nomination_stage_abandoned   the surface was left with the flow unfinished
//   nomination_submit_rejected   the flow refused what stood on the page (validation)
//   nomination_submit_failed     the request itself did not get through
//   nomination_submitted         the nominations were filed
//
// Properties carry where, which stage, and how many names were on the page — never who.
// Nothing here is read by scoring, selection or ranking: these are funnel events, recorded
// where people stop and nowhere else.
export const NOMINATION_EVENTS = {
  formViewed: 'nomination_form_viewed',
  formStarted: 'nomination_form_started',
  stageAdvanced: 'nomination_stage_advanced',
  stageAbandoned: 'nomination_stage_abandoned',
  submitRejected: 'nomination_submit_rejected',
  submitFailed: 'nomination_submit_failed',
  submitted: 'nomination_submitted',
};

// The stages the guided hub already walks, named for the desk.
export const NOMINATION_STAGE_LABELS = {
  welcome: 'Welcome',
  about_you: 'About you',
  women: 'TOP 100 Women',
  men: 'TOP 100 Men',
  angels: 'Angels',
  local_legends: 'Local Legends',
  review: 'Review',
  confirmation: 'Confirmation',
};

export function trackNomination(event, properties = {}) {
  const eventName = NOMINATION_EVENTS[event] || event;
  base44.analytics.track({ eventName, properties: { ...properties, device: readerDevice() } });
}