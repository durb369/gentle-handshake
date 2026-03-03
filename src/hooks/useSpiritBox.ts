import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";

export interface SpiritWord {
  id: string;
  word: string;
  frequency: number;
  timestamp: Date;
  intensity: "faint" | "clear" | "strong";
}

interface SpiritBoxState {
  isScanning: boolean;
  currentFrequency: number;
  scanSpeed: number; // 1-10
  words: SpiritWord[];
  signalStrength: number; // 0-100
}

// Web Audio API noise generator for that authentic spirit box crackle
function createStaticNoise(audioCtx: AudioContext, gainNode: GainNode) {
  const bufferSize = audioCtx.sampleRate * 0.5;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // Bandpass filter to simulate radio tuning
  const filter = audioCtx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 2000;
  filter.Q.value = 1.5;

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start();

  return { source, filter };
}

export function useSpiritBox() {
  const deviceId = useDeviceId();
  const [state, setState] = useState<SpiritBoxState>({
    isScanning: false,
    currentFrequency: 87.5,
    scanSpeed: 5,
    words: [],
    signalStrength: 0,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<{ source: AudioBufferSourceNode; filter: BiquadFilterNode } | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frequencyRef = useRef(87.5);

  const updateFrequency = useCallback((freq: number) => {
    frequencyRef.current = freq;
    setState(prev => ({ ...prev, currentFrequency: freq }));

    // Shift the filter frequency based on radio frequency for effect
    if (sourceRef.current?.filter) {
      sourceRef.current.filter.frequency.value = 800 + (freq - 87.5) * 50;
    }
  }, []);

  const fetchSpiritWords = useCallback(async () => {
    if (!deviceId) return;

    try {
      const { data, error } = await supabase.functions.invoke("spirit-box", {
        body: {
          deviceId,
          frequency: frequencyRef.current,
          scanSpeed: state.scanSpeed,
        },
      });

      if (error) {
        console.error("Spirit box error:", error);
        return;
      }

      if (data?.words && Array.isArray(data.words)) {
        const newWords: SpiritWord[] = data.words.map((w: any, i: number) => ({
          id: `${Date.now()}-${i}`,
          word: w.word,
          frequency: frequencyRef.current,
          timestamp: new Date(),
          intensity: w.intensity || "faint",
        }));

        setState(prev => ({
          ...prev,
          words: [...newWords, ...prev.words].slice(0, 200),
          signalStrength: Math.min(100, Math.random() * 60 + 40),
        }));
      }
    } catch (err) {
      console.error("Spirit box fetch error:", err);
    }
  }, [deviceId, state.scanSpeed]);

  const startScanning = useCallback(() => {
    // Start audio
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    const gain = audioCtx.createGain();
    gain.gain.value = 0.15;
    gainRef.current = gain;

    const noiseSetup = createStaticNoise(audioCtx, gain);
    sourceRef.current = noiseSetup;

    setState(prev => ({ ...prev, isScanning: true }));

    // Frequency sweep
    scanIntervalRef.current = setInterval(() => {
      setState(prev => {
        let newFreq = prev.currentFrequency + (prev.scanSpeed * 0.3);
        if (newFreq > 108.0) newFreq = 87.5;
        frequencyRef.current = newFreq;

        // Randomize signal strength for visual flair
        const signalStrength = Math.random() * 100;

        if (sourceRef.current?.filter) {
          sourceRef.current.filter.frequency.value = 800 + (newFreq - 87.5) * 50;
          // Slight volume variation
          if (gainRef.current) {
            gainRef.current.gain.value = 0.08 + Math.random() * 0.12;
          }
        }

        return { ...prev, currentFrequency: newFreq, signalStrength };
      });
    }, 200);

    // Sporadic word fetching - varies between silence and bursts
    const fetchInterval = () => {
      // Randomize delay: sometimes long silence (8-20s), sometimes quick bursts (2-4s)
      const roll = Math.random();
      let delay: number;
      if (roll < 0.3) {
        // Long silence - nothing for a while
        delay = 8000 + Math.random() * 12000; // 8-20 seconds
      } else if (roll < 0.6) {
        // Medium gap
        delay = 5000 + Math.random() * 5000; // 5-10 seconds
      } else {
        // Quick burst - words come fast
        delay = 2000 + Math.random() * 2000; // 2-4 seconds
      }

      wordIntervalRef.current = setTimeout(() => {
        fetchSpiritWords();
        if (scanIntervalRef.current) fetchInterval();
      }, delay) as unknown as ReturnType<typeof setInterval>;
    };

    // Initial fetch after 3-6 seconds (don't always start immediately)
    const initialDelay = 3000 + Math.random() * 3000;
    wordIntervalRef.current = setTimeout(() => {
      fetchSpiritWords();
      fetchInterval();
    }, initialDelay) as unknown as ReturnType<typeof setInterval>;
  }, [fetchSpiritWords]);

  const stopScanning = useCallback(() => {
    if (sourceRef.current?.source) {
      try { sourceRef.current.source.stop(); } catch {}
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
    }
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (wordIntervalRef.current) clearTimeout(wordIntervalRef.current as unknown as number);

    sourceRef.current = null;
    audioCtxRef.current = null;
    gainRef.current = null;
    scanIntervalRef.current = null;
    wordIntervalRef.current = null;

    setState(prev => ({ ...prev, isScanning: false, signalStrength: 0 }));
  }, []);

  const setScanSpeed = useCallback((speed: number) => {
    setState(prev => ({ ...prev, scanSpeed: Math.max(1, Math.min(10, speed)) }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (gainRef.current) {
      gainRef.current.gain.value = volume * 0.3;
    }
  }, []);

  const setTone = useCallback((tone: number) => {
    // tone: 0-100, maps to filter frequency 400-6000 Hz
    if (sourceRef.current?.filter) {
      sourceRef.current.filter.frequency.value = 400 + (tone / 100) * 5600;
    }
  }, []);

  const clearLog = useCallback(() => {
    setState(prev => ({ ...prev, words: [] }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return {
    ...state,
    startScanning,
    stopScanning,
    setScanSpeed,
    setVolume,
    setTone,
    clearLog,
    updateFrequency,
  };
}
