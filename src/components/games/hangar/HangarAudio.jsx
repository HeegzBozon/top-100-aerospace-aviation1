import { useEffect, useRef } from 'react';

// Ambient soundscape manager for The Hangar
export default function HangarAudio({ isMuted, currentArea }) {
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const oscillatorsRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isMuted) {
      // Clean up audio when muted
      if (audioContextRef.current) {
        oscillatorsRef.current.forEach(osc => {
          try { osc.stop(); } catch (e) {}
        });
        oscillatorsRef.current = [];
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    // Initialize Web Audio API
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    // Create ambient drone layers
    const createDrone = (frequency, type = 'sine', gainValue = 0.3) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc.type = type;
      osc.frequency.value = frequency;
      
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;
      
      gain.gain.value = gainValue;
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      oscillatorsRef.current.push(osc);
      
      return { osc, gain, filter };
    };

    // Base ambient layers
    const baseDrone = createDrone(55, 'sine', 0.25); // Deep hum
    const midDrone = createDrone(110, 'triangle', 0.1); // Mid harmonic
    const highDrone = createDrone(220, 'sine', 0.05); // Subtle high

    // Modulate the drones slowly for movement
    const modulateDrones = () => {
      const time = ctx.currentTime;
      baseDrone.osc.frequency.setValueAtTime(55 + Math.sin(time * 0.1) * 2, time);
      midDrone.gain.gain.setValueAtTime(0.08 + Math.sin(time * 0.15) * 0.03, time);
    };

    // Create occasional "machinery" sounds
    const playMachineryPing = () => {
      if (Math.random() > 0.3) return; // Only 30% chance
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 800 + Math.random() * 400;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      osc.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      osc.stop(ctx.currentTime + 1);
    };

    // Mission Control chatter (occasional radio clips simulation)
    const playMissionChatter = () => {
      if (Math.random() > 0.15) return; // 15% chance
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      // Radio-like bandpass filter
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 5;
      
      osc.type = 'sawtooth';
      osc.frequency.value = 150 + Math.random() * 100;
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.015, ctx.currentTime + 0.3 + Math.random() * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    };

    // Random ambient events
    intervalRef.current = setInterval(() => {
      modulateDrones();
      playMachineryPing();
      playMissionChatter();
    }, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      oscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch (e) {}
      });
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isMuted]);

  // Adjust audio based on area
  useEffect(() => {
    if (!gainNodeRef.current || isMuted) return;

    const areaVolumes = {
      main_hall: 0.15,
      heritage_wing: 0.12,
      rd_lab: 0.18,
      innovator_hall: 0.14,
      runway_deck: 0.1,
    };

    const targetVolume = areaVolumes[currentArea] || 0.15;
    gainNodeRef.current.gain.linearRampToValueAtTime(
      targetVolume,
      audioContextRef.current?.currentTime + 0.5 || 0
    );
  }, [currentArea, isMuted]);

  return null; // Audio-only component
}