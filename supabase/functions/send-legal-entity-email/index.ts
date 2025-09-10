import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface EmailRequest {
  recipient_legal_entity_id: string;
  cc_legal_entities: string[];
  subject: string;
  content: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    type: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const emailData: EmailRequest = await req.json();

    // Create Supabase service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user profile for sender name
    const { data: profile } = await supabaseService
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Get legal entity details for recipient
    const { data: legalEntity } = await supabaseService
      .from("legal_entities")
      .select("name, contact_info")
      .eq("id", emailData.recipient_legal_entity_id)
      .single();

    // Get CC legal entities details
    let ccEntities = [];
    if (emailData.cc_legal_entities && emailData.cc_legal_entities.length > 0) {
      const { data: ccData } = await supabaseService
        .from("legal_entities")
        .select("name, contact_info")
        .in("id", emailData.cc_legal_entities);
      ccEntities = ccData || [];
    }

    // Prepare email recipients
    const recipientEmail = legalEntity?.contact_info?.email || `${emailData.recipient_legal_entity_id}@primesay.com`;
    const ccEmails = ccEntities
      .map(entity => entity.contact_info?.email || `${entity.name?.toLowerCase().replace(/\s+/g, '-')}@primesay.com`)
      .filter(Boolean);

    // Prepare attachments for Resend
    const resendAttachments = emailData.attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
    })) || [];

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "PrimesayCargo <no-reply@primesay.com>",
      to: [recipientEmail],
      cc: ccEmails,
      subject: emailData.subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 20px; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">PrimesayCargo Communication</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">From: ${profile?.full_name || user.email}</p>
          </div>
          
          <div style="padding: 30px; background: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                ${emailData.subject}
              </h2>
              <div style="line-height: 1.6; color: #374151;">
                ${emailData.content.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            ${emailData.attachments && emailData.attachments.length > 0 ? `
              <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 6px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  <strong>Attachments:</strong> ${emailData.attachments.map(att => att.filename).join(', ')}
                </p>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            <p>This email was sent through PrimesayCargo platform</p>
          </div>
        </div>
      `,
      attachments: resendAttachments.length > 0 ? resendAttachments : undefined,
    });

    console.log("Email sent successfully:", emailResponse);

    // Save email record to database
    await supabaseService.from("legal_entity_emails").insert({
      sender_id: user.id,
      recipient_legal_entity_id: emailData.recipient_legal_entity_id,
      cc_legal_entities: emailData.cc_legal_entities,
      subject: emailData.subject,
      content: emailData.content,
      attachments: emailData.attachments || [],
      status: "sent"
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        email_id: emailResponse.data?.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});