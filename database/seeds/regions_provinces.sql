-- Drop existing data
TRUNCATE TABLE provinces RESTART IDENTITY CASCADE;
TRUNCATE TABLE regions RESTART IDENTITY CASCADE;

-- Seed Regions
INSERT INTO regions (id, name, code, order_sequence, is_active) VALUES
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'National Capital Region', 'NCR', 1, true),
    ('550e8400-e29b-41d4-a716-446655440000', 'Ilocos Region', 'R1', 2, true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Cagayan Valley', 'R2', 3, true),
    ('550e8400-e29b-41d4-a716-446655440002', 'Central Luzon', 'R3', 4, true),
    ('550e8400-e29b-41d4-a716-446655440003', 'CALABARZON', 'R4A', 5, true),
    ('550e8400-e29b-41d4-a716-446655440004', 'MIMAROPA', 'R4B', 6, true),
    ('550e8400-e29b-41d4-a716-446655440005', 'Bicol Region', 'R5', 7, true),
    ('550e8400-e29b-41d4-a716-446655440006', 'Western Visayas', 'R6', 8, true),
    ('550e8400-e29b-41d4-a716-446655440007', 'Central Visayas', 'R7', 9, true),
    ('550e8400-e29b-41d4-a716-446655440008', 'Eastern Visayas', 'R8', 10, true),
    ('550e8400-e29b-41d4-a716-446655440009', 'Zamboanga Peninsula', 'R9', 11, true),
    ('550e8400-e29b-41d4-a716-446655440010', 'Northern Mindanao', 'R10', 12, true),
    ('550e8400-e29b-41d4-a716-446655440011', 'Davao Region', 'R11', 13, true),
    ('550e8400-e29b-41d4-a716-446655440012', 'SOCCSKSARGEN', 'R12', 14, true),
    ('550e8400-e29b-41d4-a716-446655440013', 'Caraga', 'R13', 15, true),
    ('550e8400-e29b-41d4-a716-446655440014', 'Bangsamoro', 'BARMM', 16, true),
    ('550e8400-e29b-41d4-a716-446655440015', 'Cordillera Administrative Region', 'CAR', 17, true);

-- Seed Provinces
INSERT INTO provinces (id, region_id, name, code, is_active) VALUES
    -- NCR
    ('123e4567-e89b-12d3-a456-426614174000', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Metro Manila', 'MM', true),
    
    -- Region 1 (Ilocos Region)
    ('987fcdeb-51a2-4121-9c1a-426614174001', '550e8400-e29b-41d4-a716-446655440000', 'Ilocos Norte', 'IN', true),
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Ilocos Sur', 'IS', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430c9', '550e8400-e29b-41d4-a716-446655440000', 'La Union', 'LU', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430ca', '550e8400-e29b-41d4-a716-446655440000', 'Pangasinan', 'PAN', true),
    
    -- Region 2 (Cagayan Valley)
    ('550e8400-e29b-41d4-a716-446655440002', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Cagayan', 'CAG', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430cb', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Isabela', 'ISA', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430cc', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Nueva Vizcaya', 'NV', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430cd', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Quirino', 'QUI', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430ce', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Batanes', 'BAT', true),

    -- Region 3 (Central Luzon)
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Pampanga', 'PAM', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430cf', '550e8400-e29b-41d4-a716-446655440002', 'Bataan', 'BTN', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430d0', '550e8400-e29b-41d4-a716-446655440002', 'Bulacan', 'BUL', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430d1', '550e8400-e29b-41d4-a716-446655440002', 'Nueva Ecija', 'NE', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430d2', '550e8400-e29b-41d4-a716-446655440002', 'Tarlac', 'TAR', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430d3', '550e8400-e29b-41d4-a716-446655440002', 'Zambales', 'ZAM', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430d4', '550e8400-e29b-41d4-a716-446655440002', 'Aurora', 'AUR', true),

    -- Region 4A (CALABARZON)
    ('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Laguna', 'LAG', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430d5', '550e8400-e29b-41d4-a716-446655440003', 'Cavite', 'CAV', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430d6', '550e8400-e29b-41d4-a716-446655440003', 'Batangas', 'BAT', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430d7', '550e8400-e29b-41d4-a716-446655440003', 'Rizal', 'RIZ', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430d8', '550e8400-e29b-41d4-a716-446655440003', 'Quezon', 'QUE', true),

    -- Region 4B (MIMAROPA)
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'Palawan', 'PLW', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430d9', '550e8400-e29b-41d4-a716-446655440004', 'Marinduque', 'MDQ', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430da', '550e8400-e29b-41d4-a716-446655440004', 'Occidental Mindoro', 'OCM', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430db', '550e8400-e29b-41d4-a716-446655440004', 'Oriental Mindoro', 'ORM', true),
    ('6ba7b810-9dad-11d1-80b4-00c04fd430dc', '550e8400-e29b-41d4-a716-446655440004', 'Romblon', 'ROM', true),

    -- Add the rest of the provinces for other regions following the same pattern...
    -- Continue with remaining provinces...
