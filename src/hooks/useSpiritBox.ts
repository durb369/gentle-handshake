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

export type ScanMode = "fm" | "am" | "whitenoise" | "evp";

export const SCAN_MODE_INFO: Record<ScanMode, { label: string; description: string; icon: string }> = {
  fm: { label: "FM Sweep", description: "Classic FM radio sweep across frequencies", icon: "Radio" },
  am: { label: "AM Sweep", description: "Low-frequency AM band with crackly distortion", icon: "Gauge" },
  whitenoise: { label: "White Noise", description: "Raw static — spirits shape the noise", icon: "AudioLines" },
  evp: { label: "EVP Mode", description: "Ultra-quiet listening for electronic voice phenomena", icon: "Mic" },
};

interface SpiritBoxState {
  isScanning: boolean;
  currentFrequency: number;
  scanSpeed: number;
  words: SpiritWord[];
  signalStrength: number;
  scanMode: ScanMode;
}

// Audio setup per mode
function createModeAudio(audioCtx: AudioContext, gainNode: GainNode, mode: ScanMode) {
  const bufferSize = audioCtx.sampleRate * 0.5;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill noise buffer based on mode
  for (let i = 0; i < bufferSize; i++) {
    switch (mode) {
      case "am": {
        // AM: heavier crackle with pops
        const base = (Math.random() * 2 - 1) * 0.25;
        const crackle = Math.random() < 0.02 ? (Math.random() - 0.5) * 1.2 : 0;
        data[i] = base + crackle;
        break;
      }
      case "whitenoise": {
        // Pure white noise, louder
        data[i] = (Math.random() * 2 - 1) * 0.4;
        break;
      }
      case "evp": {
        // Very quiet, almost silent with occasional micro-sounds
        const quiet = (Math.random() * 2 - 1) * 0.06;
        const whisper = Math.random() < 0.005 ? (Math.random() - 0.5) * 0.5 : 0;
        data[i] = quiet + whisper;
        break;
      }
      default: {
        // FM: standard static
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
    }
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const filter = audioCtx.createBiquadFilter();

  switch (mode) {
    case "am":
      filter.type = "lowpass";
      filter.frequency.value = 1200;
      filter.Q.value = 0.8;
      break;
    case "whitenoise":
      filter.type = "allpass";
      filter.frequency.value = 3000;
      filter.Q.value = 0.1;
      break;
    case "evp":
      filter.type = "highpass";
      filter.frequency.value = 3500;
      filter.Q.value = 2.0;
      break;
    default: // fm
      filter.type = "bandpass";
      filter.frequency.value = 2000;
      filter.Q.value = 1.5;
  }

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  source.start();

  return { source, filter };
}

// Frequency sweep behavior per mode
function getFrequencyStep(mode: ScanMode, speed: number, currentFreq: number): { newFreq: number; min: number; max: number } {
  switch (mode) {
    case "am":
      // AM: 530-1700 kHz range, displayed as 53.0-170.0 scaled
      const amStep = speed * 0.8;
      let amFreq = currentFreq + amStep;
      if (amFreq > 170.0) amFreq = 53.0;
      return { newFreq: amFreq, min: 53.0, max: 170.0 };
    case "whitenoise":
      // No sweep, just jitter
      return { newFreq: 0 + Math.random() * 100, min: 0, max: 100 };
    case "evp":
      // Very slow creep
      const evpStep = speed * 0.05;
      let evpFreq = currentFreq + evpStep;
      if (evpFreq > 108.0) evpFreq = 87.5;
      return { newFreq: evpFreq, min: 87.5, max: 108.0 };
    default:
      // FM sweep
      let fmFreq = currentFreq + (speed * 0.3);
      if (fmFreq > 108.0) fmFreq = 87.5;
      return { newFreq: fmFreq, min: 87.5, max: 108.0 };
  }
}

// Filter modulation per mode during sweep
function modulateFilter(mode: ScanMode, filter: BiquadFilterNode, freq: number, ranges: { min: number; max: number }) {
  const normalized = (freq - ranges.min) / (ranges.max - ranges.min);
  switch (mode) {
    case "am":
      filter.frequency.value = 400 + normalized * 800;
      break;
    case "whitenoise":
      // Subtle random drift
      filter.frequency.value = 1000 + Math.random() * 4000;
      break;
    case "evp":
      filter.frequency.value = 3000 + normalized * 3000;
      break;
    default:
      filter.frequency.value = 800 + normalized * 1025;
  }
}

export function useSpiritBox() {
  const deviceId = useDeviceId();
  const [state, setState] = useState<SpiritBoxState>({
    isScanning: false,
    currentFrequency: 87.5,
    scanSpeed: 5,
    words: [],
    signalStrength: 0,
    scanMode: "fm",
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<{ source: AudioBufferSourceNode; filter: BiquadFilterNode } | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frequencyRef = useRef(87.5);
  const modeRef = useRef<ScanMode>("fm");

  const setScanMode = useCallback((mode: ScanMode) => {
    modeRef.current = mode;
    setState(prev => ({ ...prev, scanMode: mode }));
  }, []);

  const fetchSpiritWords = useCallback(async () => {
    if (!deviceId) return;

    try {
      const { data, error } = await supabase.functions.invoke("spirit-box", {
        body: {
          deviceId,
          frequency: frequencyRef.current,
          scanSpeed: state.scanSpeed,
          scanMode: modeRef.current,
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
    const mode = modeRef.current;
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    const gain = audioCtx.createGain();
    gain.gain.value = mode === "evp" ? 0.06 : 0.15;
    gainRef.current = gain;

    const noiseSetup = createModeAudio(audioCtx, gain, mode);
    sourceRef.current = noiseSetup;

    setState(prev => ({ ...prev, isScanning: true }));

    // Frequency sweep
    scanIntervalRef.current = setInterval(() => {
      setState(prev => {
        const { newFreq, min, max } = getFrequencyStep(modeRef.current, prev.scanSpeed, prev.currentFrequency);
        frequencyRef.current = newFreq;

        const signalStrength = modeRef.current === "evp"
          ? Math.random() * 40
          : Math.random() * 100;

        if (sourceRef.current?.filter) {
          modulateFilter(modeRef.current, sourceRef.current.filter, newFreq, { min, max });
          if (gainRef.current) {
            const baseGain = modeRef.current === "evp" ? 0.03 : 0.08;
            const variance = modeRef.current === "evp" ? 0.04 : 0.12;
            gainRef.current.gain.value = baseGain + Math.random() * variance;
          }
        }

        return { ...prev, currentFrequency: newFreq, signalStrength };
      });
    }, modeRef.current === "evp" ? 500 : 200);

    // Sporadic word fetching
    const fetchInterval = () => {
      const roll = Math.random();
      let delay: number;

      // EVP mode has longer silences
      if (modeRef.current === "evp") {
        delay = roll < 0.5 ? 12000 + Math.random() * 18000 : 6000 + Math.random() * 8000;
      } else if (modeRef.current === "whitenoise") {
        // White noise: medium cadence
        delay = roll < 0.3 ? 6000 + Math.random() * 10000 : 3000 + Math.random() * 4000;
      } else {
        // FM/AM
        if (roll < 0.3) delay = 8000 + Math.random() * 12000;
        else if (roll < 0.6) delay = 5000 + Math.random() * 5000;
        else delay = 2000 + Math.random() * 2000;
      }

      wordIntervalRef.current = setTimeout(() => {
        fetchSpiritWords();
        if (scanIntervalRef.current) fetchInterval();
      }, delay) as unknown as ReturnType<typeof setInterval>;
    };

    const initialDelay = modeRef.current === "evp" ? 5000 + Math.random() * 5000 : 3000 + Math.random() * 3000;
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
    if (sourceRef.current?.filter) {
      sourceRef.current.filter.frequency.value = 400 + (tone / 100) * 5600;
    }
  }, []);

  const clearLog = useCallback(() => {
    setState(prev => ({ ...prev, words: [] }));
  }, []);

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
    setScanMode,
    setVolume,
    setTone,
    clearLog,
  };
}
