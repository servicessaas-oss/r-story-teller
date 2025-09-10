-- Create trigger for automatic timestamp updates on envelopes
CREATE TRIGGER update_envelopes_updated_at
  BEFORE UPDATE ON public.envelopes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policy for legal entities to view assigned envelopes
CREATE POLICY "Legal entities can view assigned envelopes" 
  ON public.envelopes 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'legal_entity'
      AND profiles.legal_entity_id::text = envelopes.legal_entity_id
    )
  );

-- Add RLS policy for legal entities to update assigned envelopes
CREATE POLICY "Legal entities can update assigned envelopes" 
  ON public.envelopes 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'legal_entity'
      AND profiles.legal_entity_id::text = envelopes.legal_entity_id
    )
  );