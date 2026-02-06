import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { validateDeviceId, createErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-USER-DATA] ${step}${detailsStr}`);
};

// Generate signed URL for a storage path
async function generateSignedUrl(
  supabaseClient: ReturnType<typeof createClient>,
  bucket: string,
  path: string
): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .createSignedUrl(path, 3600);
  if (error) {
    console.error(`Error generating signed URL for ${bucket}/${path}:`, error);
    return null;
  }
  return data.signedUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { deviceId, type, limit = 50 } = await req.json();

    // Validate device ID
    const deviceValidation = validateDeviceId(deviceId);
    if (!deviceValidation.valid) {
      logStep("Device validation failed", { error: deviceValidation.error });
      return createErrorResponse(deviceValidation.error!, 401, corsHeaders);
    }

    // Validate type
    const allowedTypes = ["scans", "sketches", "findings"];
    if (!type || typeof type !== "string" || !allowedTypes.includes(type)) {
      return createErrorResponse("Invalid type parameter", 400, corsHeaders);
    }

    // Validate limit
    const safeLimit = Math.min(Math.max(1, Number(limit) || 50), 100);

    logStep("Validation passed", { deviceId: deviceId.substring(0, 20), type, limit: safeLimit });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let data: unknown[] = [];

    if (type === "scans") {
      const { data: scans, error } = await supabaseClient
        .from("spirit_scans")
        .select("*, entity_findings(*)")
        .eq("device_id", deviceId)
        .order("created_at", { ascending: false })
        .limit(safeLimit);

      if (error) {
        logStep("Scans query error", { error: error.message });
        return createErrorResponse("Failed to fetch scans", 500, corsHeaders);
      }

      // Generate signed URLs for each scan's image
      data = await Promise.all(
        (scans || []).map(async (scan: { image_path?: string; image_url?: string }) => {
          const imagePath = scan.image_path;
          let signedUrl: string | null = null;
          if (imagePath) {
            signedUrl = await generateSignedUrl(supabaseClient, "spirit-scans", imagePath);
          }
          return {
            ...scan,
            image_url: signedUrl || scan.image_url,
          };
        })
      );
    } else if (type === "sketches") {
      const { data: sketches, error } = await supabaseClient
        .from("entity_sketches")
        .select("*")
        .eq("device_id", deviceId)
        .order("created_at", { ascending: false })
        .limit(safeLimit);

      if (error) {
        logStep("Sketches query error", { error: error.message });
        return createErrorResponse("Failed to fetch sketches", 500, corsHeaders);
      }

      // Generate signed URLs for each sketch
      data = await Promise.all(
        (sketches || []).map(async (sketch: { sketch_path?: string; sketch_url?: string }) => {
          const sketchPath = sketch.sketch_path;
          let signedUrl: string | null = null;
          if (sketchPath) {
            signedUrl = await generateSignedUrl(supabaseClient, "entity-sketches", sketchPath);
          }
          return {
            ...sketch,
            sketch_url: signedUrl || sketch.sketch_url,
          };
        })
      );
    } else if (type === "findings") {
      // First get scans for this device, then get findings
      const { data: scans } = await supabaseClient
        .from("spirit_scans")
        .select("id")
        .eq("device_id", deviceId);

      const scanIds = (scans || []).map((s: { id: string }) => s.id);
      
      if (scanIds.length > 0) {
        const { data: findings, error } = await supabaseClient
          .from("entity_findings")
          .select("*")
          .in("scan_id", scanIds)
          .order("created_at", { ascending: false })
          .limit(safeLimit);

        if (error) {
          logStep("Findings query error", { error: error.message });
          return createErrorResponse("Failed to fetch findings", 500, corsHeaders);
        }
        data = findings || [];
      }
    }

    logStep("Query complete", { count: data.length });

    return new Response(JSON.stringify({ data }), {
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
