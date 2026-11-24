// Carga el .env para tener TEST_DATABASE_URL | Jest no lo carga solo
import 'dotenv/config';

import { Pool } from 'pg';

import { DomainError } from '../../../../shared/DomainError';
import { createPostgresPool } from '../../../../shared/database/postgresPool';
import { PostgresVacancyRepository } from './PostgresVacancyRepository';

// La vacante pertenece a una empresa que DEBE existir (clave foránea): se crea antes de cada prueba.
const sampleVacancy = { title: 'QA Tester', companyId: 'empresa-1', modality: 'remoto', salary: 800 };

// El repositorio también devuelve el nombre de la empresa (JOIN), por eso se espera en los resultados.
const withCompanyName = { ...sampleVacancy, companyName: 'Tech Andes' };

describe('PostgresVacancyRepository', () => {
  let pool: Pool;
  let repository: PostgresVacancyRepository;

  // Se ejecuta UNA vez antes de todas las pruebas: abre la conexión a la base de PRUEBAS
  beforeAll(() => {
    pool = createPostgresPool(process.env.TEST_DATABASE_URL as string);
    repository = new PostgresVacancyRepository(pool);
  });

  // Se ejecuta antes de CADA prueba: vacía las tablas, reinicia el contador de ids en 1 y crea la empresa
  beforeEach(async () => {
    await pool.query('TRUNCATE companies, vacancies RESTART IDENTITY CASCADE');
    await pool.query(
      `INSERT INTO companies (id, name, industry) VALUES ($1, $2, $3)`,
      ['empresa-1', 'Tech Andes', 'Tecnología'],
    );
  });

  // Se ejecuta UNA vez al final: cierra las conexiones para que Jest pueda terminar
  afterAll(async () => {
    await pool.end();
  });

  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a vacancy and assigns an id', async () => {
    const saved = await repository.save(sampleVacancy);

    // El salario vuelve como NÚMERO, gracias al mapeo del adaptador
    expect(saved).toEqual({ id: 1, ...withCompanyName });
  });

  it('assigns increasing ids and lists what was saved', async () => {
    await repository.save(sampleVacancy);
    const second = await repository.save(sampleVacancy);

    expect(second.id).toBe(2);
    expect(await repository.findAll()).toHaveLength(2);
  });

  it('finds a vacancy by id and returns undefined when it does not exist', async () => {
    const saved = await repository.save(sampleVacancy);

    expect(await repository.findById(saved.id)).toEqual(saved);
    expect(await repository.findById(999)).toBeUndefined();
  });

  it('updates an existing vacancy and keeps its id', async () => {
    const saved = await repository.save(sampleVacancy);

    const updated = await repository.update(saved.id, { ...sampleVacancy, salary: 1000 });

    expect(updated).toEqual({ id: saved.id, ...withCompanyName, salary: 1000 });
    expect(await repository.update(999, sampleVacancy)).toBeUndefined();
  });

  it('removes a vacancy and reports whether it existed', async () => {
    const saved = await repository.save(sampleVacancy);

    expect(await repository.remove(saved.id)).toBe(true);
    expect(await repository.findAll()).toEqual([]);
    expect(await repository.remove(saved.id)).toBe(false);
  });

  it('rejects a vacancy whose company does not exist', async () => {
    const unknownCompany = { ...sampleVacancy, companyId: 'no-existe' };

    await expect(repository.save(unknownCompany)).rejects.toThrow(new DomainError('La empresa indicada no existe'));

    const saved = await repository.save(sampleVacancy);
    await expect(repository.update(saved.id, unknownCompany)).rejects.toThrow(new DomainError('La empresa indicada no existe'));
  });
});
