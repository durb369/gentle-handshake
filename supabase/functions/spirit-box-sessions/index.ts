import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { validateDeviceId, createErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-device-id",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    if (req.method === "POST") {
      const body = await req.json();
      const deviceValidation = validateDeviceId(body.deviceId);
      if (!deviceValidation.valid) {
        return createErrorResponse(deviceValidation.error!, 401, corsHeaders);
      }

      if (action === "save") {
        const { deviceId, startedAt, endedAt, durationSeconds, words } = body;
        const { data, error } = await supabase
          .from("spirit_box_sessions")
          .insert({
            device_id: deviceId,
            started_at: startedAt,
            ended_at: endedAt,
            duration_seconds: durationSeconds,
            word_count: words?.length || 0,
            words: words || [],
          })
          .select("id")
          .single();

        if (error) throw error;
        return new Response(JSON.stringify({ id: data.id }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "delete") {
        const { deviceId, sessionId } = body;
        const { error } = await supabase
          .from("spirit_box_sessions")
          .delete()
          .eq("id", sessionId)
          .eq("device_id", deviceId);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (action === "list") {
        const { deviceId } = body;
        const { data, error } = await supabase
          .from("spirit_box_sessions")
          .select("*")
          .eq("device_id", deviceId)
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        return new Response(JSON.stringify({ sessions: data }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return createErrorResponse("Invalid request", 400, corsHeaders);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[SPIRIT-BOX-SESSIONS] ERROR:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
