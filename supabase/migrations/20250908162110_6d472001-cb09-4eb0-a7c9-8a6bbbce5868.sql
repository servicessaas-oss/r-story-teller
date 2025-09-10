-- Remove Sudan-related legal entities
DELETE FROM legal_entities 
WHERE name IN (
  'Ministry of Agriculture',
  'Chamber of Commerce',
  'Sudan Customs Authority', 
  'Central Bank of Sudan',
  'Ministry of Energy And Oil',
  'Ministry of Minerals',
  'Ministry of Industry',
  'Sudan Gold Refinery',
  'Sudan National Petroleum Laboratory',
  'Standards And Metrology Organization',
  'Port Sudan'
) OR name LIKE '%Sudan%' OR name LIKE '%Ministry%';