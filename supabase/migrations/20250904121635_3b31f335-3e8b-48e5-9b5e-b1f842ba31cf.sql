-- Insert procedures from procedureData
INSERT INTO public.procedures (name, type, description, required_documents) VALUES
('Sesame Exports', 'export', 'Export of sesame seeds from Sudan to processors in Turkey', ARRAY['Phyto Certificate', 'SPS Certificate', 'Certificate of Origin', 'Export Declaration']),
('Gold Exportation', 'export', 'Export of gold from Sudan to UAE refineries', ARRAY['Export License', 'Assay Report', 'FX Validation', 'Export Declaration']),
('Oil Exportation', 'export', 'Export of oil from Sudan to UAE refineries', ARRAY['Export License', 'Quality Testing Report', 'Export Declaration']),
('Wheat Importation', 'import', 'Import of wheat from Russia to Sudan flour mills', ARRAY['Letter of Credit', 'FX Allocation', 'SPS Verification', 'Customs Declaration']),
('Steel Importation', 'import', 'Import of steel from China to Sudan industrial groups', ARRAY['FX Allocation', 'Letter of Credit', 'Quality Check Certificate', 'Compliance Validation', 'Customs Filing']);

-- Insert goods/documents for each procedure type
INSERT INTO public.goods (name, procedure_type, category, description) VALUES
-- Export documents
('Phyto Certificate', 'export', 'Ministry Documents', 'Phytosanitary certificate from Ministry of Agriculture'),
('SPS Certificate', 'export', 'Ministry Documents', 'Sanitary and Phytosanitary certificate'),
('Certificate of Origin', 'export', 'Chamber Documents', 'Certificate of Origin from Chamber of Commerce'),
('Export Declaration', 'export', 'Customs Documents', 'Export declaration for customs clearance'),
('Export License', 'export', 'Ministry Documents', 'Export license from relevant ministry'),
('Assay Report', 'export', 'Laboratory Documents', 'Purity and quality assay report'),
('FX Validation', 'export', 'Banking Documents', 'Foreign exchange validation from Central Bank'),
('Quality Testing Report', 'export', 'Laboratory Documents', 'Quality testing report from certified lab'),

-- Import documents  
('Letter of Credit', 'import', 'Banking Documents', 'Letter of Credit from Central Bank'),
('FX Allocation', 'import', 'Banking Documents', 'Foreign exchange allocation approval'),
('SPS Verification', 'import', 'Ministry Documents', 'SPS verification from Ministry of Agriculture'),
('Customs Declaration', 'import', 'Customs Documents', 'Import declaration for customs'),
('Quality Check Certificate', 'import', 'Quality Documents', 'Quality check certificate from SSMO'),
('Compliance Validation', 'import', 'Ministry Documents', 'Compliance validation from Ministry of Industry'),
('Customs Filing', 'import', 'Customs Documents', 'Customs filing through clearing agent');

-- Create legal entities table for workflow management
CREATE TABLE IF NOT EXISTS public.legal_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  contact_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on legal entities
ALTER TABLE public.legal_entities ENABLE ROW LEVEL SECURITY;

-- Create policy for legal entities (readable by all authenticated users)
CREATE POLICY "select_legal_entities" ON public.legal_entities
  FOR SELECT USING (true);

-- Insert legal entities from the workflow diagrams
INSERT INTO public.legal_entities (name, entity_type) VALUES
('Ministry of Agriculture', 'government'),
('Chamber of Commerce', 'chamber'),
('Sudan Customs Authority', 'customs'),
('Central Bank of Sudan', 'banking'),
('Ministry of Energy And Oil', 'government'),
('Ministry of Minerals', 'government'),
('Ministry of Industry', 'government'),
('Sudan Gold Refinery', 'laboratory'),
('Sudan National Petroleum Laboratory', 'laboratory'),
('Standards And Metrology Organization', 'quality'),
('Port Sudan', 'logistics');

-- Update envelopes table to better support legal entity workflow
ALTER TABLE public.envelopes 
  ADD COLUMN IF NOT EXISTS assigned_legal_entity_id UUID,
  ADD COLUMN IF NOT EXISTS workflow_history JSONB DEFAULT '[]';

-- Create trigger for updated_at on legal_entities
CREATE TRIGGER update_legal_entities_updated_at
  BEFORE UPDATE ON public.legal_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();