import { useCallback, useEffect, useRef, useState } from 'react';

// Narration is spoken by the browser itself — nothing is fetched, nothing is
// autoplayed, and the voice only runs once the visitor starts the film. Cancelling
// invalidates the utterance token so a stopped chapter can never advance the film.
export function useDocumentaryVoice() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);
  const token = useRef(0);

  const cancel = useCallback(() => {
    token.current += 1;
    if (supported) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text, { onEnd } = {}) => {
      const body = (text || '').trim();
      if (!supported || !body) {
        onEnd?.();
        return;
      }
      token.current += 1;
      const mine = token.current;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(body);
      utterance.rate = 0.92;
      utterance.pitch = 0.97;
      utterance.lang = 'en-US';
      utterance.onend = () => {
        if (mine !== token.current) return;
        setSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        if (mine !== token.current) return;
        setSpeaking(false);
        onEnd?.();
      };

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  useEffect(() => () => {
    if (supported) window.speechSynthesis.cancel();
  }, [supported]);

  return { supported, speaking, speak, cancel };
}