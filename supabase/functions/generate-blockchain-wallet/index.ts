import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple wallet generation using Web Crypto API
async function generateWallet() {
  try {
    // Generate a random private key (32 bytes)
    const privateKeyBytes = new Uint8Array(32);
    crypto.getRandomValues(privateKeyBytes);
    
    // Convert to hex string
    const privateKey = Array.from(privateKeyBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    // For demo purposes, create a simple public key/address derivation
    // In production, you'd use proper elliptic curve cryptography
    const publicKeyHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(privateKey)
    );
    
    const publicKeyBytes = new Uint8Array(publicKeyHash);
    const publicKey = Array.from(publicKeyBytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    // Create a simple address from public key (first 40 chars with 0x prefix)
    const address = '0x' + publicKey.substring(0, 40);
    
    return {
      privateKey: '0x' + privateKey,
      publicKey: '0x' + publicKey,
      address: address
    };
  } catch (error) {
    console.error('Error generating wallet:', error);
    throw new Error('Failed to generate wallet');
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log('Generating blockchain wallet for user:', user.id);

    // Check if user already has a blockchain address
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('blockchain_address, blockchain_public_key')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    // If user already has a wallet, return existing info
    if (profile.blockchain_address && profile.blockchain_public_key) {
      return new Response(
        JSON.stringify({
          address: profile.blockchain_address,
          publicKey: profile.blockchain_public_key,
          message: 'Using existing wallet'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Generate new wallet
    const wallet = await generateWallet();

    // Update user profile with blockchain info (don't store private key in DB)
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        blockchain_address: wallet.address,
        blockchain_public_key: wallet.publicKey
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('Failed to save wallet info');
    }

    console.log('Wallet generated successfully for user:', user.id);

    // Return wallet info (including private key for client-side storage)
    return new Response(
      JSON.stringify({
        address: wallet.address,
        publicKey: wallet.publicKey,
        privateKey: wallet.privateKey, // Client should store this securely
        message: 'New wallet generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-blockchain-wallet:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});