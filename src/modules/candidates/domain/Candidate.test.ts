import { DomainError } from '../../../shared/DomainError';
import { parseNewCandidate } from './Candidate';

// Datos de ejemplo válidos (datos de prueba en español).
const validInput = { name: 'María Pérez', email: 'maria@correo.com', city: 'Quito', experienceYears: 3, skills: ['TypeScript', 'SQL'] };

describe('parseNewCandidate', () => {
  it('returns the candidate data trimmed', () => {
    const result = parseNewCandidate({ ...validInput, name: '  María Pérez  ', city: ' Quito ', skills: [' TypeScript ', 'SQL'] });

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

  it('uses an empty list as the default value for skills', () => {
    const { skills, ...withoutSkills } = validInput;

    expect(parseNewCandidate(withoutSkills).skills).toEqual([]);
  });

  it('accepts a valid list of skills', () => {
    expect(parseNewCandidate({ ...validInput, skills: ['Node.js', 'PostgreSQL'] }).skills).toEqual(['Node.js', 'PostgreSQL']);
  });

  it('throws when skills is not a list of non-empty texts', () => {
    const message = 'Las habilidades deben ser una lista de textos';

    expect(() => parseNewCandidate({ ...validInput, skills: 'TypeScript' })).toThrow(new DomainError(message));
    expect(() => parseNewCandidate({ ...validInput, skills: ['TypeScript', 5] })).toThrow(new DomainError(message));
    expect(() => parseNewCandidate({ ...validInput, skills: ['TypeScript', '  '] })).toThrow(new DomainError(message));
  });
});
