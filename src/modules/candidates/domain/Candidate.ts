import { DomainError } from '../../../shared/DomainError';

// interface: define la estructura de un candidato.
export interface Candidate {
  id: number;
  name: string;
  email: string;
  city: string;
  experienceYears: number;
}

// Datos que se esperan recibir desde el cliente (todo menos el id, que lo asigna el repositorio).
export type NewCandidate = Omit<Candidate, 'id'>;

// Formato básico de correo: algo@dominio.ext (sin espacios).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valida los datos de entrada y devuelve un candidato limpio. Se usa para crear y para editar.
export const parseNewCandidate = (input: unknown): NewCandidate => {
  const { name, email, city, experienceYears } = (input ?? {}) as Record<string, unknown>;

  // Regla 1: el nombre y el correo son obligatorios.
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.trim()) {
    throw new DomainError('El nombre y el correo son obligatorios');
  }

  // Regla 2: el correo debe tener un formato válido.
  if (!EMAIL_PATTERN.test(email.trim())) {
    throw new DomainError('El correo no tiene un formato válido');
  }

  // Regla 3: la ciudad es obligatoria.
  if (typeof city !== 'string' || !city.trim()) {
    throw new DomainError('La ciudad es obligatoria');
  }

  // Regla 4: los años de experiencia deben ser un número igual o mayor que 0.
  if (typeof experienceYears !== 'number' || !Number.isFinite(experienceYears) || experienceYears < 0) {
    throw new DomainError('Los años de experiencia deben ser un número igual o mayor que 0');
  }

  // Devuelve los datos limpios (sin espacios sobrantes).
  return { name: name.trim(), email: email.trim(), city: city.trim(), experienceYears };
};
