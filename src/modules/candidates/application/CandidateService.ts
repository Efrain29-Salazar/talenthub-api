// Error que se lanza cuando el recurso pedido no existe. El manejador de errores lo convertirá en 404.
import { NotFoundError } from '../../../shared/NotFoundError';

// Del dominio: la regla de validación y el tipo Candidate.
import { Candidate, parseNewCandidate } from '../domain/Candidate';

// El contrato (puerto). El servicio solo conoce el contrato, no dónde se guardan realmente los datos.
import { CandidateRepository } from '../ports/CandidateRepository';

// Mensaje para el usuario (en español). Se define una vez para no repetirlo.
const CANDIDATE_NOT_FOUND_MESSAGE = 'Candidato no encontrado';

// Un "servicio" agrupa los casos de uso relacionados con candidatos.
export class CandidateService {
  // Recibe el repositorio desde afuera (inyección de dependencias).
  constructor(private readonly repository: CandidateRepository) {}

  // CASO DE USO 1: listar todos los candidatos.
  list = async (): Promise<Candidate[]> => this.repository.findAll();

  // CASO DE USO 2: obtener un candidato por su id.
  getById = async (id: number): Promise<Candidate> => {
    const candidate = await this.repository.findById(id);

    // Si no existe, se lanza NotFoundError (→ 404).
    if (!candidate) {
      throw new NotFoundError(CANDIDATE_NOT_FOUND_MESSAGE);
    }

    return candidate;
  };

  // CASO DE USO 3: crear un candidato.
  create = async (input: unknown): Promise<Candidate> => {
    // El dominio valida. Si hay un error, lanza DomainError y aquí se detiene.
    const newCandidate = parseNewCandidate(input);

    return this.repository.save(newCandidate);
  };

  // CASO DE USO 4: editar un candidato existente.
  update = async (id: number, input: unknown): Promise<Candidate> => {
    // 1) Se validan los datos nuevos (mismas reglas que al crear).
    const data = parseNewCandidate(input);

    // 2) Se le pide al repositorio que actualice.
    const updated = await this.repository.update(id, data);

    // 3) Si no existía ningún candidato con ese id, es un 404.
    if (!updated) {
      throw new NotFoundError(CANDIDATE_NOT_FOUND_MESSAGE);
    }

    return updated;
  };

  // CASO DE USO 5: eliminar un candidato.
  remove = async (id: number): Promise<void> => {
    const removed = await this.repository.remove(id);

    if (!removed) {
      throw new NotFoundError(CANDIDATE_NOT_FOUND_MESSAGE);
    }
  };
}
