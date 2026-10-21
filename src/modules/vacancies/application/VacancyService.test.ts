import { DomainError } from "../../../shared/DomainError";
import { InMemoryVacancyRepository } from "../adapters/persistence/InMemoryVacancyRepository";
import { VacancyService } from "./VacancyService";

// Datos de ejemplo validos
const validInput = {title: 'QA Tester', company: 'Tech Andes', modality: 'remoto', salary: 800};

describe ('VacancyService', () =>{
    it ('creates a valid vacancy and returns it with an id', async () =>{
        const service = new VacancyService(new InMemoryVacancyRepository());

        const creadted = await service.create(validInput);

        expect (creadted).toEqual({id: 1, ...validInput});
    });
    it ('rejects an invalid vacancy and does not save it', async() =>{
        const service = new VacancyService(new InMemoryVacancyRepository());

        await expect(service.create({company: 'Tech Andes'})).rejects.toThrow(DomainError);

        expect(await service.list()).toEqual([]);
    });

    it('List the vacancies that were created', async () =>{
        const service = new VacancyService(new InMemoryVacancyRepository());

        await service.create(validInput);

        expect(await service.list()).toHaveLength(1);
    });
})