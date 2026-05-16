-- Seed initial staff and admin profiles into public.users
-- Note: These IDs are generated to match institutional-data.ts logic, 
-- but in a live app, these would typically be synced from InsForge Auth IDs.

INSERT INTO public.users (first_name, last_name, email, password_hash, role, status) VALUES
('Lina Theresa', 'Zapanta Escudero', 'lina.escudero@lorenzinternational.org', '$2b$10$placeholder', 'staff', 'active'),
('Joseph Carlo', 'Hormillada Espiritu', 'joseph.espiritu@lorenzinternational.org', '$2b$10$placeholder', 'staff', 'active'),
('Rhey Yordan', 'Maputol', 'rhey.maputol@lorenzinternational.org', '$2b$10$placeholder', 'staff', 'active'),
('Jojet B.', 'Andrino', 'jojet.andrino@lorenzinternational.org', '$2b$10$placeholder', 'staff', 'active'),
('Maggie Gudella', 'Zapanta-Tse', 'admin@lorenzinternational.org', '$2b$10$placeholder', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;
