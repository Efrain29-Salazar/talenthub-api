-- Reinicia la tabla de candidatos (borra los datos y el contador de ids) y carga datos de prueba.
-- Sirve para dejar la base en el mismo estado que el repositorio en memoria antes de probar con Postman.
TRUNCATE candidates RESTART IDENTITY;

INSERT INTO candidates (name, email, city, experience_years, skills) VALUES
  ('María Pérez', 'maria.perez@correo.com', 'Quito', 3, ARRAY['TypeScript', 'SQL']),
  ('Carlos Andrade', 'carlos.andrade@correo.com', 'Guayaquil', 5, ARRAY['Java', 'Docker']);
