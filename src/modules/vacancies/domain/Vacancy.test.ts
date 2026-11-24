import { DomainError } from "../../../shared/DomainError";
import { parseNewVacancy } from "./Vacancy";

describe('parseNewVacancy', () =>{
    it('returns the vacancy data trimmed', ()=>{
        const result = parseNewVacancy ({title: 'QA Tester', companyId: 'empresa-1', modality: 'remoto', salary: 800});

        expect(result).toEqual({title: 'QA Tester', companyId: 'empresa-1', modality: 'remoto', salary: 800});
    });

    it ('throws when a required field is missing', () =>{
        expect (() => parseNewVacancy({companyId: 'Tech'})).toThrow(DomainError);
    });
    
    it ('throws when a salary is not a positive number', () =>{
        expect (() => parseNewVacancy({title: 'QA', companyId: 'empresa-1', modality: 'remoto', salary: 0})).toThrow(DomainError);
    });

})