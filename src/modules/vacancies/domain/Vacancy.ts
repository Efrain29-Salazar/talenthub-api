import { DomainError } from "../../../shared/DomainError";

// interface: definir la estructura de los objetos vacantes
 export interface Vacancy{
    id:number;
    title: string;
    companyId: string; // clave foranea a la tabla de companias
    modality: string;
    salary: number;
    companyName?: string; // JOIN

}

// Una nueva vacante: Datos que se espera recibir desde el cliente
export type NewVacancy = Omit <Vacancy, 'id' | 'companyName'>;

export const parseNewVacancy = (input: unknown): NewVacancy =>{
    const {title, companyId, modality, salary} = (input ?? {}) as Record<string, unknown>;

    // Regla 1
    if (typeof title !== 'string' || !title.trim() ||
      typeof companyId !== 'string' || !companyId.trim() ||
      typeof modality !== 'string' || !modality.trim()) {
        throw new DomainError('El titulo, la empresa y la modalidad son obligatorios');

  }
  // Regla 2
  if (typeof salary !== 'number' || salary <= 0) {
    throw new DomainError ('El salario debe ser un número mayor que 0');
  }
  // Devuelve datos Limpios

  return {title: title.trim(), companyId: companyId.trim(), modality:modality.trim(), salary: salary};
  

};