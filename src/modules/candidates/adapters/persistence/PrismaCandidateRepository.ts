// El tipo del cliente de Prisma. "../../../../" sube cuatro carpetas hasta src.
import { PrismaClient } from '../../../../generated/prisma/client';

// Tipos del dominio y el contrato que vamos a cumplir.
import { Candidate, NewCandidate } from '../../domain/Candidate';
import { CandidateRepository } from '../../ports/CandidateRepository';

// Cómo llega un registro desde Prisma. experienceYears llega como Decimal (no como número).
type CandidateRecord = {
  id: number;
  name: string;
  email: string;
  city: string;
  experienceYears: { toNumber: () => number };
  skills: string[];
};

// Mapeo: convierte un registro de Prisma en un Candidate del dominio (el Decimal pasa a número).
const toCandidate = (record: CandidateRecord): Candidate => ({
  id: record.id,
  name: record.name,
  email: record.email,
  city: record.city,
  experienceYears: record.experienceYears.toNumber(),
  skills: record.skills,
});

// Prisma lanza el error P2025 al editar o eliminar algo que no existe.
const isRecordNotFound = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2025';

// Adaptador de salida: cumple el mismo contrato que el de pg, pero con Prisma y PostgreSQL.
export class PrismaCandidateRepository implements CandidateRepository {
  // Recibe el cliente de Prisma desde afuera (inyección de dependencias).
  constructor(private readonly prisma: PrismaClient) {}

  // Lista de candidatos.
  findAll = async (): Promise<Candidate[]> => {
    const records = await this.prisma.candidate.findMany({ orderBy: { id: 'asc' } });

    return records.map(toCandidate);
  };

  // Busca un candidato por id. Si no existe, Prisma devuelve null.
  findById = async (id: number): Promise<Candidate | undefined> => {
    const record = await this.prisma.candidate.findUnique({ where: { id } });

    return record ? toCandidate(record) : undefined;
  };

  // Guarda un candidato nuevo.
  save = async (newCandidate: NewCandidate): Promise<Candidate> => {
    const record = await this.prisma.candidate.create({ data: newCandidate });

    return toCandidate(record);
  };

  // Reemplaza los datos de un candidato existente. Devuelve undefined si no existe.
  update = async (id: number, data: NewCandidate): Promise<Candidate | undefined> => {
    try {
      const record = await this.prisma.candidate.update({ where: { id }, data });

      return toCandidate(record);
    } catch (error) {
      if (isRecordNotFound(error)) {
        return undefined;
      }
      throw error; // Cualquier otro error
    }
  };

  // Elimina un candidato. Devuelve true si lo eliminó, false si no existía.
  remove = async (id: number): Promise<boolean> => {
    try {
      await this.prisma.candidate.delete({ where: { id } });

      return true;
    } catch (error) {
      if (isRecordNotFound(error)) {
        return false;
      }
      throw error; // Cualquier otro error
    }
  };
}
