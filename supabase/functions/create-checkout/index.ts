import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { validateDeviceId, validateEmail, createErrorResponse } from "../_shared/validation.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_PRICE_ID = "price_1Sw30mPBmofuj4yB0BnawNLh"; // Boosted tier
const PREMIUM_PRICE_ID = "price_1SybjyPBmofuj4yBljJi2g3j"; // Premium tier

const VALID_PRICE_IDS = [DEFAULT_PRICE_ID, PREMIUM_PRICE_ID];

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { deviceId, email, priceId } = await req.json();
    
    // Validate device ID
    const deviceValidation = validateDeviceId(deviceId);
    if (!deviceValidation.valid) {
      logStep("Device validation failed", { error: deviceValidation.error });
      return createErrorResponse(deviceValidation.error!, 401, corsHeaders);
    }

    // Check rate limit (stricter for payment-related endpoints)
    const rateLimit = await checkRateLimit(deviceId, "create-checkout");
    if (!rateLimit.allowed) {
      logStep("Rate limit exceeded", { deviceId: deviceId.substring(0, 20), remaining: rateLimit.remaining });
      return rateLimitResponse(rateLimit, corsHeaders);
    }

    // Validate email if provided
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      logStep("Email validation failed", { error: emailValidation.error });
      return createErrorResponse(emailValidation.error!, 400, corsHeaders);
    }

    // Validate and select price ID
    const selectedPriceId = priceId && VALID_PRICE_IDS.includes(priceId) ? priceId : DEFAULT_PRICE_ID;
    
    logStep("Validation passed", { deviceId: deviceId.substring(0, 20) + '...', hasEmail: !!email, priceId: selectedPriceId, remaining: rateLimit.remaining });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Check if customer exists with this email
    let customerId: string | undefined;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        logStep("Found existing customer", { customerId });
      }
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/?checkout=success&device_id=${deviceId}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      metadata: {
        device_id: deviceId,
      },
      subscription_data: {
        metadata: {
          device_id: deviceId,
        },
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
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
