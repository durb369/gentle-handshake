import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[NUMEROLOGY-READING] ${step}${detailsStr}`);
};

// Calculate single digit (or master number 11, 22, 33)
function reduceToDigit(num: number): number {
  while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
    num = String(num).split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return num;
}

// Calculate Life Path Number from birthdate
function calculateLifePath(birthdate: string): number {
  const [year, month, day] = birthdate.split('-').map(Number);
  const monthReduced = reduceToDigit(month);
  const dayReduced = reduceToDigit(day);
  const yearReduced = reduceToDigit(year);
  return reduceToDigit(monthReduced + dayReduced + yearReduced);
}

// Calculate Expression Number from name
function calculateExpression(name: string): number {
  const values: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  const sum = name.toLowerCase().split('').reduce((acc, char) => {
    return acc + (values[char] || 0);
  }, 0);
  return reduceToDigit(sum);
}

// Calculate Soul Urge Number (vowels only)
function calculateSoulUrge(name: string): number {
  const vowels = 'aeiou';
  const values: Record<string, number> = {
    a: 1, e: 5, i: 9, o: 6, u: 3,
  };
  const sum = name.toLowerCase().split('').reduce((acc, char) => {
    if (vowels.includes(char)) {
      return acc + (values[char] || 0);
    }
    return acc;
  }, 0);
  return reduceToDigit(sum);
}

// Calculate Personality Number (consonants only)
function calculatePersonality(name: string): number {
  const vowels = 'aeiou';
  const values: Record<string, number> = {
    b: 2, c: 3, d: 4, f: 6, g: 7, h: 8, j: 1, k: 2, l: 3,
    m: 4, n: 5, p: 7, q: 8, r: 9, s: 1, t: 2, v: 4, w: 5, x: 6, y: 7, z: 8,
  };
  const sum = name.toLowerCase().split('').reduce((acc, char) => {
    if (!vowels.includes(char) && values[char]) {
      return acc + values[char];
    }
    return acc;
  }, 0);
  return reduceToDigit(sum);
}

// Calculate Birthday Number
function calculateBirthday(birthdate: string): number {
  const day = parseInt(birthdate.split('-')[2]);
  return reduceToDigit(day);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { name, birthdate, deviceId } = await req.json();

    if (!deviceId || !name || !birthdate) {
      throw new Error("Device ID, name, and birthdate are required");
    }

    logStep("Calculating numerology", { name, birthdate });

    const numbers = {
      lifePath: calculateLifePath(birthdate),
      expression: calculateExpression(name),
      soulUrge: calculateSoulUrge(name),
      personality: calculatePersonality(name),
      birthday: calculateBirthday(birthdate),
    };

    logStep("Core numbers calculated", numbers);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are a master numerologist with deep knowledge of Pythagorean numerology. Provide a comprehensive, mystical reading for someone with these core numbers:

NAME: ${name}
BIRTHDATE: ${birthdate}

CORE NUMBERS:
- Life Path Number: ${numbers.lifePath} (The primary purpose and lessons of their life journey)
- Expression Number: ${numbers.expression} (Natural talents and abilities they're meant to express)
- Soul Urge Number: ${numbers.soulUrge} (Their innermost desires and motivations)
- Personality Number: ${numbers.personality} (How others perceive them)
- Birthday Number: ${numbers.birthday} (Special gifts and talents)

Provide a rich, detailed reading that includes:
1. **Life Path Analysis**: Deep dive into their life purpose and spiritual journey
2. **Expression Insights**: Their natural gifts and how to harness them
3. **Soul's Desire**: What truly drives them at the deepest level
4. **Outer Persona**: How they present to the world
5. **Birthday Gift**: Special abilities from their birth day
6. **Number Harmonies**: How these numbers interact and create their unique spiritual fingerprint
7. **Challenges & Growth**: Areas for spiritual development
8. **Cosmic Timing**: Current year influences (calculate personal year number)

Use mystical, poetic language. Reference ancient wisdom. Make it feel like a profound spiritual revelation.
Format with markdown for structure and emphasis.
End with a powerful affirmation aligned to their numbers.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      logStep("AI gateway error", { status: response.status, error: errorText });
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const reading = data.choices?.[0]?.message?.content;

    if (!reading) {
      throw new Error("No reading generated");
    }

    logStep("Reading generated successfully");

    return new Response(JSON.stringify({
      numbers,
      reading,
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
