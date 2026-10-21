import { NewVacancy, Vacancy } from "../../domain/Vacancy";
import { VacancyRepository } from "../../ports/VacancyRepository";

export class InMemoryVacancyRepository implements VacancyRepository {
    private vacancies: Vacancy[];

    private nextId: number;

    constructor (initialVacancies: Vacancy[] = []){
        this.vacancies = [...initialVacancies];
        this.nextId= initialVacancies.length + 1;
    }
    findAll = async (): Promise<Vacancy[]> =>[...this.vacancies]; 

    save = async (newVacancy: NewVacancy): Promise<Vacancy> =>{
        const vacancy: Vacancy = {id: this.nextId++, ...newVacancy};

        this.vacancies.push(vacancy);
        return vacancy;
    };
}
