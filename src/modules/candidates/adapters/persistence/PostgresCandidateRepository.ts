import { Pool } from 'pg';

import { Candidate, NewCandidate } from '../../domain/Candidate';
import { CandidateRepository } from '../../ports/CandidateRepository';

// Cómo llega una fila desde la base de datos.
type CandidateRow = {
  id: number;
  name: string;
  email: string;
  city: string;
  experience_years: string; 
  skills: string[]; 
};

// Columnas
const COLUMNS = 'id, name, email, city, experience_years, skills';

// Traduce una fila de la base
const toCandidate = (row: CandidateRow): Candidate => ({
  id: row.id,
  name: row.name,
  email: row.email,
  city: row.city,
  experienceYears: Number(row.experience_years),
  skills: row.skills,
});

// Adaptador de salida: cumple el contrato CandidateRepository guardando los candidatos en PostgreSQL.
export class PostgresCandidateRepository implements CandidateRepository {
  constructor(private readonly pool: Pool) {}

  // Lista de candidatos.
  findAll = async (): Promise<Candidate[]> => {
    const result = await this.pool.query<CandidateRow>(`SELECT ${COLUMNS} FROM candidates ORDER BY id`);

    return result.rows.map(toCandidate);
  };

  // Busca un candidato por id.
  findById = async (id: number): Promise<Candidate | undefined> => {
    const result = await this.pool.query<CandidateRow>(`SELECT ${COLUMNS} FROM candidates WHERE id = $1`, [id]);

    return result.rows[0] ? toCandidate(result.rows[0]) : undefined;
  };

  // Guarda un candidato nuevo (consulta con parámetros $1, $2...).
  save = async (newCandidate: NewCandidate): Promise<Candidate> => {
    const result = await this.pool.query<CandidateRow>(
      `INSERT INTO candidates (name, email, city, experience_years, skills)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${COLUMNS}`,
      [newCandidate.name, newCandidate.email, newCandidate.city, newCandidate.experienceYears, newCandidate.skills],
    );

    return toCandidate(result.rows[0]);
  };

  // Reemplaza los datos de un candidato existente. Devuelve undefined si no existe.
  update = async (id: number, data: NewCandidate): Promise<Candidate | undefined> => {
    const result = await this.pool.query<CandidateRow>(
      `UPDATE candidates
       SET name = $1, email = $2, city = $3, experience_years = $4, skills = $5
       WHERE id = $6
       RETURNING ${COLUMNS}`,
      [data.name, data.email, data.city, data.experienceYears, data.skills, id],
    );

    return result.rows[0] ? toCandidate(result.rows[0]) : undefined;
  };

  // Elimina un candidato. Devuelve true si lo eliminó, false si no existía.
  remove = async (id: number): Promise<boolean> => {
    const result = await this.pool.query('DELETE FROM candidates WHERE id = $1', [id]);

    return (result.rowCount ?? 0) > 0;
  };
}
