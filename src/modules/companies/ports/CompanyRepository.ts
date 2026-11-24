import { Company, NewCompany } from "../domain/Company"

export interface CompanyRepository {
    findAll:()=> Promise<Company[]>;

    findById: (id: string) => Promise<Company | undefined>;

    save: (NewCompany: NewCompany) => Promise<Company>;
}