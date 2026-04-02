-- Datos iniciales: roles, usuarios de prueba y clasificación mínima (solo desarrollo).
-- Ejecutar después de schema.sql
--
-- Credenciales de prueba (cambiar o eliminar en producción):
--   Administrador: admin@repositorio.local / Admin123!
--   Visitante:     visitante@repositorio.local / Visitante123!

INSERT INTO `roles` (`name`) VALUES
  ('admin'),
  ('editor'),
  ('public');

INSERT INTO `users` (`name`, `email`, `password`, `role_id`, `status`)
SELECT
  'Administrador (prueba)',
  'admin@repositorio.local',
  '$2b$10$YZ3dQ11Y8h7C6tyDIWcMg.ljB.HCoqJv.gCk5k0GeekfrwHwqGAHa',
  `id`,
  'active'
FROM `roles`
WHERE `name` = 'admin'
LIMIT 1;

INSERT INTO `users` (`name`, `email`, `password`, `role_id`, `status`)
SELECT
  'Visitante (prueba)',
  'visitante@repositorio.local',
  '$2b$10$E6QljiOFIuqClXmBAUfS1.hQ5z16ufMM/aVjHxUIoq7TUrECRuQ1a',
  `id`,
  'active'
FROM `roles`
WHERE `name` = 'public'
LIMIT 1;

INSERT IGNORE INTO `academic_programs` (`name`) VALUES ('Programa académico (prueba)');

INSERT IGNORE INTO `thesis_types` (`name`) VALUES
  ('Trabajo de investigación'),
  ('Monografía');

INSERT IGNORE INTO `research_lines` (`name`) VALUES
  ('Línea general (prueba)'),
  ('Innovación y tecnología');

INSERT IGNORE INTO `keywords` (`name`) VALUES
  ('inteligencia artificial'),
  ('datos'),
  ('educación');
