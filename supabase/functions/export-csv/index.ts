import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { validateDeviceId, createErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deviceId } = await req.json();

    const deviceValidation = validateDeviceId(deviceId);
    if (!deviceValidation.valid) {
      return createErrorResponse(deviceValidation.error!, 401, corsHeaders);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch all scans with findings
    const { data: scans, error } = await supabaseClient
      .from("spirit_scans")
      .select("*, entity_findings(*)")
      .eq("device_id", deviceId)
      .order("created_at", { ascending: false });

    if (error) {
      return createErrorResponse("Failed to fetch data", 500, corsHeaders);
    }

    // Build CSV rows - one row per entity finding, with scan context
    const headers = [
      "scan_date", "overall_energy", "spiritual_activity", "dominant_energy",
      "protection_needed", "protection_level", "synthesis",
      "entity_type", "description", "location", "intent",
      "power_level", "confidence", "is_attached", "message",
    ];

    const rows: string[][] = [];

    for (const scan of scans || []) {
      const findings = scan.entity_findings || [];
      if (findings.length === 0) {
        // Still include scans with no entities
        rows.push([
          new Date(scan.created_at).toISOString(),
          scan.overall_energy || "", scan.spiritual_activity || "",
          scan.dominant_energy || "", String(scan.protection_needed || false),
          scan.protection_level || "", scan.synthesis || "",
          "", "", "", "", "", "", "", "",
        ]);
      } else {
        for (const f of findings) {
          rows.push([
            new Date(scan.created_at).toISOString(),
            scan.overall_energy || "", scan.spiritual_activity || "",
            scan.dominant_energy || "", String(scan.protection_needed || false),
            scan.protection_level || "", scan.synthesis || "",
            f.entity_type || "", f.description || "", f.location || "",
            f.intent || "", f.power_level || "", f.confidence || "",
            String(f.is_attached || false), f.message || "",
          ]);
        }
      }
    }

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=spirit-vision-export.csv",
      },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
