import { PrismaClient } from "../../../../generated/prisma/client";
import { DomainError } from "../../../../shared/DomainError";
import { NewVacancy, Vacancy } from "../../domain/Vacancy";
import { VacancyRepository } from "../../ports/VacancyRepository";

// como llega un registro desde prisma (con la empresa incluida por el "include")
type VacancyRecord = {
    id: number;
    title: string;
    companyId: string;
    company: { name: string };
    modality: string;
    salary: { toNumber: () => number }
}

// Pide a Prisma que traiga también el nombre de la empresa (equivale al JOIN)
const withCompanyNames = { company: { select: { name: true } } } as const;

// Mapeo: convierte un registro de Prisma en un objeto Vacancy del dominio
const toVacancy = (record: VacancyRecord): Vacancy => ({
    id: record.id,
    title: record.title,
    companyId: record.companyId,
    companyName: record.company.name,
    modality: record.modality,
    salary: record.salary.toNumber(),
});

const isRecordNotFound = (error: unknown): boolean =>
    typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2025';

// Prisma lanza el error P2003 cuando la clave foránea apunta a una empresa que no existe
const isForeignKeyViolation = (error: unknown): boolean =>
    typeof error === 'object' && error !== null && (error as { code?: string }).code === 'P2003';

const COMPANY_NOT_FOUND_MESSAGE = 'La empresa indicada no existe';

export class PrismaVacancyRepository implements VacancyRepository{
    constructor (private readonly prisma: PrismaClient){}

    findAll = async (): Promise<Vacancy[]> => {
        const records = await this.prisma.vacancy.findMany({ orderBy: { id: 'asc' }, include: withCompanyNames });
        return records.map(toVacancy);
    }

    // Busca una vacante por id
    findById = async (id: number): Promise<Vacancy | undefined> => {
        const record = await this.prisma.vacancy.findUnique({ where: { id }, include: withCompanyNames });
        return record ? toVacancy(record) : undefined;
    }

    // Guardar una vacante
    save = async (newVacancy: NewVacancy): Promise<Vacancy> => {
        try {
            const record = await this.prisma.vacancy.create({ data: newVacancy, include: withCompanyNames });
            return toVacancy(record);
        } catch (error) {
            if (isForeignKeyViolation(error)) {
                throw new DomainError(COMPANY_NOT_FOUND_MESSAGE);
            }
            throw error; // Cualquier otro error
        }
    }

    // Modificar los datos de una vacante
    update = async (id: number, data: NewVacancy): Promise<Vacancy | undefined> => {
        try {
            const record = await this.prisma.vacancy.update({ where: { id }, data, include: withCompanyNames });
            return toVacancy(record);
        } catch (error) {
            if (isRecordNotFound(error)){
                return undefined;
            }
            if (isForeignKeyViolation(error)) {
                throw new DomainError(COMPANY_NOT_FOUND_MESSAGE);
            }
            throw error; // Cualquier otro error
        }
    }

    remove = async (id: number): Promise<boolean> => {
        try {
            await this.prisma.vacancy.delete({ where: { id } });
            return true;
        } catch (error) {
            if (isRecordNotFound(error)){
                return false;
            }
            throw error; // Cualquier otro error
        }
    };
}
