-- Insert test user profiles for chat testing
-- Note: These are mock profiles with generated UUIDs for testing purposes

INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'alice.exporter@tradeco.com', 'Alice Johnson', 'user', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'bob.importer@globallogistics.com', 'Bob Smith', 'user', now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'carol.freight@shippingsolutions.com', 'Carol Williams', 'user', now(), now()),
  ('44444444-4444-4444-4444-444444444444', 'david.customs@clearanceexperts.com', 'David Brown', 'user', now(), now()),
  ('55555555-5555-5555-5555-555555555555', 'emma.logistics@cargomasters.com', 'Emma Davis', 'user', now(), now()),
  ('66666666-6666-6666-6666-666666666666', 'frank.trader@importexportpro.com', 'Frank Miller', 'user', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create some sample conversations between test users for demonstration
INSERT INTO public.conversations (id, participant_1_id, participant_2_id, created_at, updated_at, last_message_at) VALUES 
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', now() - interval '2 days', now() - interval '1 hour', now() - interval '1 hour'),
  ('bbbb2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', now() - interval '1 day', now() - interval '30 minutes', now() - interval '30 minutes'),
  ('cccc3333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', now() - interval '3 hours', now() - interval '15 minutes', now() - interval '15 minutes')
ON CONFLICT (id) DO NOTHING;

-- Add some sample messages to make the conversations look realistic
INSERT INTO public.messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES 
  -- Conversation between Alice and Bob
  ('msg11111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Hi Bob! I have a shipment of textiles ready for export to Sudan. Can you help with the import procedures?', 'text', now() - interval '2 hours'),
  ('msg22222-2222-2222-2222-222222222222', 'aaaa1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Absolutely! I handle textile imports regularly. What''s the commodity code and estimated value?', 'text', now() - interval '90 minutes'),
  ('msg33333-3333-3333-3333-333333333333', 'aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'It''s HS code 6205.20.00, cotton men''s shirts. Total value is around $45,000 USD.', 'text', now() - interval '1 hour'),
  
  -- Conversation between Alice and Carol
  ('msg44444-4444-4444-4444-444444444444', 'bbbb2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Carol, I need freight forwarding services for a container to Port Sudan. When is your next available booking?', 'text', now() - interval '45 minutes'),
  ('msg55555-5555-5555-5555-555555555555', 'bbbb2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Hi Alice! We have a vessel departing next Tuesday. I can reserve 20ft container space for you. What''s the cargo type?', 'text', now() - interval '30 minutes'),
  
  -- Conversation between Bob and David
  ('msg66666-6666-6666-6666-666666666666', 'cccc3333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'David, I need customs clearance support for an electronics shipment. The documents are ready for review.', 'text', now() - interval '20 minutes'),
  ('msg77777-7777-7777-7777-777777777777', 'cccc3333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Perfect timing! I can handle that for you. Please send over the commercial invoice and packing list.', 'text', now() - interval '15 minutes');

-- Update conversation timestamps to match the latest messages
UPDATE public.conversations 
SET last_message_at = (
  SELECT MAX(created_at) 
  FROM public.messages 
  WHERE messages.conversation_id = conversations.id
);