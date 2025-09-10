-- Remove all non-Sudan entities and add back Sudan-related entities
DELETE FROM legal_entities;

-- Insert Sudan-related legal entities
INSERT INTO legal_entities (id, name, entity_type, contact_info, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Sudan Customs Authority', 'customs', '{"address": "Khartoum, Sudan", "phone": "+249-183-774500", "email": "info@customs.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Ministry of Trade & Industry', 'government', '{"address": "Khartoum, Sudan", "phone": "+249-183-771234", "email": "info@mti.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Chamber of Commerce', 'chamber', '{"address": "Khartoum, Sudan", "phone": "+249-183-780123", "email": "info@chamber.sd"}', now(), now()),
  (gen_random_uuid(), 'Ministry of Agriculture', 'government', '{"address": "Khartoum, Sudan", "phone": "+249-183-775678", "email": "info@moa.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Ministry of Animal Resources & Fisheries', 'government', '{"address": "Khartoum, Sudan", "phone": "+249-183-776789", "email": "info@marf.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Ministry of Minerals', 'government', '{"address": "Khartoum, Sudan", "phone": "+249-183-777890", "email": "info@minerals.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Sudan Gold Refinery', 'laboratory', '{"address": "Khartoum, Sudan", "phone": "+249-183-778901", "email": "info@goldrefinery.sd"}', now(), now()),
  (gen_random_uuid(), 'Central Bank of Sudan', 'banking', '{"address": "Khartoum, Sudan", "phone": "+249-183-779012", "email": "info@cbos.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Ministry of Energy And Oil', 'government', '{"address": "Khartoum, Sudan", "phone": "+249-183-780123", "email": "info@energy.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Sudan National Petroleum Laboratory', 'laboratory', '{"address": "Khartoum, Sudan", "phone": "+249-183-781234", "email": "info@petrolab.sd"}', now(), now()),
  (gen_random_uuid(), 'Standards And Metrology Organization', 'quality', '{"address": "Khartoum, Sudan", "phone": "+249-183-782345", "email": "info@ssmo.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Ministry of Health', 'government', '{"address": "Khartoum, Sudan", "phone": "+249-183-783456", "email": "info@moh.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Ministry of Industry', 'government', '{"address": "Khartoum, Sudan", "phone": "+249-183-784567", "email": "info@industry.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Ministry of Interior / Defense', 'government', '{"address": "Khartoum, Sudan", "phone": "+249-183-785678", "email": "info@interior.gov.sd"}', now(), now()),
  (gen_random_uuid(), 'Port Sudan', 'logistics', '{"address": "Port Sudan, Sudan", "phone": "+249-311-822345", "email": "info@portsudan.sd"}', now(), now());