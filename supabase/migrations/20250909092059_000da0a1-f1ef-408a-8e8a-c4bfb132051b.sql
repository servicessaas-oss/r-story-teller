-- Create sample envelopes with existing user data
WITH existing_users AS (
  SELECT id FROM profiles WHERE role = 'user' LIMIT 1
)
INSERT INTO envelopes (
  id,
  user_id,
  acid_number,
  status,
  payment_status,
  legal_entity_id,
  files,
  total_amount,
  created_at
)
SELECT 
  gen_random_uuid(),
  COALESCE(
    (SELECT id FROM existing_users), 
    (SELECT id FROM profiles ORDER BY created_at LIMIT 1)
  ),
  'AC' || LPAD((ROW_NUMBER() OVER() + 12340)::text, 5, '0'),
  'sent',
  'paid',
  '0091e7e1-1c0d-4bf0-a885-eae3e4278f20', -- Sudan Customs Authority ID
  '[{"name": "Commercial Invoice.pdf", "type": "commercial_invoice", "size": 245760}, {"name": "Bill of Lading.pdf", "type": "bill_of_lading", "size": 189440}]'::jsonb,
  15000 + (RANDOM() * 50000)::integer,
  NOW() - (RANDOM() * INTERVAL '5 days')
FROM generate_series(1, 3)
WHERE EXISTS (SELECT 1 FROM profiles);

-- Create envelope assignments for the legal entity
INSERT INTO envelope_assignments (
  envelope_id,
  legal_entity_id, 
  assigned_by,
  status,
  assigned_at
)
SELECT 
  e.id,
  '0091e7e1-1c0d-4bf0-a885-eae3e4278f20'::uuid,
  e.user_id,
  'pending',
  e.created_at
FROM envelopes e 
WHERE e.legal_entity_id = '0091e7e1-1c0d-4bf0-a885-eae3e4278f20'
AND NOT EXISTS (
  SELECT 1 FROM envelope_assignments ea 
  WHERE ea.envelope_id = e.id AND ea.legal_entity_id = '0091e7e1-1c0d-4bf0-a885-eae3e4278f20'::uuid
);