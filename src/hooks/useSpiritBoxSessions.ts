import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceId } from "@/hooks/useDeviceId";
import type { SpiritWord } from "@/hooks/useSpiritBox";
import { toast } from "sonner";

export interface SpiritBoxSession {
  id: string;
  device_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  word_count: number;
  words: SpiritWord[];
  created_at: string;
}

export function useSpiritBoxSessions() {
  const deviceId = useDeviceId();
  const [sessions, setSessions] = useState<SpiritBoxSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("spirit-box-sessions?action=list", {
        body: { deviceId },
      });
      if (error) throw error;
      setSessions(data?.sessions || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const saveSession = useCallback(async (
    startedAt: Date,
    endedAt: Date,
    words: SpiritWord[],
  ) => {
    if (!deviceId || words.length === 0) {
      toast.error("No words captured to save.");
      return null;
    }
    setSaving(true);
    try {
      const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);
      const { data, error } = await supabase.functions.invoke("spirit-box-sessions?action=save", {
        body: {
          deviceId,
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          durationSeconds,
          words: words.map(w => ({
            word: w.word,
            frequency: w.frequency,
            intensity: w.intensity,
            timestamp: w.timestamp,
          })),
        },
      });
      if (error) throw error;
      toast.success("Session saved!");
      await fetchSessions();
      return data?.id;
    } catch (err) {
      console.error("Failed to save session:", err);
      toast.error("Failed to save session.");
      return null;
    } finally {
      setSaving(false);
    }
  }, [deviceId, fetchSessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    if (!deviceId) return;
    try {
      const { error } = await supabase.functions.invoke("spirit-box-sessions?action=delete", {
        body: { deviceId, sessionId },
      });
      if (error) throw error;
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Session deleted.");
    } catch (err) {
      console.error("Failed to delete session:", err);
      toast.error("Failed to delete session.");
    }
  }, [deviceId]);

  return { sessions, loading, saving, fetchSessions, saveSession, deleteSession };
}
