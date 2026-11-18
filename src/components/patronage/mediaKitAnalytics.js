function sendEvent(name, parameters) {
  try {
    window.gtag?.('event', name, parameters);
  } catch {
    // Analytics must not interrupt navigation or a confirmed enquiry.
  }
}

export function trackEnquirySubmitted({ is_new_lead }) {
  sendEvent('media_kit_enquiry_submitted', {
    event_category: 'conversions',
    page_location: 'https://top100aero.space/mediakit',
    is_new_lead: typeof is_new_lead === 'boolean' ? is_new_lead : true,
  });
}

export function trackEnquireClick(sourceCta) {
  sendEvent('media_kit_enquire_click', {
    event_category: 'navigation',
    source_cta: sourceCta,
  });
}