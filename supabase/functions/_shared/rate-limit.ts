// Rate limiting utilities for edge functions
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

// Rate limits per action (requests per window)
export const RATE_LIMITS = {
  "analyze-image": { maxCount: 20, windowSeconds: 3600 }, // 20 per hour
  "generate-entity-sketch": { maxCount: 10, windowSeconds: 3600 }, // 10 per hour
  "psychic-chat": { maxCount: 60, windowSeconds: 3600 }, // 60 per hour
  "daily-tarot": { maxCount: 10, windowSeconds: 3600 }, // 10 per hour
  "numerology-reading": { maxCount: 10, windowSeconds: 3600 }, // 10 per hour
  "create-checkout": { maxCount: 5, windowSeconds: 3600 }, // 5 per hour
  "check-subscription": { maxCount: 30, windowSeconds: 3600 }, // 30 per hour
  "spirit-box": { maxCount: 120, windowSeconds: 3600 }, // 120 per hour
  "spirit-box-sessions": { maxCount: 30, windowSeconds: 3600 }, // 30 per hour
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check rate limit for a device/action pair.
 * Uses the database function `rate_limit_allow` for atomic counting.
 */
export async function checkRateLimit(
  deviceId: string,
  action: RateLimitAction,
  supabaseClient?: SupabaseClient
): Promise<RateLimitResult> {
  const client = supabaseClient ?? createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const limits = RATE_LIMITS[action];

  const { data, error } = await client.rpc("rate_limit_allow", {
    _device_id: deviceId,
    _action: action,
    _window_seconds: limits.windowSeconds,
    _max_count: limits.maxCount,
  });

  if (error) {
    console.error("[RATE-LIMIT] Error:", error);
    // Fail open to avoid blocking users on DB errors, but log for monitoring
    return { allowed: true, remaining: 0, resetAt: new Date() };
  }

  const result = data?.[0] ?? { allowed: true, remaining: 0, reset_at: new Date().toISOString() };

  return {
    allowed: result.allowed,
    remaining: result.remaining,
    resetAt: new Date(result.reset_at),
  };
}

/**
 * Create a rate limit error response with proper headers.
 */
export function rateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response {
  return new Response(
    JSON.stringify({
      error: "Rate limit exceeded. Please try again later.",
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": result.resetAt.toISOString(),
      },
    }
  );
}
