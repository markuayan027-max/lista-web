INSERT INTO public.testimonials (quote, attribution, name, role) VALUES
('Salamat sa Lorenz ISTA! Nakakuha na ako ng trabaho bilang electrician. Inirekomenda ko sa lahat ng kaibigan ko.', 'Juan Dela Cruz', 'Juan Dela Cruz', 'Licensed Electrician'),
('Nag-avail ako ng TWSP scholarship para sa Bookkeeping. Libre ang training at sobrang dami akong natutunan. Ngayon ay employed na ako!', 'Elena Santos', 'Elena Santos', 'Bookkeeper, TWSP Scholar'),
('Ang instructors dito ay propesyonal at maalam. Hindi lang teorya ang ituturo sa iyo - hands-on talaga ang lahat.', 'Ricardo Reyes', 'Ricardo Reyes', 'IT Support Technician'),
('Ang Lorenz Assessment Center ay mabilis at maayos ang proseso. Nakuha ko agad ang aking NC II certificate.', 'Maria Luz', 'Maria Luz', 'PTCACS Certified')
ON CONFLICT DO NOTHING;
