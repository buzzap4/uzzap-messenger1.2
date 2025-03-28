-- Clear existing data
TRUNCATE regions CASCADE;

-- Insert all regions
INSERT INTO regions (id, name) VALUES
    ('NCR', 'National Capital Region'),
    ('CAR', 'Cordillera Administrative Region'),
    ('R1', 'Ilocos Region'),
    ('R2', 'Cagayan Valley'),
    ('R3', 'Central Luzon'),
    ('R4A', 'CALABARZON'),
    ('R4B', 'MIMAROPA'),
    ('R5', 'Bicol Region'),
    ('R6', 'Western Visayas'),
    ('R7', 'Central Visayas'),
    ('R8', 'Eastern Visayas'),
    ('R9', 'Zamboanga Peninsula'),
    ('R10', 'Northern Mindanao'),
    ('R11', 'Davao Region'),
    ('R12', 'SOCCSKSARGEN'),
    ('R13', 'Caraga'),
    ('BARMM', 'Bangsamoro Autonomous Region in Muslim Mindanao');

-- Insert provinces by region
-- NCR
INSERT INTO provinces (id, region_id, name) VALUES
    ('NCR-01', 'NCR', 'Manila'),
    ('NCR-02', 'NCR', 'Quezon City'),
    ('NCR-03', 'NCR', 'Caloocan'),
    ('NCR-04', 'NCR', 'Las Piñas'),
    ('NCR-05', 'NCR', 'Makati'),
    ('NCR-06', 'NCR', 'Malabon'),
    ('NCR-07', 'NCR', 'Mandaluyong'),
    ('NCR-08', 'NCR', 'Marikina'),
    ('NCR-09', 'NCR', 'Muntinlupa'),
    ('NCR-10', 'NCR', 'Navotas'),
    ('NCR-11', 'NCR', 'Parañaque'),
    ('NCR-12', 'NCR', 'Pasay'),
    ('NCR-13', 'NCR', 'Pasig'),
    ('NCR-14', 'NCR', 'San Juan'),
    ('NCR-15', 'NCR', 'Taguig'),
    ('NCR-16', 'NCR', 'Valenzuela'),
    ('NCR-17', 'NCR', 'Pateros');

-- CAR
INSERT INTO provinces (id, region_id, name) VALUES
    ('CAR-01', 'CAR', 'Abra'),
    ('CAR-02', 'CAR', 'Apayao'),
    ('CAR-03', 'CAR', 'Benguet'),
    ('CAR-04', 'CAR', 'Ifugao'),
    ('CAR-05', 'CAR', 'Kalinga'),
    ('CAR-06', 'CAR', 'Mountain Province');

-- Region I (Ilocos Region)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R1-01', 'R1', 'Ilocos Norte'),
    ('R1-02', 'R1', 'Ilocos Sur'),
    ('R1-03', 'R1', 'La Union'),
    ('R1-04', 'R1', 'Pangasinan');

-- Region II (Cagayan Valley)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R2-01', 'R2', 'Batanes'),
    ('R2-02', 'R2', 'Cagayan'),
    ('R2-03', 'R2', 'Isabela'),
    ('R2-04', 'R2', 'Nueva Vizcaya'),
    ('R2-05', 'R2', 'Quirino');

-- Region III (Central Luzon)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R3-01', 'R3', 'Aurora'),
    ('R3-02', 'R3', 'Bataan'),
    ('R3-03', 'R3', 'Bulacan'),
    ('R3-04', 'R3', 'Nueva Ecija'),
    ('R3-05', 'R3', 'Pampanga'),
    ('R3-06', 'R3', 'Tarlac'),
    ('R3-07', 'R3', 'Zambales');

-- Region IV-A (CALABARZON)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R4A-01', 'R4A', 'Batangas'),
    ('R4A-02', 'R4A', 'Cavite'),
    ('R4A-03', 'R4A', 'Laguna'),
    ('R4A-04', 'R4A', 'Quezon'),
    ('R4A-05', 'R4A', 'Rizal');

-- Region IV-B (MIMAROPA)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R4B-01', 'R4B', 'Marinduque'),
    ('R4B-02', 'R4B', 'Occidental Mindoro'),
    ('R4B-03', 'R4B', 'Oriental Mindoro'),
    ('R4B-04', 'R4B', 'Palawan'),
    ('R4B-05', 'R4B', 'Romblon');

-- Region V (Bicol Region)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R5-01', 'R5', 'Albay'),
    ('R5-02', 'R5', 'Camarines Norte'),
    ('R5-03', 'R5', 'Camarines Sur'),
    ('R5-04', 'R5', 'Catanduanes'),
    ('R5-05', 'R5', 'Masbate'),
    ('R5-06', 'R5', 'Sorsogon');

-- Region VI (Western Visayas)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R6-01', 'R6', 'Aklan'),
    ('R6-02', 'R6', 'Antique'),
    ('R6-03', 'R6', 'Capiz'),
    ('R6-04', 'R6', 'Guimaras'),
    ('R6-05', 'R6', 'Iloilo'),
    ('R6-06', 'R6', 'Negros Occidental');

-- Region VII (Central Visayas)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R7-01', 'R7', 'Bohol'),
    ('R7-02', 'R7', 'Cebu'),
    ('R7-03', 'R7', 'Negros Oriental'),
    ('R7-04', 'R7', 'Siquijor');

-- Region VIII (Eastern Visayas)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R8-01', 'R8', 'Biliran'),
    ('R8-02', 'R8', 'Eastern Samar'),
    ('R8-03', 'R8', 'Leyte'),
    ('R8-04', 'R8', 'Northern Samar'),
    ('R8-05', 'R8', 'Samar'),
    ('R8-06', 'R8', 'Southern Leyte');

-- Region IX (Zamboanga Peninsula)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R9-01', 'R9', 'Zamboanga del Norte'),
    ('R9-02', 'R9', 'Zamboanga del Sur'),
    ('R9-03', 'R9', 'Zamboanga Sibugay');

-- Region X (Northern Mindanao)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R10-01', 'R10', 'Bukidnon'),
    ('R10-02', 'R10', 'Camiguin'),
    ('R10-03', 'R10', 'Lanao del Norte'),
    ('R10-04', 'R10', 'Misamis Occidental'),
    ('R10-05', 'R10', 'Misamis Oriental');

-- Region XI (Davao Region)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R11-01', 'R11', 'Davao de Oro'),
    ('R11-02', 'R11', 'Davao del Norte'),
    ('R11-03', 'R11', 'Davao del Sur'),
    ('R11-04', 'R11', 'Davao Occidental'),
    ('R11-05', 'R11', 'Davao Oriental');

-- Region XII (SOCCSKSARGEN)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R12-01', 'R12', 'Cotabato'),
    ('R12-02', 'R12', 'Sarangani'),
    ('R12-03', 'R12', 'South Cotabato'),
    ('R12-04', 'R12', 'Sultan Kudarat');

-- Region XIII (Caraga)
INSERT INTO provinces (id, region_id, name) VALUES
    ('R13-01', 'R13', 'Agusan del Norte'),
    ('R13-02', 'R13', 'Agusan del Sur'),
    ('R13-03', 'R13', 'Dinagat Islands'),
    ('R13-04', 'R13', 'Surigao del Norte'),
    ('R13-05', 'R13', 'Surigao del Sur');

-- BARMM
INSERT INTO provinces (id, region_id, name) VALUES
    ('BARMM-01', 'BARMM', 'Basilan'),
    ('BARMM-02', 'BARMM', 'Lanao del Sur'),
    ('BARMM-03', 'BARMM', 'Maguindanao del Norte'),
    ('BARMM-04', 'BARMM', 'Maguindanao del Sur'),
    ('BARMM-05', 'BARMM', 'Sulu'),
    ('BARMM-06', 'BARMM', 'Tawi-Tawi');

-- Create default chatrooms for each province
INSERT INTO chatrooms (id, province_id, name)
SELECT 
    LOWER(p.id) || '-general',
    p.id,
    p.name || ' General Chat'
FROM provinces p;
