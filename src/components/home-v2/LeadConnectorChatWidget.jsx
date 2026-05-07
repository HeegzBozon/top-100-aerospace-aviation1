import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

const WIDGET_SCRIPT_ID = 'leadconnector-chat-widget';
const WIDGET_ID = '69fc1a385b108d75814417eb';

export default function LeadConnectorChatWidget() {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (!document.getElementById(WIDGET_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = WIDGET_SCRIPT_ID;
      script.setAttribute('src', 'https://widgets.leadconnectorhq.com/loader.js');
      script.setAttribute('data-resources-url', 'https://widgets.leadconnectorhq.com/chat-widget/loader.js');
      script.setAttribute('data-widget-id', WIDGET_ID);
      document.body.appendChild(script);
    }

    const timer = window.setTimeout(() => {
      const hasWidget = document.querySelector('iframe[src*="leadconnectorhq"], iframe[src*="gohighlevel"], [id*="lc_chat"], [class*="lc_chat"]');
      setShowFallback(!hasWidget);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, []);

  if (!showFallback) return null;

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="fixed bottom-5 right-5 z-[9999] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a87c] text-[#07111f] shadow-[0_0_30px_rgba(201,168,124,0.45)] transition-transform hover:scale-105"
      aria-label="Load chat"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}