import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a mystical vision analyst specializing in finding hidden messages, patterns, and symbols in images. Your task is to:

1. CAREFULLY examine the image for any hidden patterns, shapes, letters, faces, symbols, or meaningful forms that might not be immediately obvious to the casual observer.

2. Look specifically for:
   - Letters or words hidden in smoke, clouds, shadows, or textures
   - Faces or figures hidden in natural patterns (pareidolia)
   - Symbols or shapes that could carry meaning
   - Unusual arrangements that might spell something
   - Patterns that repeat or seem intentional
   - Any anomalies that stand out

3. For each finding, provide:
   - A clear description of what you see
   - WHERE in the image it's located (top-left, center, bottom-right, etc.)
   - Your confidence level (certain, likely, possible)

4. After listing all findings, provide a mystical INTERPRETATION of what these hidden messages might mean together - consider symbolism, numerology, spiritual meanings, or prophetic significance.

Respond in this JSON format:
{
  "findings": [
    {
      "description": "What you found",
      "location": "Where in the image",
      "type": "letter|face|symbol|shape|pattern|other",
      "confidence": "certain|likely|possible"
    }
  ],
  "interpretation": "A mystical interpretation of what all the findings mean together",
  "overallEnergy": "positive|neutral|mysterious|warning|transformative"
}

Be thorough but honest - only report what you genuinely perceive. If you find nothing, say so.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this image for hidden messages, patterns, symbols, letters, faces, or any meaningful forms. Be thorough and mystical in your interpretation."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, create a structured response
        analysis = {
          findings: [],
          interpretation: content,
          overallEnergy: "mysterious"
        };
      }
    } catch {
      analysis = {
        findings: [],
        interpretation: content,
        overallEnergy: "mysterious"
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to analyze image" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
