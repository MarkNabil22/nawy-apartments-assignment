CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE TABLE IF NOT EXISTS apartments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_name VARCHAR(120) NOT NULL,
  unit_number VARCHAR(40) NOT NULL UNIQUE,
  project VARCHAR(120) NOT NULL,
  location VARCHAR(160) NOT NULL,
  price BIGINT NOT NULL CHECK (price > 0),
  bedrooms SMALLINT NOT NULL CHECK (bedrooms BETWEEN 0 AND 20),
  bathrooms SMALLINT NOT NULL CHECK (bathrooms BETWEEN 1 AND 20),
  area_sqm INTEGER NOT NULL CHECK (area_sqm > 0),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','sold')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS apartments_search_idx ON apartments USING gin ((unit_name || ' ' || unit_number || ' ' || project) gin_trgm_ops);
INSERT INTO apartments (unit_name, unit_number, project, location, price, bedrooms, bathrooms, area_sqm, description, image_url) VALUES
('Palm Residence', 'PW-101', 'Palm Hills New Cairo', 'New Cairo, Cairo', 8500000, 3, 3, 185, 'A sunlit corner apartment with a wide reception, landscaped views, and a thoughtfully separated private bedroom wing.', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80'),
('Lagoon Loft', 'GS-204', 'Swan Lake Gouna', 'El Gouna, Red Sea', 12750000, 2, 2, 142, 'Contemporary waterfront living with an open kitchen, generous terrace, and direct views over the lagoon.', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80'),
('Skyline Suite', 'ZN-503', 'Zed East', 'New Cairo, Cairo', 9900000, 3, 2, 171, 'A refined upper-floor home with calm neutral finishes, floor-to-ceiling glazing, and a flexible family room.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'),
('Garden House', 'MV-012', 'Mountain View iCity', 'New Cairo, Cairo', 6800000, 2, 2, 135, 'Ground-floor apartment opening onto a private garden, designed for relaxed indoor-outdoor family living.', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80'),
('Park View', 'BE-330', 'Badya', '6th of October, Giza', 7450000, 3, 3, 190, 'A practical family apartment overlooking the park with abundant storage, a maid room, and a sheltered balcony.', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80'),
('Coastal Haven', 'NM-118', 'North Coast Marassi', 'Sidi Abdel Rahman, North Coast', 15400000, 2, 2, 128, 'An airy coastal retreat minutes from the beach, featuring soft natural textures and a large entertaining terrace.', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80')
ON CONFLICT (unit_number) DO NOTHING;
