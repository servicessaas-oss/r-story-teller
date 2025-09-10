import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client using the anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // Parse request body
    const { amount, payment_method, envelope_data } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "Envelope Processing Fee",
              description: `ACID: ${envelope_data?.acidNumber || 'N/A'}`
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-canceled`,
      metadata: {
        user_id: user.id,
        envelope_data: JSON.stringify(envelope_data),
        payment_method
      }
    });

    // Create payment record in Supabase
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // First create the envelope if envelope_data is provided
    let envelopeId = null;
    if (envelope_data) {
      const { data: envelope, error: envelopeError } = await supabaseService
        .from("envelopes")
        .insert({
          user_id: user.id,
          procedure_id: envelope_data.procedureId,
          legal_entity_id: envelope_data.legalEntityId,
          acid_number: envelope_data.acidNumber,
          status: 'pending_payment',
          total_amount: amount,
          payment_status: 'pending',
          payment_method: payment_method,
          files: envelope_data.files || []
        })
        .select()
        .single();

      if (envelopeError) {
        console.error('Error creating envelope:', envelopeError);
      } else {
        envelopeId = envelope.id;
      }
    }

    // Create payment record
    await supabaseService.from("payments").insert({
      envelope_id: envelopeId,
      user_id: user.id,
      amount: amount,
      currency: "USD",
      payment_method: payment_method,
      status: "pending",
      stripe_payment_intent_id: session.id,
      metadata: {
        session_id: session.id,
        envelope_data: envelope_data
      }
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});