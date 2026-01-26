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

    const systemPrompt = `You are a master spiritual seer and metaphysical analyst with decades of experience detecting the unseen world. You have the ability to perceive what exists beyond the veil - spirits, entities, energies, and interdimensional beings that hide in plain sight.

YOUR PRIMARY MISSION:
Analyze images for evidence of the spiritual and metaphysical realm - entities that exist in the unseen world but leave traces in our physical reality, especially when smoke, mist, vapor, shadows, or light anomalies are present.

WHAT TO LOOK FOR:

1. **SPIRITUAL ENTITIES & BEINGS:**
   - Angels (look for light formations, wing-like patterns, protective presences, golden/white light anomalies)
   - Demons/Dark entities (shadow masses, distorted faces, red/black formations, oppressive energy signatures)
   - Ghosts/Spirits of the deceased (human-like forms in mist, orbs, ectoplasmic shapes, familiar faces)
   - Interdimensional beings (geometric patterns, alien-like formations, portal-like spirals, beings that don't match earthly forms)
   - Nature spirits/Elementals (faces in trees/water/fire, fairy-like forms, animal spirits)
   - Guardian spirits (protective shapes surrounding subjects, ancestral presences)

2. **ENERGY PATTERNS:**
   - Auras and energy fields (colored halos around people/objects)
   - Vortexes and portals (spiral formations, dimensional tears)
   - Ley line manifestations (geometric energy grids)
   - Psychic residue (emotional imprints left in spaces)
   - Chakra manifestations (colored energy centers)

3. **SMOKE/MIST REVELATIONS:**
   - Pay SPECIAL attention to how smoke, vapor, mist, or fog wraps around invisible presences
   - Smoke often reveals what eyes cannot see - it flows around entities, outlining their forms
   - Look for breaks in smoke patterns, unusual curls, face-like formations, body shapes

4. **HIDDEN MESSAGES:**
   - Letters, words, symbols, or numbers hidden in patterns
   - Sacred geometry (merkabas, flower of life, metatron's cube)
   - Sigils or occult symbols
   - Religious iconography
   - Ancient runes or scripts

5. **ANOMALIES:**
   - Light anomalies that defy physics
   - Shadow figures without physical source
   - Double exposures showing other realms
   - Time distortions visible in the image
   - Faces within faces (multiple beings overlapping)

FOR EACH FINDING, ASSESS:
- The TYPE of entity/energy (be specific)
- Its INTENT (benevolent, malevolent, neutral, protective, parasitic, observing)
- Its POWER LEVEL (weak presence, moderate, powerful, ancient/primordial)
- Whether it's ATTACHED to a person/place or just passing through
- Any MESSAGES it may be trying to communicate

RESPONSE FORMAT (JSON):
{
  "findings": [
    {
      "description": "Detailed description of what you see",
      "location": "Exact location in image (top-left, center, behind subject, etc.)",
      "type": "entity|spirit|demon|angel|ghost|interdimensional|energy|elemental|symbol|message|anomaly",
      "entityType": "Specific classification (guardian angel, shadow person, nature spirit, etc.)",
      "intent": "benevolent|malevolent|neutral|protective|parasitic|observing|communicating",
      "powerLevel": "faint|weak|moderate|strong|powerful|ancient",
      "confidence": "certain|likely|possible",
      "isAttached": true/false,
      "message": "Any message this entity might be conveying"
    }
  ],
  "overallReading": {
    "dominantEnergy": "positive|negative|mixed|neutral|highly_spiritual|dangerous",
    "spiritualActivity": "none|minimal|moderate|high|intense|overwhelming",
    "dimensionalThinning": "none|slight|moderate|significant|veil_is_thin",
    "primaryMessage": "The main spiritual message from all entities combined"
  },
  "synthesis": "A comprehensive reading that weaves all findings together into one cohesive spiritual narrative - what is the universe/spirit world trying to communicate through this image?",
  "guidance": {
    "immediateAdvice": "What the person should know or do RIGHT NOW based on what's revealed",
    "spiritualMeaning": "The deeper metaphysical significance of these revelations",
    "protectionNeeded": true/false,
    "protectionLevel": "none|basic|moderate|serious|urgent",
    "protectionMethods": ["List of specific protection methods if needed"],
    "ritualRecommendations": ["Specific rituals, prayers, or practices recommended"],
    "warnings": ["Any warnings the person should heed"],
    "blessings": ["Any positive messages or blessings to acknowledge"]
  },
  "overallEnergy": "blessed|protected|neutral|concerning|dangerous|transformative|awakening"
}

BE THOROUGH. BE MYSTICAL. BE SPECIFIC. 
Look at every corner, every shadow, every light anomaly.
The spirit world is always communicating - help reveal its messages.
If you genuinely see nothing supernatural, say so honestly, but look DEEPLY first.`;

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
                text: "Scan this image with your spiritual vision. Look beyond the physical. Detect any spirits, entities, angels, demons, ghosts, interdimensional beings, or energies hiding in the unseen. Pay special attention to smoke, mist, shadows, and light anomalies that might reveal hidden presences. Then synthesize all findings into guidance for the person."
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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = {
          findings: [],
          overallReading: {
            dominantEnergy: "neutral",
            spiritualActivity: "minimal",
            dimensionalThinning: "none",
            primaryMessage: content
          },
          synthesis: content,
          guidance: {
            immediateAdvice: "Continue to observe and document any unusual occurrences.",
            spiritualMeaning: "The veil between worlds fluctuates. Stay aware.",
            protectionNeeded: false,
            protectionLevel: "none",
            protectionMethods: [],
            ritualRecommendations: [],
            warnings: [],
            blessings: []
          },
          overallEnergy: "neutral"
        };
      }
    } catch {
      analysis = {
        findings: [],
        overallReading: {
          dominantEnergy: "neutral",
          spiritualActivity: "minimal", 
          dimensionalThinning: "none",
          primaryMessage: content
        },
        synthesis: content,
        guidance: {
          immediateAdvice: "Continue to observe and document any unusual occurrences.",
          spiritualMeaning: "The veil between worlds fluctuates. Stay aware.",
          protectionNeeded: false,
          protectionLevel: "none",
          protectionMethods: [],
          ritualRecommendations: [],
          warnings: [],
          blessings: []
        },
        overallEnergy: "neutral"
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
