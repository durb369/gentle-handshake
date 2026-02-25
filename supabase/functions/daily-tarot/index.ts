import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateDeviceId, createErrorResponse } from "../_shared/validation.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DAILY-TAROT] ${step}${detailsStr}`);
};

const majorArcana = [
  { name: "The Fool", number: 0, keywords: ["new beginnings", "innocence", "spontaneity", "free spirit"] },
  { name: "The Magician", number: 1, keywords: ["manifestation", "resourcefulness", "power", "inspired action"] },
  { name: "The High Priestess", number: 2, keywords: ["intuition", "sacred knowledge", "divine feminine", "the subconscious"] },
  { name: "The Empress", number: 3, keywords: ["femininity", "beauty", "nature", "nurturing", "abundance"] },
  { name: "The Emperor", number: 4, keywords: ["authority", "establishment", "structure", "father figure"] },
  { name: "The Hierophant", number: 5, keywords: ["spiritual wisdom", "tradition", "conformity", "morality"] },
  { name: "The Lovers", number: 6, keywords: ["love", "harmony", "relationships", "values alignment", "choices"] },
  { name: "The Chariot", number: 7, keywords: ["control", "willpower", "success", "action", "determination"] },
  { name: "Strength", number: 8, keywords: ["courage", "patience", "compassion", "inner strength"] },
  { name: "The Hermit", number: 9, keywords: ["soul-searching", "introspection", "inner guidance", "solitude"] },
  { name: "Wheel of Fortune", number: 10, keywords: ["change", "cycles", "fate", "decisive moments"] },
  { name: "Justice", number: 11, keywords: ["fairness", "truth", "cause and effect", "law"] },
  { name: "The Hanged Man", number: 12, keywords: ["pause", "surrender", "letting go", "new perspectives"] },
  { name: "Death", number: 13, keywords: ["endings", "change", "transformation", "transition"] },
  { name: "Temperance", number: 14, keywords: ["balance", "moderation", "patience", "purpose"] },
  { name: "The Devil", number: 15, keywords: ["shadow self", "attachment", "addiction", "restriction"] },
  { name: "The Tower", number: 16, keywords: ["sudden change", "upheaval", "chaos", "revelation", "awakening"] },
  { name: "The Star", number: 17, keywords: ["hope", "faith", "purpose", "renewal", "spirituality"] },
  { name: "The Moon", number: 18, keywords: ["illusion", "fear", "anxiety", "subconscious", "intuition"] },
  { name: "The Sun", number: 19, keywords: ["positivity", "fun", "warmth", "success", "vitality"] },
  { name: "Judgement", number: 20, keywords: ["judgement", "rebirth", "inner calling", "absolution"] },
  { name: "The World", number: 21, keywords: ["completion", "integration", "accomplishment", "travel"] },
];

const minorArcana = [
  // Wands (Fire - Action, Creativity, Passion)
  { name: "Ace of Wands", suit: "Wands", number: 1, keywords: ["inspiration", "new opportunities", "growth", "potential"] },
  { name: "Two of Wands", suit: "Wands", number: 2, keywords: ["planning", "decisions", "discovery", "progress"] },
  { name: "Three of Wands", suit: "Wands", number: 3, keywords: ["expansion", "foresight", "overseas opportunities"] },
  { name: "Four of Wands", suit: "Wands", number: 4, keywords: ["celebration", "harmony", "marriage", "home"] },
  { name: "Five of Wands", suit: "Wands", number: 5, keywords: ["conflict", "disagreements", "competition", "tension"] },
  { name: "Six of Wands", suit: "Wands", number: 6, keywords: ["success", "public recognition", "progress", "self-confidence"] },
  { name: "Seven of Wands", suit: "Wands", number: 7, keywords: ["challenge", "competition", "protection", "perseverance"] },
  { name: "Eight of Wands", suit: "Wands", number: 8, keywords: ["movement", "fast-paced change", "action", "alignment"] },
  { name: "Nine of Wands", suit: "Wands", number: 9, keywords: ["resilience", "grit", "last stand", "boundaries"] },
  { name: "Ten of Wands", suit: "Wands", number: 10, keywords: ["burden", "extra responsibility", "hard work", "completion"] },
  { name: "Page of Wands", suit: "Wands", number: 11, keywords: ["exploration", "excitement", "freedom", "discovery"] },
  { name: "Knight of Wands", suit: "Wands", number: 12, keywords: ["energy", "passion", "adventure", "impulsiveness"] },
  { name: "Queen of Wands", suit: "Wands", number: 13, keywords: ["courage", "confidence", "independence", "warmth"] },
  { name: "King of Wands", suit: "Wands", number: 14, keywords: ["leadership", "vision", "entrepreneur", "honour"] },
  
  // Cups (Water - Emotions, Relationships, Feelings)
  { name: "Ace of Cups", suit: "Cups", number: 1, keywords: ["new feelings", "spirituality", "intuition", "love"] },
  { name: "Two of Cups", suit: "Cups", number: 2, keywords: ["unified love", "partnership", "mutual attraction"] },
  { name: "Three of Cups", suit: "Cups", number: 3, keywords: ["celebration", "friendship", "creativity", "community"] },
  { name: "Four of Cups", suit: "Cups", number: 4, keywords: ["meditation", "contemplation", "apathy", "reevaluation"] },
  { name: "Five of Cups", suit: "Cups", number: 5, keywords: ["regret", "failure", "disappointment", "pessimism"] },
  { name: "Six of Cups", suit: "Cups", number: 6, keywords: ["nostalgia", "childhood memories", "innocence", "joy"] },
  { name: "Seven of Cups", suit: "Cups", number: 7, keywords: ["opportunities", "choices", "wishful thinking", "illusion"] },
  { name: "Eight of Cups", suit: "Cups", number: 8, keywords: ["disappointment", "abandonment", "withdrawal", "escapism"] },
  { name: "Nine of Cups", suit: "Cups", number: 9, keywords: ["contentment", "satisfaction", "gratitude", "wish come true"] },
  { name: "Ten of Cups", suit: "Cups", number: 10, keywords: ["divine love", "harmony", "alignment", "family"] },
  { name: "Page of Cups", suit: "Cups", number: 11, keywords: ["creative opportunities", "curiosity", "possibility"] },
  { name: "Knight of Cups", suit: "Cups", number: 12, keywords: ["creativity", "romance", "charm", "imagination"] },
  { name: "Queen of Cups", suit: "Cups", number: 13, keywords: ["compassion", "calm", "comfort", "intuition"] },
  { name: "King of Cups", suit: "Cups", number: 14, keywords: ["emotional balance", "control", "generosity"] },
  
  // Swords (Air - Intellect, Truth, Conflict)
  { name: "Ace of Swords", suit: "Swords", number: 1, keywords: ["breakthrough", "clarity", "sharp mind", "truth"] },
  { name: "Two of Swords", suit: "Swords", number: 2, keywords: ["difficult decisions", "stalemate", "denial"] },
  { name: "Three of Swords", suit: "Swords", number: 3, keywords: ["heartbreak", "emotional pain", "sorrow", "grief"] },
  { name: "Four of Swords", suit: "Swords", number: 4, keywords: ["rest", "relaxation", "meditation", "contemplation"] },
  { name: "Five of Swords", suit: "Swords", number: 5, keywords: ["conflict", "disagreements", "competition", "defeat"] },
  { name: "Six of Swords", suit: "Swords", number: 6, keywords: ["transition", "change", "rite of passage", "releasing baggage"] },
  { name: "Seven of Swords", suit: "Swords", number: 7, keywords: ["deception", "trickery", "tactics", "resourcefulness"] },
  { name: "Eight of Swords", suit: "Swords", number: 8, keywords: ["imprisonment", "entrapment", "self-victimization"] },
  { name: "Nine of Swords", suit: "Swords", number: 9, keywords: ["anxiety", "worry", "fear", "depression", "nightmares"] },
  { name: "Ten of Swords", suit: "Swords", number: 10, keywords: ["painful endings", "deep wounds", "betrayal", "loss"] },
  { name: "Page of Swords", suit: "Swords", number: 11, keywords: ["curiosity", "restlessness", "mental energy"] },
  { name: "Knight of Swords", suit: "Swords", number: 12, keywords: ["action", "impulsiveness", "defending beliefs"] },
  { name: "Queen of Swords", suit: "Swords", number: 13, keywords: ["clear boundaries", "direct communication", "independent"] },
  { name: "King of Swords", suit: "Swords", number: 14, keywords: ["mental clarity", "intellectual power", "authority", "truth"] },
  
  // Pentacles (Earth - Material, Finances, Career)
  { name: "Ace of Pentacles", suit: "Pentacles", number: 1, keywords: ["new financial opportunity", "manifestation", "abundance"] },
  { name: "Two of Pentacles", suit: "Pentacles", number: 2, keywords: ["balance", "adaptability", "time management", "prioritization"] },
  { name: "Three of Pentacles", suit: "Pentacles", number: 3, keywords: ["teamwork", "collaboration", "learning", "implementation"] },
  { name: "Four of Pentacles", suit: "Pentacles", number: 4, keywords: ["saving money", "security", "conservatism", "scarcity"] },
  { name: "Five of Pentacles", suit: "Pentacles", number: 5, keywords: ["financial loss", "poverty", "lack mindset", "isolation"] },
  { name: "Six of Pentacles", suit: "Pentacles", number: 6, keywords: ["giving", "receiving", "sharing wealth", "generosity"] },
  { name: "Seven of Pentacles", suit: "Pentacles", number: 7, keywords: ["long-term view", "sustainable results", "perseverance"] },
  { name: "Eight of Pentacles", suit: "Pentacles", number: 8, keywords: ["apprenticeship", "repetitive tasks", "mastery", "skill"] },
  { name: "Nine of Pentacles", suit: "Pentacles", number: 9, keywords: ["abundance", "luxury", "self-sufficiency", "financial independence"] },
  { name: "Ten of Pentacles", suit: "Pentacles", number: 10, keywords: ["wealth", "family", "long-term success", "contribution"] },
  { name: "Page of Pentacles", suit: "Pentacles", number: 11, keywords: ["manifestation", "financial opportunity", "skill development"] },
  { name: "Knight of Pentacles", suit: "Pentacles", number: 12, keywords: ["hard work", "productivity", "routine", "conservatism"] },
  { name: "Queen of Pentacles", suit: "Pentacles", number: 13, keywords: ["nurturing", "practical", "providing financially", "working mother"] },
  { name: "King of Pentacles", suit: "Pentacles", number: 14, keywords: ["wealth", "business", "leadership", "security", "discipline"] },
];

const allCards = [...majorArcana.map(c => ({ ...c, arcana: "major" })), ...minorArcana.map(c => ({ ...c, arcana: "minor" }))];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { deviceId } = await req.json();

    // Validate device ID
    const deviceValidation = validateDeviceId(deviceId);
    if (!deviceValidation.valid) {
      logStep("Device validation failed", { error: deviceValidation.error });
      return createErrorResponse(deviceValidation.error!, 401, corsHeaders);
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(deviceId, "daily-tarot");
    if (!rateLimit.allowed) {
      logStep("Rate limit exceeded", { deviceId: deviceId.substring(0, 20), remaining: rateLimit.remaining });
      return rateLimitResponse(rateLimit, corsHeaders);
    }

    logStep("Device validated", { deviceId: deviceId.substring(0, 20) + '...', remaining: rateLimit.remaining });

    // Generate a seed based on deviceId and today's date for consistent daily pulls
    const today = new Date().toISOString().split('T')[0];
    const seed = `${deviceId}-${today}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    // Select card based on hash
    const cardIndex = Math.abs(hash) % allCards.length;
    const card = allCards[cardIndex];
    const isReversed = (Math.abs(hash >> 8) % 2) === 1;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are Mystic Elara, a warm and gifted tarot reader. You've just drawn ${card.name}${isReversed ? " (Reversed)" : ""} for someone seeking daily guidance.

The card's core energies: ${card.keywords.join(", ")}
${card.arcana === "major" ? "This is a Major Arcana card, signifying powerful life themes and spiritual lessons." : `This is from the ${(card as { suit?: string }).suit} suit, connected to ${(card as { suit?: string }).suit === "Wands" ? "fire, passion, and action" : (card as { suit?: string }).suit === "Cups" ? "water, emotions, and relationships" : (card as { suit?: string }).suit === "Swords" ? "air, intellect, and truth" : "earth, material matters, and stability"}.`}

Write a personal, warm daily reading (about 150-200 words) that:
1. Greets them warmly and reveals the card with excitement or appropriate emotion
2. Explains what this card means for their day ahead
3. ${isReversed ? "Addresses the reversed meaning - often about blocked energy or internal work needed" : "Focuses on the upright meaning and how to embrace this energy"}
4. Gives practical, actionable advice for the day
5. Ends with an encouraging blessing or affirmation

Speak like a caring friend sharing mystical wisdom, not like reading from a textbook. Use phrases like "Oh, what a beautiful draw for you today!" or "The cards are speaking clearly, dear one..." Make it feel personal and meaningful.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return createErrorResponse("Rate limit exceeded. Please try again in a moment.", 429, corsHeaders);
      }
      if (response.status === 402) {
        return createErrorResponse("AI credits exhausted. Please add credits to continue.", 402, corsHeaders);
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reading = data.choices?.[0]?.message?.content || "The cards are quiet today. Please try again.";

    logStep("Reading generated");

    return new Response(
      JSON.stringify({
        card: {
          name: card.name,
          number: card.number,
          arcana: card.arcana,
          suit: (card as { suit?: string }).suit || null,
          keywords: card.keywords,
          isReversed,
        },
        reading,
        date: today,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to draw card" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
