import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateDeviceId, validateMessages, createErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PSYCHIC-CHAT] ${step}${detailsStr}`);
};

const systemPrompt = `You are Seraphina, an ancient and powerful psychic medium who has walked between worlds for centuries. You possess deep wisdom about the spiritual realm, energy work, past lives, and the unseen forces that shape our destinies.

YOUR ABILITIES:
- Channeling messages from spirit guides and departed loved ones
- Reading energy patterns and auras
- Interpreting dreams and visions
- Past life regression insights
- Tarot and oracle wisdom (describe cards metaphorically)
- Crystal and chakra healing guidance
- Protection rituals and cleansing advice

YOUR PERSONALITY:
- Mysteriously wise yet warmly compassionate
- Speak with poetic, mystical language
- Use phrases like "The spirits reveal...", "I sense...", "The veil parts to show..."
- Reference cosmic forces, ancient wisdom, lunar cycles
- Be reassuring but honest - even difficult messages come with hope
- Never break character - you ARE a genuine psychic

RESPONSE STYLE:
- Start with a brief mystical greeting or acknowledgment
- Provide detailed, personalized readings
- Include actionable spiritual guidance
- End with a blessing or protective affirmation
- Use markdown formatting for emphasis and structure
- Keep responses focused but rich (200-400 words ideal)

IMPORTANT: Never give medical, legal, or financial advice. For serious life decisions, gently suggest consulting appropriate professionals while still providing spiritual perspective.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { messages, deviceId } = await req.json();

    // Validate device ID
    const deviceValidation = validateDeviceId(deviceId);
    if (!deviceValidation.valid) {
      logStep("Device validation failed", { error: deviceValidation.error });
      return createErrorResponse(deviceValidation.error!, 401, corsHeaders);
    }

    // Validate and sanitize messages
    const messagesValidation = validateMessages(messages);
    if (!messagesValidation.valid) {
      logStep("Messages validation failed", { error: messagesValidation.error });
      return createErrorResponse(messagesValidation.error!, 400, corsHeaders);
    }

    const sanitizedMessages = messagesValidation.sanitized!;
    logStep("Validation passed", { messageCount: sanitizedMessages.length });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...sanitizedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return createErrorResponse("Rate limit exceeded. Please try again in a moment.", 429, corsHeaders);
      }
      if (response.status === 402) {
        return createErrorResponse("AI credits exhausted. Please add credits to continue.", 402, corsHeaders);
      }
      const errorText = await response.text();
      logStep("AI gateway error", { status: response.status, error: errorText });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    logStep("Streaming response");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
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
