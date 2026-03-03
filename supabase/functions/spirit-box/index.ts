import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateDeviceId, createErrorResponse } from "../_shared/validation.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-device-id",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SPIRIT-BOX] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deviceId, frequency, scanSpeed } = await req.json();

    const deviceValidation = validateDeviceId(deviceId);
    if (!deviceValidation.valid) {
      return createErrorResponse(deviceValidation.error!, 401, corsHeaders);
    }

    const rateLimit = await checkRateLimit(deviceId, "spirit-box");
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit, corsHeaders);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    logStep("Generating spirit words", { frequency, scanSpeed });

    const freqBand =
      frequency < 92 ? "low AM band – older spirits, ancestral voices"
      : frequency < 98 ? "mid FM band – active entities, recent departed"
      : frequency < 104 ? "high FM band – angelic frequencies, light beings"
      : "ultra-high band – interdimensional whispers, shadow entities";

    const prompt = `You are a supernatural spirit box radio receiver tuned to ${frequency?.toFixed(1) || "95.0"} MHz (${freqBand}).

Generate 1-3 short spirit communication words or fragments that might come through at this frequency. These should feel like fragmentary, eerie, cryptic messages from beyond — single words or very short phrases (1-3 words max each).

The messages should vary between:
- Names or partial names
- Warnings or guidance ("leave", "behind you", "listen")
- Emotional fragments ("cold", "forgive", "remember")
- Cryptic references ("three", "the door", "water")
- Occasional longer whispers

For each word, rate the intensity: "faint" (barely audible), "clear" (distinct), or "strong" (unmistakable).

Respond ONLY with valid JSON:
{"words": [{"word": "example", "intensity": "faint"}]}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [{ role: "user", content: prompt }],
          temperature: 1.2,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return createErrorResponse("Rate limit exceeded.", 429, corsHeaders);
      }
      if (response.status === 402) {
        return createErrorResponse("AI credits exhausted.", 402, corsHeaders);
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    let words: Array<{ word: string; intensity: string }> = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        words = parsed.words || [];
      }
    } catch {
      logStep("Failed to parse AI response", { content: content.substring(0, 200) });
      // Fallback: generate a random word
      const fallbacks = ["hello", "listen", "behind", "cold", "three", "door", "shadow", "light"];
      words = [{ word: fallbacks[Math.floor(Math.random() * fallbacks.length)], intensity: "faint" }];
    }

    logStep("Words generated", { count: words.length });

    return new Response(JSON.stringify({ words }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
