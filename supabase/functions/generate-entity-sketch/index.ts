import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { validateDeviceId, validateEntitySketchRequest, createErrorResponse } from "../_shared/validation.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-ENTITY-SKETCH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const body = await req.json();
    const { 
      deviceId, 
      entityType, 
      entityDescription, 
      intent, 
      powerLevel, 
      scanId, 
      findingIndex,
      sourceImageUrl,
      boundingBox 
    } = body;
    
    // Validate device ID
    const deviceValidation = validateDeviceId(deviceId);
    if (!deviceValidation.valid) {
      logStep("Device validation failed", { error: deviceValidation.error });
      return createErrorResponse(deviceValidation.error!, 401, corsHeaders);
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(deviceId, "generate-entity-sketch");
    if (!rateLimit.allowed) {
      logStep("Rate limit exceeded", { deviceId: deviceId.substring(0, 20), remaining: rateLimit.remaining });
      return rateLimitResponse(rateLimit, corsHeaders);
    }

    // Validate entity sketch request
    const entityValidation = validateEntitySketchRequest({
      entityType,
      entityDescription,
      intent,
      powerLevel,
    });
    if (!entityValidation.valid) {
      logStep("Entity validation failed", { error: entityValidation.error });
      return createErrorResponse(entityValidation.error!, 400, corsHeaders);
    }

    const sanitized = entityValidation.sanitized!;
    logStep("Validation passed", { 
      entityType: sanitized.entityType, 
      hasSourceImage: !!sourceImageUrl, 
      hasBoundingBox: !!boundingBox,
      remaining: rateLimit.remaining
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the prompt for transforming the detected region into a mystical sketch
    const sketchPrompt = `Transform this image into a haunting supernatural revelation - as if the veil between worlds has lifted to expose what lies beneath.

DETECTED ENTITY: ${sanitized.entityType}
${sanitized.entityDescription ? `MANIFESTATION: ${sanitized.entityDescription}` : ''}
${sanitized.intent ? `SPIRITUAL INTENT: ${sanitized.intent}` : ''}
${sanitized.powerLevel ? `POWER RESONANCE: ${sanitized.powerLevel}` : ''}

ART DIRECTION:
- Style: Dark Renaissance occult illustration meets Victorian spirit photography
- Medium: Aged parchment with ink, charcoal, and silver-point technique
- Atmosphere: Chiaroscuro lighting with deep shadows bleeding into luminous highlights

CRITICAL VISUAL ELEMENTS:
1. PRESERVE the exact silhouettes, forms, and spatial arrangement from the source - this IS the entity
2. Apply heavy crosshatching and stippling to create depth and texture
3. Add crackling energy lines and etheric wisps emanating from the form
4. Include subtle sacred geometry patterns (vesica piscis, flower of life fragments) in the background
5. Create a halo or aura effect using radiating fine lines
6. Add aged paper texture with foxing and torn edges
7. Incorporate alchemical or runic symbols floating near the entity

COLOR PALETTE:
- Primarily sepia and burnt umber tones on aged cream parchment
- Accent with spectral blue-white glow around ethereal elements
- Deep shadow areas in rich charcoal black
- Optional: faint violet or gold leaf highlights on energy manifestations

MOOD: Reverent yet unsettling - like discovering a forbidden illustration in an ancient grimoire that reveals truths the eye cannot normally perceive.

The final image should feel like authentic occult documentation - something a Victorian spiritualist or Renaissance alchemist would have drawn after witnessing a genuine supernatural phenomenon.`;

    logStep("Calling AI image generation");

    // Build the message content - include source image if available
    const messageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      { type: "text", text: sketchPrompt }
    ];

    // If we have a source image, include it for image-to-image transformation
    if (sourceImageUrl && typeof sourceImageUrl === 'string' && sourceImageUrl.startsWith('data:image/')) {
      messageContent.push({
        type: "image_url",
        image_url: { url: sourceImageUrl }
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return createErrorResponse("Rate limit exceeded. Please try again in a moment.", 429, corsHeaders);
      }
      if (response.status === 402) {
        return createErrorResponse("AI usage limit reached. Please add credits to continue.", 402, corsHeaders);
      }
      const errorText = await response.text();
      logStep("AI gateway error", { status: response.status, error: errorText });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error("No image generated from AI");
    }

    logStep("Image generated successfully");

    // Upload the base64 image to Supabase storage using service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Extract base64 data
    const base64Data = imageUrl.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });

    const fileName = `${deviceId}/${Date.now()}-${sanitized.entityType.replace(/\s+/g, '-')}.png`;
    
    const { error: uploadError } = await supabaseClient.storage
      .from("entity-sketches")
      .upload(fileName, blob);

    if (uploadError) {
      logStep("Upload error", { error: uploadError });
      throw new Error("Failed to upload sketch to storage");
    }

    const { data: urlData } = supabaseClient.storage
      .from("entity-sketches")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;
    logStep("Sketch uploaded", { publicUrl });

    // Save to database using service role (store path for signed URLs, keep old URL for backward compat)
    const { data: sketchRecord, error: dbError } = await supabaseClient
      .from("entity_sketches")
      .insert({
        device_id: deviceId,
        scan_id: scanId || null,
        finding_index: findingIndex ?? 0,
        entity_type: sanitized.entityType,
        entity_description: sanitized.entityDescription,
        sketch_url: publicUrl,
        sketch_path: fileName,
      })
      .select()
      .single();

    if (dbError) {
      logStep("Database error", { error: dbError });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sketch_url: publicUrl,
      sketch_path: fileName,
      sketch_id: sketchRecord?.id 
    }), {
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
