import { Company, NewCompany } from "../domain/Company"

export interface CompanyRepository {
    finAll:()=> Promise<Company[]>;

    findById: (id: string) => Promise<Company | undefined>;

    save: (NewCompany: NewCompany) => Promise<Company>;
}