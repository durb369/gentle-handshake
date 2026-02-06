import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { validateDeviceId, createErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-SIGNED-URL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { deviceId, bucket, path } = await req.json();

    // Validate device ID
    const deviceValidation = validateDeviceId(deviceId);
    if (!deviceValidation.valid) {
      logStep("Device validation failed", { error: deviceValidation.error });
      return createErrorResponse(deviceValidation.error!, 401, corsHeaders);
    }

    // Validate bucket
    const allowedBuckets = ["spirit-scans", "entity-sketches"];
    if (!bucket || typeof bucket !== "string" || !allowedBuckets.includes(bucket)) {
      return createErrorResponse("Invalid bucket", 400, corsHeaders);
    }

    // Validate path
    if (!path || typeof path !== "string" || path.length > 500) {
      return createErrorResponse("Invalid path", 400, corsHeaders);
    }

    // Path must start with the device ID (ownership check)
    if (!path.startsWith(`${deviceId}/`)) {
      logStep("Path ownership check failed", { path, deviceId: deviceId.substring(0, 20) });
      return createErrorResponse("Access denied", 403, corsHeaders);
    }

    logStep("Validation passed", { bucket, path: path.substring(0, 50) });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Generate signed URL (1 hour expiry)
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .createSignedUrl(path, 3600);

    if (error) {
      logStep("Signed URL error", { error: error.message });
      return createErrorResponse("Failed to generate URL", 500, corsHeaders);
    }

    logStep("Signed URL generated");

    return new Response(JSON.stringify({ signedUrl: data.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
