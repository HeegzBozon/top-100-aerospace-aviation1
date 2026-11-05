import { base44 } from '@/api/base44Client';

// THE DISPATCH FUNNEL — one taxonomy, fired once at the moment it describes.
//
//   newsletter_invite_viewed      the invitation was actually on the glass
//   newsletter_invite_clicked     the reader reached for it
//   newsletter_form_started       the first character typed into the field
//   newsletter_submit_rejected    the address was empty or malformed (local, no call)
//   newsletter_submit_failed      the request itself did not get through
//   newsletter_submitted          the house accepted the address
//   newsletter_next_step_viewed   what happens next was shown to the reader
//
// `newsletter_submitted` is a submission, not a confirmation. Confirmation is sent by
// the GoHighLevel workflow behind the subscriber tag and cannot be observed from this
// app, so no confirmed event is fired and no surface claims one.
//
// Properties carry where and on what — never who: no address, name or id ever reaches
// the analytics stream.
export const DISPATCH_EVENTS = {
  inviteViewed: 'newsletter_invite_viewed',
  inviteClicked: 'newsletter_invite_clicked',
  formStarted: 'newsletter_form_started',
  submitRejected: 'newsletter_submit_rejected',
  submitFailed: 'newsletter_submit_failed',
  submitted: 'newsletter_submitted',
  nextStepViewed: 'newsletter_next_step_viewed',
};

// Two buckets, read from the breakpoint the shell itself turns at.
export function readerDevice() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'unknown';
  return window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
}

export function trackDispatch(event, properties = {}) {
  const eventName = DISPATCH_EVENTS[event] || event;
  base44.analytics.track({ eventName, properties: { ...properties, device: readerDevice() } });
}