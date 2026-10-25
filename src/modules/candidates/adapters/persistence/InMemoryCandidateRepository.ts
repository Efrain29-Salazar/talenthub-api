import { Candidate, NewCandidate } from '../../domain/Candidate';
import { CandidateRepository } from '../../ports/CandidateRepository';

// Adaptador de salida: cumple el contrato CandidateRepository guardando los candidatos en un arreglo.
export class InMemoryCandidateRepository implements CandidateRepository {
  // La lista donde se guardan los candidatos. "private" = solo esta clase puede tocarla.
  private candidates: Candidate[];

  // El número que usará el próximo candidato. Solo sube, así que un id eliminado nunca se reutiliza.
  private nextId: number;

  constructor(initialCandidates: Candidate[] = []) {
    // Se copian los objetos para no depender del arreglo original.
    this.candidates = initialCandidates.map((candidate) => ({ ...candidate }));
    this.nextId = Math.max(0, ...initialCandidates.map((candidate) => candidate.id)) + 1;
  }

  // Devuelve COPIAS de la lista, para que nadie de afuera pueda modificar los datos originales.
  findAll = async (): Promise<Candidate[]> => this.candidates.map((candidate) => ({ ...candidate }));

  // Busca un candidato por id.
  findById = async (id: number): Promise<Candidate | undefined> => {
    const candidate = this.candidates.find((item) => item.id === id);

    // Si existe devuelve una copia; si no, undefined.
    return candidate ? { ...candidate } : undefined;
  };

  // Guarda un candidato nuevo.
  save = async (newCandidate: NewCandidate): Promise<Candidate> => {
    const candidate: Candidate = { id: this.nextId++, ...newCandidate };
    this.candidates.push(candidate);

    // Devuelve una copia, no el objeto guardado.
    return { ...candidate };
  };

  // Reemplaza los datos de un candidato existente.
  update = async (id: number, data: NewCandidate): Promise<Candidate | undefined> => {
    const index = this.candidates.findIndex((item) => item.id === id);

    // Si no existe, informa con undefined (el servicio decidirá qué significa).
    if (index === -1) {
      return undefined;
    }

    // Arma el candidato actualizado conservando el mismo id.
    const updated: Candidate = { id, ...data };
    this.candidates[index] = updated;

    return { ...updated };
  };

  // Elimina un candidato.
  remove = async (id: number): Promise<boolean> => {
    const index = this.candidates.findIndex((item) => item.id === id);

    // Si no existe, avisa con false.
    if (index === -1) {
      return false;
    }

    this.candidates.splice(index, 1);
    return true;
  };
}
