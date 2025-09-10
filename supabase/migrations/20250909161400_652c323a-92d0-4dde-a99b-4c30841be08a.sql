-- Fix the profile data for trade@sudan.com user
UPDATE public.profiles 
SET 
  role = 'legal_entity',
  legal_entity_id = 'e8406e0f-1049-4077-a9f4-9793d164f834'
WHERE email = 'trade@sudan.com';