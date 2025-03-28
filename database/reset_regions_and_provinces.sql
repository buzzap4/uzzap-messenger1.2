-- Step 1: Delete all existing provinces and regions
TRUNCATE TABLE provinces CASCADE;
TRUNCATE TABLE regions CASCADE;

-- Step 2: Insert regions and provinces
DO $$
BEGIN
    -- REGION I - ILOCOS REGION
    INSERT INTO regions (id, name) VALUES ('11111111-1111-1111-1111-111111111111', 'REGION I - ILOCOS REGION');
    INSERT INTO provinces (id, name, region_id) VALUES
        ('22222222-2222-2222-2222-222222222222', 'ILOCOS NORTE', '11111111-1111-1111-1111-111111111111'),
        ('33333333-3333-3333-3333-333333333333', 'ILOCOS SUR', '11111111-1111-1111-1111-111111111111'),
        ('44444444-4444-4444-4444-444444444444', 'LA UNION', '11111111-1111-1111-1111-111111111111'),
        ('55555555-5555-5555-5555-555555555555', 'PANGASINAN', '11111111-1111-1111-1111-111111111111');

    -- REGION II - CAGAYAN VALLEY
    INSERT INTO regions (id, name) VALUES ('66666666-6666-6666-6666-666666666666', 'REGION II - CAGAYAN VALLEY');
    INSERT INTO provinces (id, name, region_id) VALUES
        ('77777777-7777-7777-7777-777777777777', 'BATANES', '66666666-6666-6666-6666-666666666666'),
        ('88888888-8888-8888-8888-888888888888', 'CAGAYAN', '66666666-6666-6666-6666-666666666666'),
        ('99999999-9999-9999-9999-999999999999', 'ISABELA', '66666666-6666-6666-6666-666666666666'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NUEVA VIZCAYA', '66666666-6666-6666-6666-666666666666'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'QUIRINO', '66666666-6666-6666-6666-666666666666');

    -- REGION III - CENTRAL LUZON
    INSERT INTO regions (id, name) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'REGION III - CENTRAL LUZON');
    INSERT INTO provinces (id, name, region_id) VALUES
        ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'AURORA', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
        ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'BATAAN', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
        ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'BULACAN', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
        ('00000000-0000-0000-0000-000000000000', 'NUEVA ECIJA', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
        ('11111111-1111-1111-1111-111111111112', 'PAMPANGA', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
        ('22222222-2222-2222-2222-222222222223', 'TARLAC', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
        ('33333333-3333-3333-3333-333333333334', 'ZAMBALES', 'cccccccc-cccc-cccc-cccc-cccccccccccc');

    -- REGION IV-A - CALABARZON
    INSERT INTO regions (id, name) VALUES ('44444444-4444-4444-4444-444444444445', 'REGION IV-A - CALABARZON');
    INSERT INTO provinces (id, name, region_id) VALUES
        ('55555555-5555-5555-5555-555555555556', 'BATANGAS', '44444444-4444-4444-4444-444444444445'),
        ('66666666-6666-6666-6666-666666666667', 'CAVITE', '44444444-4444-4444-4444-444444444445'),
        ('77777777-7777-7777-7777-777777777778', 'LAGUNA', '44444444-4444-4444-4444-444444444445'),
        ('88888888-8888-8888-8888-888888888889', 'QUEZON', '44444444-4444-4444-4444-444444444445'),
        ('99999999-9999-9999-9999-999999999990', 'RIZAL', '44444444-4444-4444-4444-444444444445');

    -- Add more regions and provinces as needed...
END $$;
