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
    // Create Supabase client using the service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse request body
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    // Get envelope and stage information from metadata
    const metadata = session.metadata;
    if (!metadata) {
      throw new Error("Payment metadata not found");
    }

    const envelopeData = JSON.parse(metadata.envelope_data);
    const envelopeId = envelopeData.envelopeId;
    const stageNumber = envelopeData.stageNumber;

    console.log('Processing payment verification:', {
      sessionId: session_id,
      envelopeId,
      stageNumber,
      paymentStatus: session.payment_status
    });

    // Update payment record
    await supabaseService
      .from("payments")
      .update({
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("stripe_payment_intent_id", session_id);

    // Update envelope payment status and workflow
    const { data: envelope, error: fetchError } = await supabaseService
      .from("envelopes")
      .select("workflow_stages, workflow_history")
      .eq("id", envelopeId)
      .single();

    if (fetchError) {
      console.error('Error fetching envelope:', fetchError);
      throw new Error("Failed to fetch envelope");
    }

    // Update workflow stages to mark payment as completed
    let updatedStages = envelope.workflow_stages || [];
    let updatedHistory = envelope.workflow_history || [];

    // Find and update the stage
    updatedStages = updatedStages.map((stage: any) => {
      if (stage.stage_number === stageNumber) {
        return {
          ...stage,
          status: 'payment_completed',
          payment_status: 'completed',
          payment_completed_at: new Date().toISOString()
        };
      }
      return stage;
    });

    // Add to workflow history
    updatedHistory.push({
      stage_number: stageNumber,
      action: 'payment_completed',
      timestamp: new Date().toISOString(),
      details: {
        session_id,
        amount: session.amount_total,
        currency: session.currency
      }
    });

    // Update envelope status to 'sent' to trigger assignment creation
    await supabaseService
      .from("envelopes")
      .update({
        workflow_stages: updatedStages,
        workflow_history: updatedHistory,
        payment_status: 'completed',
        status: 'sent', // This triggers the auto_assign_envelope_to_legal_entities trigger
        updated_at: new Date().toISOString()
      })
      .eq("id", envelopeId);

    return new Response(JSON.stringify({ 
      success: true,
      payment_status: 'completed',
      envelope_id: envelopeId,
      stage_number: stageNumber
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});