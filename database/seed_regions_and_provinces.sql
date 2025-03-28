-- Insert regions and provinces
DO $$
BEGIN
    -- REGION I - ILOCOS REGION
    INSERT INTO regions (name) VALUES ('REGION I - ILOCOS REGION') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['ILOCOS NORTE', 'ILOCOS SUR', 'LA UNION', 'PANGASINAN']), id
    FROM regions WHERE name = 'REGION I - ILOCOS REGION';

    -- REGION II - CAGAYAN VALLEY
    INSERT INTO regions (name) VALUES ('REGION II - CAGAYAN VALLEY') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['BATANES', 'CAGAYAN', 'ISABELA', 'NUEVA VIZCAYA', 'QUIRINO']), id
    FROM regions WHERE name = 'REGION II - CAGAYAN VALLEY';

    -- REGION III - CENTRAL LUZON
    INSERT INTO regions (name) VALUES ('REGION III - CENTRAL LUZON') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['AURORA', 'BATAAN', 'BULACAN', 'NUEVA ECIJA', 'PAMPANGA', 'TARLAC', 'ZAMBALES']), id
    FROM regions WHERE name = 'REGION III - CENTRAL LUZON';

    -- REGION IV-A - CALABARZON
    INSERT INTO regions (id, name) VALUES ('d3df12ed-e50f-4fd1-bcef-ce53b5059b23', 'REGION IV-A - CALABARZON') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (id, name, region_id) VALUES
        ('00bfcb99-df26-4d39-b644-4a7a9255e5c1', 'CAVITE', 'd3df12ed-e50f-4fd1-bcef-ce53b5059b23'),
        ('00bfcb99-df26-4d39-b644-4a7a9255e5c2', 'LAGUNA', 'd3df12ed-e50f-4fd1-bcef-ce53b5059b23'),
        ('00bfcb99-df26-4d39-b644-4a7a9255e5c3', 'BATANGAS', 'd3df12ed-e50f-4fd1-bcef-ce53b5059b23')
    ON CONFLICT (name) DO NOTHING;

    -- Create chatrooms for provinces
    INSERT INTO chatrooms (id, name, province_id) VALUES
        ('11111111-1111-1111-1111-111111111111', 'Cavite Chatroom', '00bfcb99-df26-4d39-b644-4a7a9255e5c1'),
        ('22222222-2222-2222-2222-222222222222', 'Laguna Chatroom', '00bfcb99-df26-4d39-b644-4a7a9255e5c2'),
        ('33333333-3333-3333-3333-333333333333', 'Batangas Chatroom', '00bfcb99-df26-4d39-b644-4a7a9255e5c3')
    ON CONFLICT (name) DO NOTHING;

    -- REGION IV-B - MIMAROPA
    INSERT INTO regions (name) VALUES ('REGION IV-B - MIMAROPA') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['MARINDUQUE', 'OCCIDENTAL MINDORO', 'ORIENTAL MINDORO', 'PALAWAN', 'ROMBLON']), id
    FROM regions WHERE name = 'REGION IV-B - MIMAROPA';

    -- REGION V - BICOL REGION
    INSERT INTO regions (name) VALUES ('REGION V - BICOL REGION') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['ALBAY', 'CAMARINES NORTE', 'CAMARINES SUR', 'CATANDUANES', 'MASBATE', 'SORSOGON']), id
    FROM regions WHERE name = 'REGION V - BICOL REGION';

    -- REGION VI - WESTERN VISAYAS
    INSERT INTO regions (name) VALUES ('REGION VI - WESTERN VISAYAS') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['AKLAN', 'ANTIQUE', 'CAPIZ', 'GUIMARAS', 'ILOILO', 'NEGROS OCCIDENTAL']), id
    FROM regions WHERE name = 'REGION VI - WESTERN VISAYAS';

    -- REGION VII - CENTRAL VISAYAS
    INSERT INTO regions (name) VALUES ('REGION VII - CENTRAL VISAYAS') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['BOHOL', 'CEBU', 'NEGROS ORIENTAL', 'SIQUIJOR']), id
    FROM regions WHERE name = 'REGION VII - CENTRAL VISAYAS';

    -- REGION VIII - EASTERN VISAYAS
    INSERT INTO regions (name) VALUES ('REGION VIII - EASTERN VISAYAS') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['BILIRAN', 'EASTERN SAMAR', 'LEYTE', 'NORTHERN SAMAR', 'SAMAR', 'SOUTHERN LEYTE']), id
    FROM regions WHERE name = 'REGION VIII - EASTERN VISAYAS';

    -- REGION IX - ZAMBOANGA PENINSULA
    INSERT INTO regions (name) VALUES ('REGION IX - ZAMBOANGA PENINSULA') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['ZAMBOANGA DEL NORTE', 'ZAMBOANGA DEL SUR', 'ZAMBOANGA SIBUGAY']), id
    FROM regions WHERE name = 'REGION IX - ZAMBOANGA PENINSULA';

    -- REGION X - NORTHERN MINDANAO
    INSERT INTO regions (name) VALUES ('REGION X - NORTHERN MINDANAO') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['BUKIDNON', 'CAMIGUIN', 'LANAO DEL NORTE', 'MISAMIS OCCIDENTAL', 'MISAMIS ORIENTAL']), id
    FROM regions WHERE name = 'REGION X - NORTHERN MINDANAO';

    -- REGION XI - DAVAO REGION
    INSERT INTO regions (name) VALUES ('REGION XI - DAVAO REGION') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['DAVAO DE ORO', 'DAVAO DEL NORTE', 'DAVAO DEL SUR', 'DAVAO OCCIDENTAL', 'DAVAO ORIENTAL']), id
    FROM regions WHERE name = 'REGION XI - DAVAO REGION';

    -- REGION XII - SOCCSKSARGEN
    INSERT INTO regions (name) VALUES ('REGION XII - SOCCSKSARGEN') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['COTABATO', 'SARANGANI', 'SOUTH COTABATO', 'SULTAN KUDARAT']), id
    FROM regions WHERE name = 'REGION XII - SOCCSKSARGEN';

    -- REGION XIII - CARAGA
    INSERT INTO regions (name) VALUES ('REGION XIII - CARAGA') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['AGUSAN DEL NORTE', 'AGUSAN DEL SUR', 'DINAGAT ISLANDS', 'SURIGAO DEL NORTE', 'SURIGAO DEL SUR']), id
    FROM regions WHERE name = 'REGION XIII - CARAGA';

    -- BARMM
    INSERT INTO regions (name) VALUES ('BARMM') ON CONFLICT (name) DO NOTHING;
    INSERT INTO provinces (name, region_id)
    SELECT unnest(array['BASILAN', 'LANAO DEL SUR', 'MAGUINDANAO DEL NORTE', 'MAGUINDANAO DEL SUR', 'SULU', 'TAWI-TAWI']), id
    FROM regions WHERE name = 'BARMM';
END $$;
