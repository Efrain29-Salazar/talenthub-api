// Carga el .env para tener TEST_DATABASE_URL 
import 'dotenv/config';

import { PrismaClient } from '../../../../generated/prisma/client';
import { DomainError } from '../../../../shared/DomainError';
import { createPrismaClient } from '../../../../shared/database/prismaClient';
import { PrismaVacancyRepository } from './PrismaVacancyRepository';

// La base de pruebas debe existir y ser distinta de la de desarrollo.
if (!process.env.TEST_DATABASE_URL || process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL debe existir y ser distinta de DATABASE_URL');
}

// Datos de ejemplo - datos de prueba en español
// La vacante pertenece a una empresa que DEBE existir (clave foránea): se crea antes de cada prueba.
const sampleVacancy = { title: 'QA Tester', companyId: 'empresa-1', modality: 'remoto', salary: 800 };

// El repositorio también devuelve el nombre de la empresa, por eso se espera en los resultados.
const withCompanyName = { ...sampleVacancy, companyName: 'Tech Andes' };

describe('PrismaVacancyRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaVacancyRepository;

  // Una vez antes de todas las pruebas: abre la conexión a la base de PRUEBAS
  beforeAll(() => {
    prisma = createPrismaClient(process.env.TEST_DATABASE_URL as string);
    repository = new PrismaVacancyRepository(prisma);
  });

  // Antes de CADA prueba: vacía las tablas, reinicia el contador de ids en 1 y crea la empresa
  beforeEach(async () => {
    await prisma.$executeRawUnsafe('TRUNCATE companies, vacancies RESTART IDENTITY CASCADE');
    await prisma.company.create({ data: { id: 'empresa-1', name: 'Tech Andes', industry: 'Tecnología' } });
  });

  // Una vez al final: cierra la conexión para que Jest pueda terminar.
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('starts empty', async () => {
    expect(await repository.findAll()).toEqual([]);
  });

  it('saves a vacancy and assigns an id', async () => {
    const saved = await repository.save(sampleVacancy);

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
