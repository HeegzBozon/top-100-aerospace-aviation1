import { useEffect } from 'react';

const WIDGET_SCRIPT_ID = 'leadconnector-chat-widget';

export default function LeadConnectorChatWidget() {
  useEffect(() => {
    if (document.getElementById(WIDGET_SCRIPT_ID)) return;

    const script = document.createElement('script');
    script.id = WIDGET_SCRIPT_ID;
    script.src = 'https://widgets.leadconnectorhq.com/loader.js';
    script.async = true;
    script.dataset.resourcesUrl = 'https://widgets.leadconnectorhq.com/chat-widget/loader.js';
    script.dataset.widgetId = '69fc1a385b108d75814417eb';
    document.body.appendChild(script);
  }, []);

  return null;
}