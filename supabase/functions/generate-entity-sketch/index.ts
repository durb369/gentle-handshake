import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-ENTITY-SKETCH] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
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
    } = await req.json();
    
    if (!deviceId || !entityType) {
      throw new Error("Device ID and entity type are required");
    }
    
    logStep("Generating sketch for", { entityType, intent, powerLevel, hasSourceImage: !!sourceImageUrl, hasBoundingBox: !!boundingBox });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the prompt for transforming the detected region into a mystical sketch
    const sketchPrompt = `Transform this image region into a mystical, hand-drawn pencil/charcoal sketch illustration.
This region shows a detected ${entityType}.
Style: Dark, atmospheric sketch with ethereal glow effects. Ancient manuscript or grimoire illustration style.
Entity details: ${entityDescription || entityType}
${intent ? `Intent/Mood: ${intent}` : ''}
${powerLevel ? `Power level: ${powerLevel}` : ''}

IMPORTANT: Keep the EXACT shapes, forms and structures visible in the source image but transform them into a mystical sketch style.
Make it look like it was drawn by a medieval occultist or spiritual seer - detailed, mysterious, with intricate linework and shadowing.
Add subtle supernatural elements like faint auras, energy wisps, or dimensional distortions around what you see.
Black and white with hints of ethereal blue or purple glow. High contrast, dramatic lighting.
The sketch should clearly show what was detected in this specific region of the photo.`;

    logStep("Calling AI image generation with source image", { promptLength: sketchPrompt.length });

    // Build the message content - include source image if available
    const messageContent: any[] = [
      { type: "text", text: sketchPrompt }
    ];

    // If we have a source image, include it for image-to-image transformation
    if (sourceImageUrl) {
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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
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

    // Upload the base64 image to Supabase storage
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

    const fileName = `${deviceId}/${Date.now()}-${entityType.replace(/\s+/g, '-')}.png`;
    
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

    // Save to database
    const { data: sketchRecord, error: dbError } = await supabaseClient
      .from("entity_sketches")
      .insert({
        device_id: deviceId,
        scan_id: scanId || null,
        finding_index: findingIndex ?? 0,
        entity_type: entityType,
        entity_description: entityDescription,
        sketch_url: publicUrl,
      })
      .select()
      .single();

    if (dbError) {
      logStep("Database error", { error: dbError });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      sketch_url: publicUrl,
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
