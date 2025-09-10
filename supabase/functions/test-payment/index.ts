import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { amount, envelope_data } = await req.json();

    console.log('Test payment initiated:', {
      userId: user.id,
      amount,
      envelopeData: envelope_data
    });

    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Create the envelope directly with 'sent' status to trigger assignment
    let envelopeId = null;
    if (envelope_data) {
      const { data: envelope, error: envelopeError } = await supabaseService
        .from("envelopes")
        .insert({
          user_id: user.id,
          procedure_id: envelope_data.procedureId,
          legal_entity_id: envelope_data.legalEntityId,
          acid_number: envelope_data.acidNumber,
          status: 'sent', // Set to 'sent' to trigger auto-assignment
          total_amount: amount,
          payment_status: 'completed',
          payment_method: 'test_payment',
          files: envelope_data.files || [],
          workflow_status: 'in_progress'
        })
        .select()
        .single();

      if (envelopeError) {
        console.error('Error creating envelope:', envelopeError);
        throw new Error('Failed to create envelope');
      } else {
        envelopeId = envelope.id;
        console.log('Envelope created:', envelopeId);
      }
    }

    // Create a test payment record
    await supabaseService.from("payments").insert({
      envelope_id: envelopeId,
      user_id: user.id,
      amount: amount,
      currency: "USD",
      payment_method: 'test_payment',
      status: "completed",
      stripe_payment_intent_id: `test_${Date.now()}`,
      metadata: {
        test_payment: true,
        envelope_data: envelope_data
      }
    });

    console.log('Test payment completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      envelope_id: envelopeId,
      message: 'Test payment completed successfully'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Test payment error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});