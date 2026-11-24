import { Pool } from "pg";

import { DomainError } from "../../../../shared/DomainError";
import { NewVacancy, Vacancy } from "../../domain/Vacancy";
import { VacancyRepository } from "../../ports/VacancyRepository";

// Como llega una fila desde la base de datos (columnas con guion bajo; company_name viene del JOIN)
type VacancyRow = {
    id: number;
    title: string;
    company_id: string;
    company_name: string;
    modality: string;
    salary: string;
}

// SELECT con JOIN: trae la vacante y el nombre de su empresa desde la tabla companies
const SELECT_WITH_COMPANY = `
    SELECT v.id, v.title, v.company_id, c.name AS company_name, v.modality, v.salary
    FROM vacancies v
    JOIN companies c ON c.id = v.company_id`;

// Traduce una fila de la base (company_id, company_name) al objeto del dominio (companyId, companyName)
const toVacancy = (row: VacancyRow): Vacancy => ({
    id: row.id,
    title: row.title,
    companyId: row.company_id,
    companyName: row.company_name,
    modality: row.modality,
    salary: Number(row.salary)
});

// PostgreSQL lanza el error 23503 cuando la clave foránea apunta a una empresa que no existe
const isForeignKeyViolation = (error: unknown): boolean =>
    typeof error === 'object' && error !== null && (error as { code?: string }).code === '23503';

const COMPANY_NOT_FOUND_MESSAGE = 'La empresa indicada no existe';

export class PostgresVacancyRepository implements VacancyRepository{
    constructor(private readonly pool: Pool){}

    //Lista de vacantes.
    findAll = async (): Promise<Vacancy[]> => {
        const result = await this.pool.query<VacancyRow>(`${SELECT_WITH_COMPANY} ORDER BY v.id`);
        return result.rows.map(toVacancy);
    }

    //Busca una vancante por id.
    findById = async (id: number): Promise<Vacancy | undefined> => {
        const result = await this.pool.query<VacancyRow>(`${SELECT_WITH_COMPANY} WHERE v.id = $1`, [id]);
        return result.rows[0] ? toVacancy(result.rows[0]) : undefined;
    }

    //Guardar una vacante (el INSERT no devuelve el nombre de la empresa: se vuelve a consultar con el JOIN)
    save = async (newVacancy: NewVacancy): Promise<Vacancy> => {
        let inserted;
        try {
            inserted = await this.pool.query<{ id: number }>(
                `INSERT INTO vacancies (title, company_id, modality, salary)
                VALUES($1, $2, $3, $4)
                RETURNING id`,
                [newVacancy.title, newVacancy.companyId, newVacancy.modality, newVacancy.salary],
            );
        } catch (error) {
            if (isForeignKeyViolation(error)) {
                throw new DomainError(COMPANY_NOT_FOUND_MESSAGE);
            }
            throw error; // Cualquier otro error
        }
        const result = await this.pool.query<VacancyRow>(`${SELECT_WITH_COMPANY} WHERE v.id = $1`, [inserted.rows[0].id]);
        return toVacancy(result.rows[0]);
    };

    //Actualizar los datos de una vacante.
    update = async (id: number, data: NewVacancy): Promise<Vacancy | undefined> => {
        let updated;
        try {
            updated = await this.pool.query<{ id: number }>(
                `UPDATE vacancies
                SET title = $1, company_id = $2, modality = $3, salary = $4
                WHERE id = $5
                RETURNING id`,
                [data.title, data.companyId, data.modality, data.salary, id],
            );
        } catch (error) {
            if (isForeignKeyViolation(error)) {
                throw new DomainError(COMPANY_NOT_FOUND_MESSAGE);
            }
            throw error; // Cualquier otro error
        }
        if (updated.rows.length === 0) {
            return undefined;
        }
        const result = await this.pool.query<VacancyRow>(`${SELECT_WITH_COMPANY} WHERE v.id = $1`, [id]);
        return toVacancy(result.rows[0]);
    };

    //Eliminar una vacante.
    remove = async (id: number): Promise<boolean> => {
        const result = await this.pool.query(`DELETE FROM vacancies WHERE id = $1`, [id]);
        return (result.rowCount ?? 0) > 0;
    };
}
