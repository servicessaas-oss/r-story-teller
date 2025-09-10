-- Check if the trigger exists and create it if missing
DROP TRIGGER IF EXISTS auto_assign_envelope_trigger ON public.envelopes;

-- Create the trigger that automatically assigns envelopes to legal entities
CREATE TRIGGER auto_assign_envelope_trigger
  AFTER UPDATE ON public.envelopes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_envelope_to_legal_entities();

-- Also create a trigger for inserts in case envelopes are created directly with 'sent' status
CREATE OR REPLACE TRIGGER auto_assign_envelope_insert_trigger
  AFTER INSERT ON public.envelopes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_envelope_to_legal_entities();