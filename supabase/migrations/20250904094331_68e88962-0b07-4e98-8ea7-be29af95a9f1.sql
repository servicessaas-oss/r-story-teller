-- Create goods table to store import/export goods
CREATE TABLE public.goods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  procedure_type TEXT NOT NULL CHECK (procedure_type IN ('import', 'export')),
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.goods ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to goods
CREATE POLICY "Anyone can view goods" 
ON public.goods 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_goods_updated_at
BEFORE UPDATE ON public.goods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert import goods
INSERT INTO public.goods (name, procedure_type) VALUES
('Drugs, medical apparatus & equipment', 'import'),
('Cosmetics', 'import'),
('Veterinary medicines & vaccines', 'import'),
('Books, printed materials & newspapers', 'import'),
('Recorded tapes', 'import'),
('Insecticides', 'import'),
('Seeds', 'import'),
('Potato seeds', 'import'),
('Transplants', 'import'),
('Space receiver equipment', 'import'),
('Fishing nets', 'import'),
('Color document copiers, faxes & scanners', 'import'),
('Spices & peppers', 'import'),
('Measurement & weighing devices', 'import'),
('Weapons, ammunition, explosives & fireworks', 'import'),
('Radiant materials', 'import'),
('Antique pieces', 'import'),
('Large electric generators', 'import'),
('Used spare parts, instruments, tools & machines', 'import'),
('Foodstuff', 'import'),
('Holy Quran', 'import'),
('Engine oils & gas cylinders', 'import'),
('Live animals', 'import'),
('Vehicles in commercial quantities', 'import'),
('Vehicles for personal use', 'import');

-- Insert export goods
INSERT INTO public.goods (name, procedure_type) VALUES
('Commercial goods', 'export'),
('Fruits and vegetables', 'export'),
('Livestock and live young sheep', 'export'),
('Female camels', 'export'),
('Sesame', 'export'),
('Hibiscus', 'export'),
('Fishes', 'export'),
('Scrap iron', 'export'),
('Gold', 'export');

-- Add workflow stage tracking to envelopes table
ALTER TABLE public.envelopes 
ADD COLUMN current_stage INTEGER DEFAULT 1,
ADD COLUMN workflow_stages JSONB DEFAULT '[]'::jsonb,
ADD COLUMN next_legal_entity_id TEXT,
ADD COLUMN workflow_status TEXT DEFAULT 'in_progress' CHECK (workflow_status IN ('in_progress', 'completed', 'rejected'));

-- Create envelope_goods junction table for many-to-many relationship
CREATE TABLE public.envelope_goods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  envelope_id UUID NOT NULL REFERENCES public.envelopes(id) ON DELETE CASCADE,
  goods_id UUID NOT NULL REFERENCES public.goods(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(envelope_id, goods_id)
);

-- Enable RLS on envelope_goods
ALTER TABLE public.envelope_goods ENABLE ROW LEVEL SECURITY;

-- Create policies for envelope_goods
CREATE POLICY "Users can view their envelope goods" 
ON public.envelope_goods 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.envelopes 
  WHERE envelopes.id = envelope_goods.envelope_id 
  AND envelopes.user_id = auth.uid()
));

CREATE POLICY "Users can insert their envelope goods" 
ON public.envelope_goods 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.envelopes 
  WHERE envelopes.id = envelope_goods.envelope_id 
  AND envelopes.user_id = auth.uid()
));

CREATE POLICY "Users can delete their envelope goods" 
ON public.envelope_goods 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.envelopes 
  WHERE envelopes.id = envelope_goods.envelope_id 
  AND envelopes.user_id = auth.uid()
));