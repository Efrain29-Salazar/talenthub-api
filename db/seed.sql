-- Datos de prueba. Las tablas las crean las migraciones de Prisma (npx prisma migrate dev / migrate deploy).
-- Primero van las empresas, porque cada vacante apunta a una empresa (clave foránea company_id).
INSERT INTO companies (id, name, industry) VALUES
  ('empresa-1', 'Tech Andes', 'Tecnología'),
  ('empresa-2', 'DataSur', 'Datos');

INSERT INTO vacancies (title, company_id, modality, salary) VALUES
  ('Desarrollador Backend Jr', 'empresa-1', 'remoto', 900),
  ('Analista de Datos', 'empresa-2', 'híbrido', 1100);

INSERT INTO candidates (name, email, city, experience_years, skills) VALUES
  ('María Pérez', 'maria.perez@correo.com', 'Quito', 3, ARRAY['TypeScript', 'SQL']),
  ('Carlos Andrade', 'carlos.andrade@correo.com', 'Guayaquil', 5, ARRAY['Java', 'Docker']);
