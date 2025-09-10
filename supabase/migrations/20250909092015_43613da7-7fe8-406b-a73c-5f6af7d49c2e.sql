-- Update the legal entity user profile to have the correct legal_entity_id
-- First, let's find the Sudan Customs Authority legal entity
UPDATE profiles 
SET legal_entity_id = (
  SELECT id FROM legal_entities 
  WHERE name ILIKE '%sudan%' OR name ILIKE '%customs%' 
  LIMIT 1
)
WHERE email = 'customs@sudan.com' AND role = 'legal_entity';