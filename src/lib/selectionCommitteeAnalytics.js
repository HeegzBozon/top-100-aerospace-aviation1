const PAGE = '/selection-committee';

// Optional telemetry must never delay or fail a nomination or evaluation.
// Google Consent Mode governs delivery; no retry queue or identifying fields.
export function trackSelectionCommittee(event, parameters = {}) {
  if (typeof window === 'undefined' || window.location.pathname !== PAGE) return;
  try {
    if (navigator.onLine === false || typeof window.gtag !== 'function') return;
    window.gtag('event', `selection_committee_${event}`, {
      send_to: 'G-47ZS78SLXV', page_path: PAGE, ...parameters,
    });
  } catch { /* Blocked analytics must not affect the action being measured. */ }
}

export function trackCommitteeAction(label, destination = PAGE) {
  trackSelectionCommittee('vote_click', {
    event_category: 'selection_committee', action_target: label,
    destination_url: destination,
  });
}

export function trackCommitteeSubmission() {
  trackSelectionCommittee('submission', {
    event_category: 'conversions', conversion_type: 'evaluation_ballot',
  });
}