import { useEffect, useRef } from 'react';
import { registerPicker, touchPicker } from '@/components/handheld/handheldPicker';
import { registerDigitLegends, registerDigits } from '@/components/handheld/handheldKeys';

// Changing channel the way a set is changed, on the keys the machine already has.
//
// The wheel's rotation and the radio's up/down walk the dial one station at a time, left
// and right jump it either way, and the confirm key tunes the station standing under the
// cursor. On the radio the figures are the channel numbers themselves — 1 is channel one,
// and the pad reprints to say so. Nothing new is asked of either face: it is the same
// picker every other surface registers, read as a tuner.
export default function useChannelPicker({ channels, activeKey, onTune }) {
  const live = useRef({});
  live.current = { channels, activeKey, onTune };

  useEffect(() => {
    const index = () => {
      const at = live.current.channels.findIndex((channel) => channel.key === live.current.activeKey);
      return at < 0 ? 0 : at;
    };

    const land = (next) => {
      const channel = live.current.channels[next];
      if (!channel) return null;
      live.current.onTune(channel);
      return `CH ${String(channel.number).padStart(2, '0')} · ${channel.name}`;
    };

    const offPicker = registerPicker({
      labels: () => live.current.channels.map((channel) => channel.name),
      index,
      step: (direction) => land(index() + direction),
      goTo: land,
      page: (direction) => land(index() + direction),
      enter: () => {
        const channel = live.current.channels[index()];
        if (!channel) return false;
        live.current.onTune(channel);
        return true;
      },
      back: () => false,
    });

    const offDigits = registerDigits((digit) => {
      const channel = live.current.channels.find((item) => String(item.number) === digit);
      if (!channel) return false;
      live.current.onTune(channel);
      return true;
    });

    const offLegend = registerDigitLegends({
      digits: Object.fromEntries(
        live.current.channels.map((channel) => [
          String(channel.number),
          { sub: `CH${channel.number}`, aria: `${channel.number} — tune channel ${channel.number}, ${channel.name}` },
        ]),
      ),
      enter: { sub: 'TUNE', aria: '# — tune the channel standing under the cursor' },
    });

    return () => {
      offPicker();
      offDigits();
      offLegend();
    };
  }, []);

  useEffect(() => {
    touchPicker();
  }, [activeKey, channels.length]);
}