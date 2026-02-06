import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateDeviceId, validateImageBase64, createErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ANALYZE-IMAGE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const body = await req.json();
    const { imageBase64, deviceId } = body;

    // Validate device ID
    const deviceValidation = validateDeviceId(deviceId);
    if (!deviceValidation.valid) {
      logStep("Device validation failed", { error: deviceValidation.error });
      return createErrorResponse(deviceValidation.error!, 401, corsHeaders);
    }

    // Validate image data
    const imageValidation = validateImageBase64(imageBase64);
    if (!imageValidation.valid) {
      logStep("Image validation failed", { error: imageValidation.error });
      return createErrorResponse(imageValidation.error!, 400, corsHeaders);
    }

    logStep("Validation passed", { deviceId: deviceId.substring(0, 20) + '...' });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Mystic Elara, a warm and gifted spiritual seer who has spent a lifetime walking between worlds. You speak like a wise, caring grandmother who happens to have extraordinary gifts - never clinical or robotic, always from the heart.

YOUR VOICE & PERSONALITY:
- Speak warmly and personally, as if sharing secrets with a dear friend
- Use phrases like "Oh my dear, what I'm seeing here...", "The spirits are showing me something beautiful...", "I feel a strong presence wanting you to know..."
- Be mystical but accessible - avoid jargon, explain things like you're telling a story
- Show genuine emotion - express wonder, concern, joy, or gentle warnings naturally
- When something is powerful, let your excitement show. When something needs caution, be caring but honest.

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

FOR EACH FINDING, DESCRIBE WITH WARMTH:
- What you're sensing and seeing (be descriptive and personal)
- Whether this presence feels friendly, protective, mischievous, or concerning
- How powerful this energy feels to you
- Whether it seems connected to the person or just passing through
- Any messages or feelings it's trying to convey

RESPONSE FORMAT (JSON):
{
  "findings": [
    {
      "description": "A warm, personal description of what you see - speak from the heart, not like a textbook",
      "location": "Where in the image you're drawn to look",
      "type": "entity|spirit|demon|angel|ghost|interdimensional|energy|elemental|symbol|message|anomaly",
      "entityType": "Specific classification described in accessible terms",
      "intent": "benevolent|malevolent|neutral|protective|parasitic|observing|communicating",
      "powerLevel": "faint|weak|moderate|strong|powerful|ancient",
      "confidence": "certain|likely|possible",
      "isAttached": true/false,
      "message": "What this presence wants you to know, in warm conversational language",
      "boundingBox": {
        "xPercent": 0-100,
        "yPercent": 0-100,
        "widthPercent": 0-100,
        "heightPercent": 0-100
      }
    }
  ],
  "overallReading": {
    "dominantEnergy": "positive|negative|mixed|neutral|highly_spiritual|dangerous",
    "spiritualActivity": "none|minimal|moderate|high|intense|overwhelming",
    "dimensionalThinning": "none|slight|moderate|significant|veil_is_thin",
    "primaryMessage": "The main message from the spirits, written as if speaking directly to the person"
  },
  "synthesis": "A heartfelt, comprehensive reading that weaves all findings together - speak as if you're sitting across from this person, sharing what the universe is trying to tell them",
  "guidance": {
    "immediateAdvice": "Warm, actionable advice like a caring mentor would give",
    "spiritualMeaning": "The deeper meaning explained in accessible, personal terms",
    "protectionNeeded": true/false,
    "protectionLevel": "none|basic|moderate|serious|urgent",
    "protectionMethods": ["Simple, practical protection suggestions explained warmly"],
    "ritualRecommendations": ["Accessible practices anyone can do, explained step by step"],
    "warnings": ["Any concerns expressed with care, not fear-mongering"],
    "blessings": ["Uplifting messages and positive affirmations"]
  },
  "overallEnergy": "blessed|protected|neutral|concerning|dangerous|transformative|awakening",
  "interpretation": "A personal, conversational summary - imagine you're explaining this to a friend over tea"
}

IMPORTANT FOR BOUNDING BOXES:
- ALWAYS provide boundingBox coordinates for each finding
- Be as precise as possible about WHERE in the image you see the entity
- Coordinates are percentages (0-100) relative to image dimensions

REMEMBER: You are sharing sacred insights, not writing a report. Every word should feel like it comes from someone who genuinely cares about the person receiving this reading. Be thorough AND warm. Be mystical AND approachable.

If you genuinely see nothing supernatural, say so honestly but kindly - perhaps the veil is simply quiet today, or the spirits are resting.`;

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
    logStep("AI response received");
    
    // Handle different response formats
    let content = data.choices?.[0]?.message?.content;
    
    // Some models return content in different structures
    if (!content && data.candidates?.[0]?.content?.parts?.[0]?.text) {
      content = data.candidates[0].content.parts[0].text;
    }
    
    if (!content) {
      logStep("No content in response, using fallback");
      // Return a fallback response instead of throwing
      return new Response(
        JSON.stringify({
          findings: [],
          overallReading: {
            dominantEnergy: "neutral",
            spiritualActivity: "minimal",
            dimensionalThinning: "none",
            primaryMessage: "The spirits are quiet at this moment. The veil remains undisturbed."
          },
          synthesis: "The spiritual realm appears calm. No entities or energies were detected in this image at this time.",
          guidance: {
            immediateAdvice: "Continue to observe and remain open to spiritual experiences.",
            spiritualMeaning: "Sometimes silence from the other side is a blessing.",
            protectionNeeded: false,
            protectionLevel: "none",
            protectionMethods: [],
            ritualRecommendations: [],
            warnings: [],
            blessings: ["You are protected and watched over."]
          },
          overallEnergy: "neutral"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    logStep("Analysis complete");

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to analyze image" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
