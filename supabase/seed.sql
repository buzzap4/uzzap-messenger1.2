-- Schema creation or migration code here...
-- ...existing schema creation code...

-- Reset tables
TRUNCATE regions, provinces, chatrooms CASCADE;

-- Insert all regions
INSERT INTO regions (id, name) VALUES
  ('r001', 'National Capital Region (NCR)'),
  ('r002', 'Cordillera Administrative Region (CAR)'),
  ('r003', 'Region I (Ilocos Region)'),
  ('r004', 'Region II (Cagayan Valley)'),
  ('r005', 'Region III (Central Luzon)'),
  ('r006', 'Region IV-A (CALABARZON)'),
  ('r007', 'Region IV-B (MIMAROPA)'),
  ('r008', 'Region V (Bicol Region)'),
  ('r009', 'Region VI (Western Visayas)'),
  ('r010', 'Region VII (Central Visayas)'),
  ('r011', 'Region VIII (Eastern Visayas)'),
  ('r012', 'Region IX (Zamboanga Peninsula)'),
  ('r013', 'Region X (Northern Mindanao)'),
  ('r014', 'Region XI (Davao Region)'),
  ('r015', 'Region XII (SOCCSKSARGEN)'),
  ('r016', 'Region XIII (Caraga)'),
  ('r017', 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)');

-- Insert provinces by region
INSERT INTO provinces (id, region_id, name) VALUES
  -- NCR Cities
  ('p001', 'r001', 'Manila'),
  ('p002', 'r001', 'Quezon City'),
  ('p003', 'r001', 'Caloocan'),
  ('p004', 'r001', 'Las Piñas'),
  ('p005', 'r001', 'Makati'),
  ('p006', 'r001', 'Malabon'),
  ('p007', 'r001', 'Mandaluyong'),
  ('p008', 'r001', 'Marikina'),
  ('p009', 'r001', 'Muntinlupa'),
  ('p010', 'r001', 'Navotas'),
  ('p011', 'r001', 'Parañaque'),
  ('p012', 'r001', 'Pasay'),
  ('p013', 'r001', 'Pasig'),
  ('p014', 'r001', 'San Juan'),
  ('p015', 'r001', 'Taguig'),
  ('p016', 'r001', 'Valenzuela'),

  -- CAR Provinces
  ('p017', 'r002', 'Abra'),
  ('p018', 'r002', 'Apayao'),
  ('p019', 'r002', 'Benguet'),
  ('p020', 'r002', 'Ifugao'),
  ('p021', 'r002', 'Kalinga'),
  ('p022', 'r002', 'Mountain Province'),

  -- Region I Provinces
  ('p023', 'r003', 'Ilocos Norte'),
  ('p024', 'r003', 'Ilocos Sur'),
  ('p025', 'r003', 'La Union'),
  ('p026', 'r003', 'Pangasinan'),

  -- Region II Provinces
  ('p027', 'r004', 'Batanes'),
  ('p028', 'r004', 'Cagayan'),
  ('p029', 'r004', 'Isabela'),
  ('p030', 'r004', 'Nueva Vizcaya'),
  ('p031', 'r004', 'Quirino'),

  -- Region III Provinces
  ('p032', 'r005', 'Aurora'),
  ('p033', 'r005', 'Bataan'),
  ('p034', 'r005', 'Bulacan'),
  ('p035', 'r005', 'Nueva Ecija'),
  ('p036', 'r005', 'Pampanga'),
  ('p037', 'r005', 'Tarlac'),
  ('p038', 'r005', 'Zambales'),

  -- Region IV-A Provinces
  ('p039', 'r006', 'Batangas'),
  ('p040', 'r006', 'Cavite'),
  ('p041', 'r006', 'Laguna'),
  ('p042', 'r006', 'Quezon'),
  ('p043', 'r006', 'Rizal'),

  -- Region IV-B Provinces
  ('p044', 'r007', 'Marinduque'),
  ('p045', 'r007', 'Occidental Mindoro'),
  ('p046', 'r007', 'Oriental Mindoro'),
  ('p047', 'r007', 'Palawan'),
  ('p048', 'r007', 'Romblon'),

  -- Region V Provinces
  ('p049', 'r008', 'Albay'),
  ('p050', 'r008', 'Camarines Norte'),
  ('p051', 'r008', 'Camarines Sur'),
  ('p052', 'r008', 'Catanduanes'),
  ('p053', 'r008', 'Masbate'),
  ('p054', 'r008', 'Sorsogon'),

  -- Region VI Provinces
  ('p055', 'r009', 'Aklan'),
  ('p056', 'r009', 'Antique'),
  ('p057', 'r009', 'Capiz'),
  ('p058', 'r009', 'Guimaras'),
  ('p059', 'r009', 'Iloilo'),
  ('p060', 'r009', 'Negros Occidental'),

  -- Region VII Provinces
  ('p061', 'r010', 'Bohol'),
  ('p062', 'r010', 'Cebu'),
  ('p063', 'r010', 'Negros Oriental'),
  ('p064', 'r010', 'Siquijor'),

  -- Region VIII Provinces
  ('p065', 'r011', 'Biliran'),
  ('p066', 'r011', 'Eastern Samar'),
  ('p067', 'r011', 'Leyte'),
  ('p068', 'r011', 'Northern Samar'),
  ('p069', 'r011', 'Samar'),
  ('p070', 'r011', 'Southern Leyte'),

  -- Region IX Provinces
  ('p071', 'r012', 'Zamboanga del Norte'),
  ('p072', 'r012', 'Zamboanga del Sur'),
  ('p073', 'r012', 'Zamboanga Sibugay'),

  -- Region X Provinces
  ('p074', 'r013', 'Bukidnon'),
  ('p075', 'r013', 'Camiguin'),
  ('p076', 'r013', 'Lanao del Norte'),
  ('p077', 'r013', 'Misamis Occidental'),
  ('p078', 'r013', 'Misamis Oriental'),

  -- Region XI Provinces
  ('p079', 'r014', 'Davao de Oro'),
  ('p080', 'r014', 'Davao del Norte'),
  ('p081', 'r014', 'Davao del Sur'),
  ('p082', 'r014', 'Davao Occidental'),
  ('p083', 'r014', 'Davao Oriental'),

  -- Region XII Provinces
  ('p084', 'r015', 'Cotabato'),
  ('p085', 'r015', 'Sarangani'),
  ('p086', 'r015', 'South Cotabato'),
  ('p087', 'r015', 'Sultan Kudarat'),

  -- Region XIII Provinces
  ('p088', 'r016', 'Agusan del Norte'),
  ('p089', 'r016', 'Agusan del Sur'),
  ('p090', 'r016', 'Dinagat Islands'),
  ('p091', 'r016', 'Surigao del Norte'),
  ('p092', 'r016', 'Surigao del Sur'),

  -- BARMM Provinces
  ('p093', 'r017', 'Basilan'),
  ('p094', 'r017', 'Lanao del Sur'),
  ('p095', 'r017', 'Maguindanao del Norte'),
  ('p096', 'r017', 'Maguindanao del Sur'),
  ('p097', 'r017', 'Sulu'),
  ('p098', 'r017', 'Tawi-Tawi');

-- Create a chatroom for each province/city
INSERT INTO chatrooms (id, province_id, name)
SELECT 
  'c' || id, -- Create chatroom id by prefixing province id with 'c'
  id,
  name || ' Community Hub'
FROM provinces;

-- Insert welcome messages for each chatroom
INSERT INTO messages (chatroom_id, content)
SELECT 
  id,
  'Welcome to ' || name || '! 👋 Start connecting with your community!'
FROM chatrooms;
