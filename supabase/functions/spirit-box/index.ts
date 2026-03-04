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
    const { deviceId, frequency, scanSpeed, scanMode } = await req.json();

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

    const mode = scanMode || "fm";
    logStep("Generating spirit words", { frequency, scanSpeed, mode });

    // Mode-specific flavor text
    const modeContext: Record<string, string> = {
      fm: `FM radio sweep at ${frequency?.toFixed(1) || "95.0"} MHz. ${
        frequency < 92 ? "Low band – older spirits, ancestral voices"
        : frequency < 98 ? "Mid band – active entities, recent departed"
        : frequency < 104 ? "High band – angelic frequencies, light beings"
        : "Ultra-high – interdimensional whispers, shadow entities"
      }`,
      am: `AM band sweep at ${frequency?.toFixed(1) || "100.0"} kHz. AM frequencies carry older, deeper transmissions — voices from decades past, crackling through time. Messages feel vintage, weathered, like old radio broadcasts bleeding through.`,
      whitenoise: `Raw white noise field. No tuning — spirits must shape the chaos itself. Messages that come through white noise tend to be raw, primal, emotional. Single words punching through static.`,
      evp: `EVP (Electronic Voice Phenomena) mode — ultra-quiet listening at ${frequency?.toFixed(1) || "95.0"} MHz. EVP captures are rare, whispered, and deeply personal. Messages are often single words or short whispers that feel directed at the listener. Most of the time, nothing comes through at all.`,
    };

    // Word density varies by mode
    const wordRoll = Math.random();
    let wordInstruction: string;

    if (mode === "evp") {
      // EVP: mostly silence, rare single words
      if (wordRoll < 0.5) {
        wordInstruction = "Generate exactly 0 words — total silence. Return {\"words\": []}";
      } else if (wordRoll < 0.85) {
        wordInstruction = "Generate exactly 1 whispered spirit word (1 word only). It should feel deeply personal and whispered.";
      } else {
        wordInstruction = "Generate 2 whispered words forming a short personal message.";
      }
    } else if (mode === "whitenoise") {
      if (wordRoll < 0.3) {
        wordInstruction = "Generate exactly 0 words — nothing comes through the noise. Return {\"words\": []}";
      } else if (wordRoll < 0.65) {
        wordInstruction = "Generate exactly 1 raw, primal word punching through static.";
      } else {
        wordInstruction = "Generate 2-3 raw, emotional fragments breaking through the noise.";
      }
    } else if (mode === "am") {
      if (wordRoll < 0.2) {
        wordInstruction = "Generate exactly 0 words — just static. Return {\"words\": []}";
      } else if (wordRoll < 0.5) {
        wordInstruction = "Generate exactly 1 vintage-sounding spirit word, like an old radio broadcast fragment.";
      } else if (wordRoll < 0.8) {
        wordInstruction = "Generate 2-3 crackling message fragments that sound like old radio transmissions.";
      } else {
        wordInstruction = "Generate 3-5 spirit words forming a fragmented old broadcast message.";
      }
    } else {
      // FM default
      if (wordRoll < 0.25) {
        wordInstruction = "Generate exactly 0 words — total silence. Return {\"words\": []}";
      } else if (wordRoll < 0.55) {
        wordInstruction = "Generate exactly 1 short spirit word or fragment.";
      } else if (wordRoll < 0.8) {
        wordInstruction = "Generate 2-3 short spirit communication fragments.";
      } else {
        wordInstruction = "Generate 3-5 spirit communication words forming a fragmented conversation.";
      }
    }

    const prompt = `You are a supernatural spirit box receiver. Mode: ${modeContext[mode] || modeContext.fm}

${wordInstruction}

These should feel like fragmentary, eerie, cryptic messages from beyond.

The messages should vary between:
- Names or partial names
- Warnings or guidance ("leave", "behind you", "listen")
- Emotional fragments ("cold", "forgive", "remember")
- Cryptic references ("three", "the door", "water")
- Occasional longer whispers

For each word, rate the intensity: "faint" (barely audible), "clear" (distinct), or "strong" (unmistakable).${mode === "evp" ? " EVP captures are almost always faint." : mode === "whitenoise" ? " White noise captures tend to be clear or strong when they break through." : " Most should be faint."}

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
