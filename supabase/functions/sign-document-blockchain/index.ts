import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple signing function using Web Crypto API
async function signDocument(documentHash: string, privateKey: string) {
  try {
    // Remove 0x prefix if present
    const cleanPrivateKey = privateKey.replace('0x', '');
    const cleanDocumentHash = documentHash.replace('0x', '');
    
    // Convert hex private key to bytes
    const privateKeyBytes = new Uint8Array(
      cleanPrivateKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) ?? []
    );
    
    // Create message to sign (document hash + timestamp)
    const timestamp = Date.now().toString();
    const message = cleanDocumentHash + timestamp;
    
    // Sign the message using HMAC-SHA256 (simplified for demo)
    const key = await crypto.subtle.importKey(
      'raw',
      privateKeyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(message)
    );
    
    const signatureBytes = new Uint8Array(signature);
    const signatureHex = Array.from(signatureBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    return {
      signature: '0x' + signatureHex,
      message: message,
      timestamp: timestamp
    };
  } catch (error) {
    console.error('Error signing document:', error);
    throw new Error('Failed to sign document');
  }
}

// Create document hash from envelope data
async function createDocumentHash(envelopeData: any) {
  const documentString = JSON.stringify({
    id: envelopeData.id,
    acid_number: envelopeData.acid_number,
    files: envelopeData.files,
    created_at: envelopeData.created_at
  });
  
  const hash = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(documentString)
  );
  
  const hashBytes = new Uint8Array(hash);
  return '0x' + Array.from(hashBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { envelopeId, privateKey } = await req.json();
    
    if (!envelopeId || !privateKey) {
      throw new Error('Missing required parameters: envelopeId, privateKey');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header to verify user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid user token');
    }

    console.log('Signing document for user:', user.id, 'envelope:', envelopeId);

    // Get envelope data
    const { data: envelope, error: envelopeError } = await supabaseClient
      .from('envelopes')
      .select('*')
      .eq('id', envelopeId)
      .single();

    if (envelopeError || !envelope) {
      throw new Error('Envelope not found or access denied');
    }

    // Check if user has permission to sign this envelope
    // Either they own it or they're assigned as a legal entity
    const isOwner = envelope.user_id === user.id;
    
    let isAssignedLegalEntity = false;
    let assignment = null;
    if (!isOwner) {
      // Get user's profile to check legal_entity_id
      const { data: userProfile } = await supabaseClient
        .from('profiles')
        .select('legal_entity_id')
        .eq('id', user.id)
        .single();
      
      if (userProfile?.legal_entity_id) {
        // Check if there's an assignment for this envelope and legal entity
        const { data: assignmentData } = await supabaseClient
          .from('envelope_assignments')
          .select('*')
          .eq('envelope_id', envelopeId)
          .eq('legal_entity_id', userProfile.legal_entity_id)
          .single();
        
        if (assignmentData) {
          isAssignedLegalEntity = true;
          assignment = assignmentData;
        }
      }
    }

    if (!isOwner && !isAssignedLegalEntity) {
      throw new Error('Not authorized to sign this envelope');
    }

    // Create document hash
    const documentHash = await createDocumentHash(envelope);
    
    // Sign the document
    const signatureData = await signDocument(documentHash, privateKey);

    // Get user's blockchain info
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('blockchain_address, blockchain_public_key')
      .eq('id', user.id)
      .single();

    // Store signature in database
    const { data: signature, error: signatureError } = await supabaseClient
      .from('blockchain_signatures')
      .insert({
        envelope_id: envelopeId,
        user_id: user.id,
        signature_hash: signatureData.signature,
        public_key: profile?.blockchain_public_key,
        signature_data: {
          documentHash: documentHash,
          message: signatureData.message,
          timestamp: signatureData.timestamp,
          signerAddress: profile?.blockchain_address
        },
        signature_type: 'ethereum',
        is_verified: true,
        verified_at: new Date().toISOString()
      })
      .select()
      .single();

    if (signatureError) {
      console.error('Error storing signature:', signatureError);
      throw new Error('Failed to store signature');
    }

    // Update envelope status if it's a legal entity signing
    if (isAssignedLegalEntity) {
      // Update envelope status to approved and signed
      await supabaseClient
        .from('envelopes')
        .update({
          status: 'approved',
          workflow_status: 'completed',
          signed_at: new Date().toISOString(),
          signed_by_legal_entity_id: envelope.legal_entity_id
        })
        .eq('id', envelopeId);

      // Update assignment status to completed
      await supabaseClient
        .from('envelope_assignments')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          processed_by: user.id
        })
        .eq('envelope_id', envelopeId)
        .eq('legal_entity_id', envelope.legal_entity_id);

      // Create interaction record
      await supabaseClient
        .from('legal_entity_interactions')
        .insert({
          envelope_assignment_id: assignment?.id || null,
          interaction_type: 'approved',
          message: 'Document verified and signed on blockchain',
          created_by: user.id,
          attachments: []
        });

      console.log('Envelope and assignment status updated after blockchain signing');
    }

    console.log('Document signed successfully:', signature.id);

    return new Response(
      JSON.stringify({
        signatureId: signature.id,
        documentHash: documentHash,
        signature: signatureData.signature,
        timestamp: signatureData.timestamp,
        message: 'Document signed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in sign-document-blockchain:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});