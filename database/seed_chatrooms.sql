-- Insert chatrooms for provinces
DO $$
BEGIN
    -- REGION I - ILOCOS REGION
    INSERT INTO chatrooms (id, name, province_id) VALUES
        ('11111111-1111-1111-1111-111111111111', 'Ilocos Norte Chatroom', '22222222-2222-2222-2222-222222222222'),
        ('22222222-2222-2222-2222-222222222222', 'Ilocos Sur Chatroom', '33333333-3333-3333-3333-333333333333'),
        ('33333333-3333-3333-3333-333333333333', 'La Union Chatroom', '44444444-4444-4444-4444-444444444444'),
        ('44444444-4444-4444-4444-444444444444', 'Pangasinan Chatroom', '55555555-5555-5555-5555-555555555555');

    -- REGION II - CAGAYAN VALLEY
    INSERT INTO chatrooms (id, name, province_id) VALUES
        ('55555555-5555-5555-5555-555555555556', 'Batanes Chatroom', '77777777-7777-7777-7777-777777777777'),
        ('66666666-6666-6666-6666-666666666667', 'Cagayan Chatroom', '88888888-8888-8888-8888-888888888888'),
        ('77777777-7777-7777-7777-777777777778', 'Isabela Chatroom', '99999999-9999-9999-9999-999999999999'),
        ('88888888-8888-8888-8888-888888888889', 'Nueva Vizcaya Chatroom', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
        ('99999999-9999-9999-9999-999999999990', 'Quirino Chatroom', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

    -- REGION III - CENTRAL LUZON
    INSERT INTO chatrooms (id, name, province_id) VALUES
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Aurora Chatroom', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Bataan Chatroom', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Bulacan Chatroom', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
        ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Nueva Ecija Chatroom', '00000000-0000-0000-0000-000000000000'),
        ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Pampanga Chatroom', '11111111-1111-1111-1111-111111111112'),
        ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Tarlac Chatroom', '22222222-2222-2222-2222-222222222223'),
        ('00000000-0000-0000-0000-000000000000', 'Zambales Chatroom', '33333333-3333-3333-3333-333333333334');

    -- REGION IV-A - CALABARZON
    INSERT INTO chatrooms (id, name, province_id) VALUES
        ('11111111-1111-1111-1111-111111111113', 'Batangas Chatroom', '55555555-5555-5555-5555-555555555556'),
        ('22222222-2222-2222-2222-222222222224', 'Cavite Chatroom', '66666666-6666-6666-6666-666666666667'),
        ('33333333-3333-3333-3333-333333333335', 'Laguna Chatroom', '77777777-7777-7777-7777-777777777778'),
        ('44444444-4444-4444-4444-444444444445', 'Quezon Chatroom', '88888888-8888-8888-8888-888888888889'),
        ('55555555-5555-5555-5555-555555555557', 'Rizal Chatroom', '99999999-9999-9999-9999-999999999990');
END $$;
