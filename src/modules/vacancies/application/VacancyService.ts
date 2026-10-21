import { parseNewVacancy, Vacancy } from "../domain/Vacancy";

import { VacancyRepository } from "../ports/VacancyRepository";

export class VacancyService {
    constructor (private readonly repository: VacancyRepository){}

    // CASO 1: Listar vacantes
    list = async (): Promise<Vacancy[]> => this.repository.findAll();

    // CASO 2: crear una vacante.
    create = async (input: unknown): Promise<Vacancy> =>{
        const newVacancy = parseNewVacancy (input);
        return this.repository.save(newVacancy);
    }
}