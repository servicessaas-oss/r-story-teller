-- Créer une table pour les assignations d'enveloppes aux entités légales
CREATE TABLE public.envelope_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  envelope_id UUID NOT NULL REFERENCES public.envelopes(id) ON DELETE CASCADE,
  legal_entity_id UUID NOT NULL REFERENCES public.legal_entities(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_by UUID REFERENCES auth.users(id),
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Éviter les doublons
  UNIQUE(envelope_id, legal_entity_id)
);

-- Enable Row Level Security
ALTER TABLE public.envelope_assignments ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient les assignations de leurs enveloppes
CREATE POLICY "Users can view their envelope assignments" 
ON public.envelope_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.envelopes 
    WHERE envelopes.id = envelope_assignments.envelope_id 
    AND envelopes.user_id = auth.uid()
  )
);

-- Politique pour que les entités légales voient leurs assignations
CREATE POLICY "Legal entities can view their assignments" 
ON public.envelope_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'legal_entity'
    AND profiles.legal_entity_id = envelope_assignments.legal_entity_id
  )
);

-- Politique pour créer des assignations
CREATE POLICY "Users can create envelope assignments" 
ON public.envelope_assignments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.envelopes 
    WHERE envelopes.id = envelope_assignments.envelope_id 
    AND envelopes.user_id = auth.uid()
  )
);

-- Politique pour que les entités légales puissent mettre à jour le statut
CREATE POLICY "Legal entities can update their assignments" 
ON public.envelope_assignments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'legal_entity'
    AND profiles.legal_entity_id = envelope_assignments.legal_entity_id
  )
);

-- Créer une table pour les interactions entre entités légales et enveloppes
CREATE TABLE public.legal_entity_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  envelope_assignment_id UUID NOT NULL REFERENCES public.envelope_assignments(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'received', 'reviewed', 'approved', 'rejected', 'requested_info'
  message TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.legal_entity_interactions ENABLE ROW LEVEL SECURITY;

-- Politique pour voir les interactions
CREATE POLICY "Users and legal entities can view relevant interactions" 
ON public.legal_entity_interactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.envelope_assignments ea
    JOIN public.envelopes e ON ea.envelope_id = e.id
    WHERE ea.id = envelope_assignment_id 
    AND (
      e.user_id = auth.uid() OR -- L'utilisateur propriétaire de l'enveloppe
      EXISTS (
        SELECT 1 FROM public.profiles p 
        WHERE p.id = auth.uid() 
        AND p.role = 'legal_entity'
        AND p.legal_entity_id = ea.legal_entity_id
      )
    )
  )
);

-- Politique pour créer des interactions
CREATE POLICY "Legal entities can create interactions" 
ON public.legal_entity_interactions 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.envelope_assignments ea
    JOIN public.profiles p ON p.legal_entity_id = ea.legal_entity_id
    WHERE ea.id = envelope_assignment_id 
    AND p.id = auth.uid()
    AND p.role = 'legal_entity'
  )
);

-- Créer des triggers pour mettre à jour les timestamps
CREATE TRIGGER update_envelope_assignments_updated_at
  BEFORE UPDATE ON public.envelope_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ajouter des index pour les performances
CREATE INDEX idx_envelope_assignments_envelope_id ON public.envelope_assignments(envelope_id);
CREATE INDEX idx_envelope_assignments_legal_entity_id ON public.envelope_assignments(legal_entity_id);
CREATE INDEX idx_envelope_assignments_status ON public.envelope_assignments(status);
CREATE INDEX idx_legal_entity_interactions_assignment_id ON public.legal_entity_interactions(envelope_assignment_id);
CREATE INDEX idx_legal_entity_interactions_type ON public.legal_entity_interactions(interaction_type);

-- Fonction pour assigner automatiquement une enveloppe aux entités légales
CREATE OR REPLACE FUNCTION public.auto_assign_envelope_to_legal_entities()
RETURNS TRIGGER AS $$
BEGIN
  -- Quand une enveloppe change de statut à 'sent', créer les assignations
  IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
    -- Insérer les assignations basées sur les documents requis
    INSERT INTO public.envelope_assignments (envelope_id, legal_entity_id, assigned_by)
    SELECT DISTINCT 
      NEW.id,
      le.id,
      NEW.user_id
    FROM public.legal_entities le
    WHERE le.id::text = NEW.legal_entity_id 
    OR EXISTS (
      SELECT 1 FROM jsonb_array_elements(NEW.workflow_stages) AS stage
      WHERE stage->>'legal_entity_id' = le.id::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer le trigger
CREATE TRIGGER trigger_auto_assign_envelope
  AFTER UPDATE ON public.envelopes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_envelope_to_legal_entities();