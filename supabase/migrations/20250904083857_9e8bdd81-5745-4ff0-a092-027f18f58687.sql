-- Create procedures table
CREATE TABLE public.procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('export', 'import')),
  name TEXT NOT NULL,
  description TEXT,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;

-- Create policy for procedures (read-only for authenticated users)
CREATE POLICY "select_procedures" ON public.procedures
FOR SELECT
TO authenticated
USING (true);

-- Create envelopes table
CREATE TABLE public.envelopes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  procedure_id UUID REFERENCES public.procedures(id),
  legal_entity_id TEXT NOT NULL,
  acid_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_payment', 'payment_completed', 'sent', 'processing', 'completed', 'rejected')),
  total_amount INTEGER DEFAULT 0, -- Amount in cents
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'paypal', 'coins', 'transfer')),
  stripe_payment_intent_id TEXT,
  files JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.envelopes ENABLE ROW LEVEL SECURITY;

-- Create policies for envelopes
CREATE POLICY "select_own_envelopes" ON public.envelopes
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "insert_own_envelopes" ON public.envelopes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_envelopes" ON public.envelopes
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  envelope_id UUID REFERENCES public.envelopes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'USD',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'paypal', 'coins', 'transfer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  paypal_order_id TEXT,
  transaction_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "select_own_payments" ON public.payments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "insert_own_payments" ON public.payments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "update_own_payments" ON public.payments
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Insert default procedures
INSERT INTO public.procedures (type, name, description, required_documents) VALUES
('export', 'Standard Export', 'Standard export procedure for goods', ARRAY['Bill of Lading', 'Packing List', 'Invoice', 'Certificate of Origin', 'Export License']),
('export', 'Food Export', 'Export procedure for food products', ARRAY['Bill of Lading', 'Packing List', 'Invoice', 'Certificate of Origin', 'Health Certificate', 'Food Safety Certificate']),
('export', 'Chemical Export', 'Export procedure for chemical products', ARRAY['Bill of Lading', 'Packing List', 'Invoice', 'Certificate of Origin', 'Safety Data Sheet', 'Chemical Analysis Certificate']),
('import', 'Standard Import', 'Standard import procedure for goods', ARRAY['Bill of Lading', 'Packing List', 'Invoice', 'Certificate of Origin', 'Import License']),
('import', 'Food Import', 'Import procedure for food products', ARRAY['Bill of Lading', 'Packing List', 'Invoice', 'Certificate of Origin', 'Health Certificate', 'Import Permit']),
('import', 'Pharmaceutical Import', 'Import procedure for pharmaceutical products', ARRAY['Bill of Lading', 'Packing List', 'Invoice', 'Certificate of Origin', 'Drug Registration Certificate', 'Import License']);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_envelopes_updated_at
BEFORE UPDATE ON public.envelopes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();