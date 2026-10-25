import { Candidate, NewCandidate } from '../domain/Candidate';

// Contrato que debe cumplir CUALQUIER lugar donde se guarden candidatos.
export interface CandidateRepository {
  // Devuelve todos los candidatos.
  findAll: () => Promise<Candidate[]>;

  // Busca un candidato por su id. Devuelve el candidato o undefined si no existe.
  findById: (id: number) => Promise<Candidate | undefined>;

  // Guarda un candidato nuevo (sin id) y devuelve el candidato ya con su id.
  save: (newCandidate: NewCandidate) => Promise<Candidate>;

  // Reemplaza los datos de un candidato existente. Devuelve el candidato actualizado, o undefined si no existe.
  update: (id: number, data: NewCandidate) => Promise<Candidate | undefined>;

  // Elimina un candidato. Devuelve true si lo eliminó, o false si no existía.
  remove: (id: number) => Promise<boolean>;
}
