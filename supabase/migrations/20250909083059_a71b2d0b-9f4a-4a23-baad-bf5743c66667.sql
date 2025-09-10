-- Create backend linking system for envelope assignments

-- First, let's ensure the trigger function works properly for auto-assignment
DROP TRIGGER IF EXISTS envelope_assignment_trigger ON envelopes;

-- Update the auto assignment function to handle 'sent' status properly
CREATE OR REPLACE FUNCTION public.auto_assign_envelope_to_legal_entities()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When an envelope changes status to 'sent', create assignments
  IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status != 'sent') THEN
    
    -- Create assignment to the primary legal entity
    INSERT INTO public.envelope_assignments (
      envelope_id, 
      legal_entity_id, 
      assigned_by,
      status,
      assigned_at
    )
    SELECT 
      NEW.id,
      NEW.legal_entity_id::uuid,
      NEW.user_id,
      'pending',
      now()
    WHERE NEW.legal_entity_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM envelope_assignments 
      WHERE envelope_id = NEW.id AND legal_entity_id = NEW.legal_entity_id::uuid
    );

    -- Also create assignments for any workflow stages that involve other legal entities
    INSERT INTO public.envelope_assignments (
      envelope_id, 
      legal_entity_id, 
      assigned_by,
      status,
      assigned_at
    )
    SELECT DISTINCT
      NEW.id,
      (stage->>'legal_entity_id')::uuid,
      NEW.user_id,
      'pending',
      now()
    FROM jsonb_array_elements(COALESCE(NEW.workflow_stages, '[]'::jsonb)) AS stage
    WHERE stage->>'legal_entity_id' IS NOT NULL 
    AND (stage->>'legal_entity_id')::uuid != NEW.legal_entity_id::uuid
    AND NOT EXISTS (
      SELECT 1 FROM envelope_assignments 
      WHERE envelope_id = NEW.id AND legal_entity_id = (stage->>'legal_entity_id')::uuid
    );

  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER envelope_assignment_trigger
  AFTER INSERT OR UPDATE ON public.envelopes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_envelope_to_legal_entities();

-- Add a function to update assignment status when legal entities take action
CREATE OR REPLACE FUNCTION public.update_assignment_on_envelope_action()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- When envelope status changes, update related assignments
  IF NEW.status != OLD.status THEN
    
    -- Update assignment status based on envelope status
    UPDATE public.envelope_assignments
    SET 
      status = CASE
        WHEN NEW.status = 'approved' THEN 'completed'
        WHEN NEW.status = 'rejected' THEN 'rejected'
        WHEN NEW.status = 'amendments_requested' THEN 'in_review'
        ELSE 'pending'
      END,
      processed_at = CASE
        WHEN NEW.status IN ('approved', 'rejected', 'amendments_requested') THEN now()
        ELSE NULL
      END,
      processed_by = CASE
        WHEN NEW.signed_by_legal_entity_id IS NOT NULL THEN 
          (SELECT id FROM profiles WHERE legal_entity_id = NEW.signed_by_legal_entity_id LIMIT 1)
        ELSE NULL
      END
    WHERE envelope_id = NEW.id;

  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for assignment updates
CREATE TRIGGER update_assignment_on_envelope_action_trigger
  AFTER UPDATE ON public.envelopes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assignment_on_envelope_action();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_envelope_assignments_legal_entity_status 
ON envelope_assignments(legal_entity_id, status);

CREATE INDEX IF NOT EXISTS idx_envelope_assignments_envelope_id 
ON envelope_assignments(envelope_id);

CREATE INDEX IF NOT EXISTS idx_envelopes_legal_entity_status 
ON envelopes(legal_entity_id, status);

-- Add function for legal entities to get their workload
CREATE OR REPLACE FUNCTION public.get_legal_entity_workload(entity_id uuid)
RETURNS TABLE(
  total_pending integer,
  total_in_review integer,
  total_completed integer,
  total_overdue integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    COUNT(*) FILTER (WHERE status = 'pending')::integer as total_pending,
    COUNT(*) FILTER (WHERE status = 'in_review')::integer as total_in_review,
    COUNT(*) FILTER (WHERE status = 'completed')::integer as total_completed,
    COUNT(*) FILTER (WHERE assigned_at < now() - interval '24 hours' AND status = 'pending')::integer as total_overdue
  FROM envelope_assignments
  WHERE legal_entity_id = entity_id;
$function$;