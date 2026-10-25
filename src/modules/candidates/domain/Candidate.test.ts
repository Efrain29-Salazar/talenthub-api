import { DomainError } from '../../../shared/DomainError';
import { parseNewCandidate } from './Candidate';

// Datos de ejemplo válidos (datos de prueba en español).
const validInput = { name: 'María Pérez', email: 'maria@correo.com', city: 'Quito', experienceYears: 3 };

describe('parseNewCandidate', () => {
  it('returns the candidate data trimmed', () => {
    const result = parseNewCandidate({ ...validInput, name: '  María Pérez  ', city: ' Quito ' });

    expect(result).toEqual(validInput);
  });

  it('throws when name or email are missing', () => {
    expect(() => parseNewCandidate({ city: 'Quito', experienceYears: 3 })).toThrow(
      new DomainError('El nombre y el correo son obligatorios'),
    );
  });

  it('throws when the email format is not valid', () => {
    expect(() => parseNewCandidate({ ...validInput, email: 'correo-sin-arroba' })).toThrow(
      new DomainError('El correo no tiene un formato válido'),
    );
  });

  it('throws when the city is missing', () => {
    expect(() => parseNewCandidate({ ...validInput, city: '' })).toThrow(
      new DomainError('La ciudad es obligatoria'),
    );
  });

  it('throws when experienceYears is not a number equal or greater than 0', () => {
    const message = 'Los años de experiencia deben ser un número igual o mayor que 0';

    expect(() => parseNewCandidate({ ...validInput, experienceYears: -1 })).toThrow(new DomainError(message));
    expect(() => parseNewCandidate({ ...validInput, experienceYears: '3' })).toThrow(new DomainError(message));
    expect(parseNewCandidate({ ...validInput, experienceYears: 0 }).experienceYears).toBe(0);
  });
});
