import { InMemoryVacancyRepository } from "./InMemoryVacancyRepository";

const sampleVacancy ={title: 'QA Tester', company: 'Tech Andes', modality: 'remoto', salary: 800};

describe('InMemoryVacancyRepository',() =>{
    it ('starts empty when no initial vacancies are given', async () =>{
        const repository = new InMemoryVacancyRepository ();

        expect(await repository.findAll()).toEqual([]);
    });

    it ('saves a vacancy and assigns an id', async() => {
        const repository = new InMemoryVacancyRepository ();

        const saved = await repository.save(sampleVacancy);

        expect (saved).toEqual({id: 1, ...sampleVacancy});
    });

    it ('assigns increasing ids and lists what was saved', async () =>{
        const repository = new InMemoryVacancyRepository();
        await repository.save (sampleVacancy);
        const second = await repository.save(sampleVacancy);

        expect (second.id).toBe(2);
        expect (await repository.findAll()).toHaveLength(2);
    });
})