-- Remove public commencement story linked to Office of the Speaker (run on InsForge prod).
DELETE FROM public.announcements
WHERE lower(title) LIKE '%19th commencement%'
   OR lower(title) LIKE '%commencement exercises%'
   OR lower(body) LIKE '%office of the speaker%'
   OR lower(body) LIKE '%speakermartin%'
   OR lower(body) LIKE '%romualdez%';
