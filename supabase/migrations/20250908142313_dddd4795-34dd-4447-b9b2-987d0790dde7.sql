-- Insert legal entities for cargo/customs system
INSERT INTO public.legal_entities (name, entity_type, contact_info) VALUES
('French Customs Authority', 'customs', '{"email": "customs@douane.gouv.fr", "phone": "+33 1 57 53 28 28", "address": "11 rue des Deux Communes, 93558 Montreuil Cedex", "website": "https://www.douane.gouv.fr"}'),
('US Customs and Border Protection', 'customs', '{"email": "info@cbp.dhs.gov", "phone": "+1-877-227-5511", "address": "1300 Pennsylvania Avenue NW, Washington, DC 20229", "website": "https://www.cbp.gov"}'),
('UK HM Revenue & Customs', 'customs', '{"email": "hmrc@gov.uk", "phone": "+44 300 200 3700", "address": "100 Parliament Street, London SW1A 2BQ", "website": "https://www.gov.uk/hmrc"}'),
('German Federal Customs Service', 'customs', '{"email": "info@zoll.de", "phone": "+49 351 44834-510", "address": "An der Alster 62, 20099 Hamburg", "website": "https://www.zoll.de"}'),
('Port Authority of Rotterdam', 'port_authority', '{"email": "info@portofrotterdam.com", "phone": "+31 10 252 1010", "address": "Wilhelminakade 909, 3072 AP Rotterdam", "website": "https://www.portofrotterdam.com"}'),
('Port Authority of Hamburg', 'port_authority', '{"email": "info@hafen-hamburg.de", "phone": "+49 40 42847-0", "address": "Neuer Wandrahm 4, 20457 Hamburg", "website": "https://www.hafen-hamburg.de"}'),
('Port of Los Angeles', 'port_authority', '{"email": "customerservice@portla.org", "phone": "+1 310-732-3508", "address": "425 S Palos Verdes Street, San Pedro, CA 90731", "website": "https://www.portoflosangeles.org"}'),
('Maersk Line', 'shipping_company', '{"email": "info@maersk.com", "phone": "+45 33 63 33 63", "address": "Esplanaden 50, 1098 Copenhagen K", "website": "https://www.maersk.com"}'),
('CMA CGM Group', 'shipping_company', '{"email": "info@cma-cgm.com", "phone": "+33 4 88 91 90 00", "address": "4 quai d''Arenc, 13002 Marseille", "website": "https://www.cma-cgm.com"}'),
('Mediterranean Shipping Company', 'shipping_company', '{"email": "info@msc.com", "phone": "+41 22 703 8888", "address": "Chemin Rieu 12-14, 1208 Geneva", "website": "https://www.msc.com"}'),
('DHL Global Forwarding', 'freight_forwarder', '{"email": "info@dhl.com", "phone": "+49 228 182-0", "address": "Charles-de-Gaulle-Straße 20, 53113 Bonn", "website": "https://www.dhl.com"}'),
('Kuehne + Nagel', 'freight_forwarder', '{"email": "info@kuehne-nagel.com", "phone": "+41 44 786 95 11", "address": "Dorfstrasse 50, 8834 Schindellegi", "website": "https://www.kuehne-nagel.com"}'),
('Expeditors International', 'freight_forwarder', '{"email": "info@expeditors.com", "phone": "+1 206-674-3400", "address": "1015 Third Avenue, Seattle, WA 98104", "website": "https://www.expeditors.com"}'),
('Bureau Veritas', 'inspection_agency', '{"email": "info@bureauveritas.com", "phone": "+33 1 42 91 96 96", "address": "67-71 Boulevard du Château, 92200 Neuilly-sur-Seine", "website": "https://www.bureauveritas.com"}'),
('SGS Group', 'inspection_agency', '{"email": "info@sgs.com", "phone": "+41 22 739 91 11", "address": "1 place des Alpes, 1201 Geneva", "website": "https://www.sgs.com"}'),
('Intertek Group', 'inspection_agency', '{"email": "info@intertek.com", "phone": "+44 20 7396 3400", "address": "33 Cavendish Square, London W1G 0PS", "website": "https://www.intertek.com"}');