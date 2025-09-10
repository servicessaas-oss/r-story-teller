-- Add blockchain signatures table for document signing
CREATE TABLE public.blockchain_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  envelope_id UUID NOT NULL,
  user_id UUID NOT NULL,
  signature_hash TEXT NOT NULL,
  blockchain_tx_hash TEXT,
  public_key TEXT,
  signature_data JSONB DEFAULT '{}'::jsonb,
  signature_type TEXT NOT NULL DEFAULT 'ethereum',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.blockchain_signatures ENABLE ROW LEVEL SECURITY;

-- Users can create their own signatures
CREATE POLICY "Users can create their own signatures"
ON public.blockchain_signatures
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own signatures
CREATE POLICY "Users can view their own signatures"
ON public.blockchain_signatures
FOR SELECT
USING (auth.uid() = user_id);

-- Legal entities can view signatures for their assigned envelopes
CREATE POLICY "Legal entities can view signatures for assigned envelopes"
ON public.blockchain_signatures
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM envelope_assignments ea
    JOIN profiles p ON p.legal_entity_id = ea.legal_entity_id
    WHERE ea.envelope_id = blockchain_signatures.envelope_id
    AND p.id = auth.uid()
    AND p.role = 'legal_entity'
  )
);

-- Add blockchain wallet addresses to profiles
ALTER TABLE public.profiles 
ADD COLUMN blockchain_address TEXT,
ADD COLUMN blockchain_public_key TEXT;

-- Create index for better performance
CREATE INDEX idx_blockchain_signatures_envelope_id ON blockchain_signatures(envelope_id);
CREATE INDEX idx_blockchain_signatures_user_id ON blockchain_signatures(user_id);
CREATE INDEX idx_profiles_blockchain_address ON profiles(blockchain_address);