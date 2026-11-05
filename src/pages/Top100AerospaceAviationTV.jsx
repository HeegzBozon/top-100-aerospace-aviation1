import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TV_CHANNELS, dialNumber } from '@/components/tv/tvChannels';
import ChannelGuide from '@/components/tv/ChannelGuide';
import ChannelScreen from '@/components/tv/ChannelScreen';
import useChannelPicker from '@/components/tv/useChannelPicker';
import '@/components/tv/tv.css';

// The house's television. A dial of channels, a guide beside it, and one station on the
// glass at a time — changed with the buttons the machine already has (see the channel
// picker) or with the keys printed on the set. The channel stands in the address, so a
// station can be handed to somebody.
const channelAtAddress = () => {
  const wanted = Number(new URLSearchParams(window.location.search).get('ch'));
  return TV_CHANNELS.find((channel) => channel.number === wanted) || TV_CHANNELS[0];
};

export default function Top100AerospaceAviationTV() {
  const [tunedKey, setTunedKey] = useState(() => channelAtAddress().key);

  const tuned = useMemo(
    () => TV_CHANNELS.find((channel) => channel.key === tunedKey) || TV_CHANNELS[0],
    [tunedKey],
  );
  const tunedIndex = TV_CHANNELS.findIndex((channel) => channel.key === tuned.key);

  const tune = useCallback((channel) => {
    if (!channel) return;
    setTunedKey(channel.key);
    const url = new URL(window.location.href);
    url.searchParams.set('ch', String(channel.number));
    window.history.replaceState({}, '', url);
  }, []);

  // A back press that walked away from the surface is not the tuner's to keep.
  useEffect(() => {
    const onKey = (event) => {
      if (event.target?.closest?.('input, textarea, select, [contenteditable]')) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const next = TV_CHANNELS[tunedIndex + (event.key === 'ArrowLeft' ? -1 : 1)];
      if (!next) return;
      event.preventDefault();
      tune(next);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tunedIndex, tune]);

  useChannelPicker({ channels: TV_CHANNELS, activeKey: tuned.key, onTune: tune });

  return (
    <div className="tv-stage min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-3 py-4 md:px-8 md:py-8">
        <header className="tv-masthead">
          <div className="min-w-0">
            <p className="tv-kicker">Top 100 Aerospace &amp; Aviation</p>
            <h1 className="tv-title">Television</h1>
          </div>

          <div className="tv-dial">
            <span className="tv-dial-label">On the dial</span>
            <span className="tv-dial-number">{dialNumber(tuned.number)}</span>
            <span className="tv-dial-name">{tuned.name}</span>
          </div>
        </header>

        <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_272px] md:items-start">
          <div className="min-w-0">
            <ChannelScreen channel={tuned} />

            <div className="tv-transport mt-2.5">
              <button
                type="button"
                onClick={() => tune(TV_CHANNELS[tunedIndex - 1])}
                disabled={tunedIndex === 0}
                className="tv-step"
              >
                <ChevronLeft className="h-3 w-3" /> Ch −
              </button>
              <span className="tv-transport-hint">
                Channel {dialNumber(tuned.number)} of {dialNumber(TV_CHANNELS.length)}
              </span>
              <button
                type="button"
                onClick={() => tune(TV_CHANNELS[tunedIndex + 1])}
                disabled={tunedIndex === TV_CHANNELS.length - 1}
                className="tv-step"
              >
                Ch + <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          <ChannelGuide channels={TV_CHANNELS} tunedKey={tuned.key} onTune={tune} />
        </div>
      </div>
    </div>
  );
}