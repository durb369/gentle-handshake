import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { validateDeviceId, createErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

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
    
    logStep("Checking subscription for device", { deviceId: deviceId.substring(0, 20) + '...' });

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // First check our local database
    const { data: localSub } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("device_id", deviceId)
      .single();

    if (localSub?.is_active && localSub?.subscription_end) {
      const endDate = new Date(localSub.subscription_end);
      if (endDate > new Date()) {
        logStep("Found active local subscription", { endDate: localSub.subscription_end });
        return new Response(JSON.stringify({
          subscribed: true,
          subscription_end: localSub.subscription_end,
          product_id: localSub.product_id,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Check Stripe for subscription by device_id in metadata
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    // Search for subscriptions with this device_id in metadata
    const subscriptions = await stripe.subscriptions.search({
      query: `status:'active' AND metadata['device_id']:'${deviceId}'`,
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      const productId = subscription.items.data[0]?.price?.product as string;
      
      logStep("Found active Stripe subscription", { subscriptionId: subscription.id, endDate: subscriptionEnd });

      // Update local database using service role
      await supabaseClient
        .from("user_subscriptions")
        .upsert({
          device_id: deviceId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          product_id: productId,
          is_active: true,
          subscription_end: subscriptionEnd,
        }, { onConflict: "device_id" });

      return new Response(JSON.stringify({
        subscribed: true,
        subscription_end: subscriptionEnd,
        product_id: productId,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("No active subscription found");
    
    // Update local database to reflect no subscription using service role
    if (localSub) {
      await supabaseClient
        .from("user_subscriptions")
        .update({ is_active: false })
        .eq("device_id", deviceId);
    }

    return new Response(JSON.stringify({ subscribed: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage, subscribed: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 with subscribed: false on error to avoid blocking
    });
  }
});
