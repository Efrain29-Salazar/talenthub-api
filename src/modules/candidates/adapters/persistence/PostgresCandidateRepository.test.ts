// Carga el .env para tener TEST_DATABASE_URL (Jest no lo carga solo).
import 'dotenv/config';

import { Pool } from 'pg';

import { createPostgresPool } from '../../../../shared/database/postgresPool';
import { PostgresCandidateRepository } from './PostgresCandidateRepository';

// PROTECCIÓN: estas pruebas BORRAN la tabla. Si la base de pruebas no existe o es la misma
// que la de desarrollo, la suite falla ANTES de ejecutar cualquier prueba.
const testDatabaseUrl = process.env.TEST_DATABASE_URL?.trim();
const developmentDatabaseUrl = process.env.DATABASE_URL?.trim();

if (!testDatabaseUrl) {
  throw new Error('Falta TEST_DATABASE_URL en el archivo .env');
}

if (testDatabaseUrl === developmentDatabaseUrl) {
  throw new Error('TEST_DATABASE_URL no puede ser igual a DATABASE_URL: las pruebas borrarían los datos de desarrollo');
}

// Datos de ejemplo (datos de prueba en español).
const sampleCandidate = {
  name: 'Ana Torres',
  email: 'ana@correo.com',
  city: 'Quito',
  experienceYears: 2,
  skills: ['TypeScript', 'SQL'],
};

describe('PostgresCandidateRepository', () => {
  let pool: Pool;
  let repository: PostgresCandidateRepository;

  // Una vez antes de todas las pruebas: abre la conexión a la base de PRUEBAS.
  beforeAll(() => {
    pool = createPostgresPool(testDatabaseUrl);
    repository = new PostgresCandidateRepository(pool);
  });

  // Antes de CADA prueba: vacía la tabla y reinicia el contador de ids en 1.
  beforeEach(async () => {
    await pool.query('TRUNCATE candidates RESTART IDENTITY');
  });

  // Una vez al final: cierra las conexiones para que Jest pueda terminar.
  afterAll(async () => {
    await pool.end();
  });

  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a candidate and assigns an id', async () => {
    const saved = await repository.save(sampleCandidate);

    // experienceYears vuelve como NÚMERO y skills como arreglo, gracias al mapeo del adaptador.
    expect(saved).toEqual({ id: 1, ...sampleCandidate });
  });

  it('assigns increasing ids and lists what was saved', async () => {
    await repository.save(sampleCandidate);
    const second = await repository.save(sampleCandidate);

    expect(second.id).toBe(2);
    expect(await repository.findAll()).toHaveLength(2);
  });

  it('finds a candidate by id and returns undefined when it does not exist', async () => {
    const saved = await repository.save(sampleCandidate);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findById(999)).toBeUndefined();
  });

  it('keeps the skills unchanged when saving and reading them back', async () => {
    const saved = await repository.save({ ...sampleCandidate, skills: ['Node.js', 'Docker', 'PostgreSQL'] });
    const withoutSkills = await repository.save({ ...sampleCandidate, skills: [] });

    expect((await repository.findById(saved.id))?.skills).toEqual(['Node.js', 'Docker', 'PostgreSQL']);
    expect((await repository.findById(withoutSkills.id))?.skills).toEqual([]);
  });

  it('updates an existing candidate and keeps its id', async () => {
    const saved = await repository.save(sampleCandidate);

    const updated = await repository.update(saved.id, { ...sampleCandidate, city: 'Guayaquil', skills: ['Java'] });

    expect(updated).toEqual({ id: saved.id, ...sampleCandidate, city: 'Guayaquil', skills: ['Java'] });
    expect(await repository.update(999, sampleCandidate)).toBeUndefined();
  });

  it('removes a candidate and reports whether it existed', async () => {
    const saved = await repository.save(sampleCandidate);

    expect(await repository.remove(saved.id)).toBe(true);
    expect(await repository.findAll()).toEqual([]);
    expect(await repository.remove(saved.id)).toBe(false);
  });
});
