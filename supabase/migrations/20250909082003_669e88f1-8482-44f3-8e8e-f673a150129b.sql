-- Create user accounts for legal entities
-- First update the existing legal entity profile to link to Sudan Customs Authority
UPDATE profiles 
SET legal_entity_id = '0091e7e1-1c0d-4bf0-a885-eae3e4278f20'
WHERE email = 'customs@sudan.com' AND role = 'legal_entity';

-- Insert additional legal entity user profiles
INSERT INTO profiles (id, email, full_name, role, legal_entity_id, created_at, updated_at) VALUES
-- Ministry of Trade & Industry
(gen_random_uuid(), 'trade@sudan.com', 'Ministry of Trade & Industry', 'legal_entity', 'e8406e0f-1049-4077-a9f4-9793d164f834', now(), now()),
-- Ministry of Agriculture
(gen_random_uuid(), 'agriculture@sudan.com', 'Ministry of Agriculture', 'legal_entity', 'f7675be3-c463-427b-9cf0-bb0ff41fdc34', now(), now()),
-- Central Bank of Sudan
(gen_random_uuid(), 'bank@sudan.com', 'Central Bank of Sudan', 'legal_entity', 'e6dc78fc-3df6-4860-ad43-94a1fe7b47c5', now(), now()),
-- Chamber of Commerce
(gen_random_uuid(), 'chamber@sudan.com', 'Chamber of Commerce', 'legal_entity', 'fb12cb60-9f2a-47fc-90fa-f07841331962', now(), now()),
-- Ministry of Health
(gen_random_uuid(), 'health@sudan.com', 'Ministry of Health', 'legal_entity', '486b0256-acb3-4a9d-afb4-e84fc92def4c', now(), now()),
-- Port Sudan
(gen_random_uuid(), 'port@sudan.com', 'Port Sudan', 'legal_entity', 'ec83fc5f-cce4-4ec5-8e08-c50b7e1a01b9', now(), now());