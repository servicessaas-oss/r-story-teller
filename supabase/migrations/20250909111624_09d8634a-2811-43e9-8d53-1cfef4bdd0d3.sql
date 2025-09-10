-- Add foreign key relationship between blockchain_signatures and profiles
ALTER TABLE public.blockchain_signatures 
ADD CONSTRAINT fk_blockchain_signatures_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Check current status constraint and update it to include all valid statuses
ALTER TABLE public.envelopes DROP CONSTRAINT IF EXISTS envelopes_status_check;

-- Add updated status constraint with all valid statuses
ALTER TABLE public.envelopes 
ADD CONSTRAINT envelopes_status_check 
CHECK (status IN ('draft', 'pending_payment', 'sent', 'under_review', 'approved', 'rejected', 'amendments_requested', 'completed', 'signed_and_approved'));

-- Update workflow_status constraint too
ALTER TABLE public.envelopes DROP CONSTRAINT IF EXISTS envelopes_workflow_status_check;

ALTER TABLE public.envelopes 
ADD CONSTRAINT envelopes_workflow_status_check 
CHECK (workflow_status IN ('draft', 'in_progress', 'completed', 'rejected', 'on_hold'));

-- Update payment_status constraint
ALTER TABLE public.envelopes DROP CONSTRAINT IF EXISTS envelopes_payment_status_check;

ALTER TABLE public.envelopes 
ADD CONSTRAINT envelopes_payment_status_check 
CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded'));