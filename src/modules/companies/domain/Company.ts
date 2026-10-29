import { DomainError } from "../../../shared/DomainError";

// Objetos de location
export interface CompanyLocation{
    city: string;

}

//Objetos de la empresa
export interface Company{
    id: string;
    name: string;
    industry: string;
    benefits: string[];
    socialLinks: Record<string, string>;
    locations: CompanyLocation[];
}

export type NewCompany = Omit<Company, 'id'>;

// si un valor es un texto que no esta vacio 
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim() !=='';

const parseBenefits = (value: unknown): string [] =>{
    if (value === undefined) {
        return [];
    }
    if (!Array.isArray(value) || !value.every(isNonEmptyString)){
        throw new DomainError('Los beneficios deben ser una lista de textos');
    }
    return value.map((benefit) => benefit.trim());
};
// Las redes sociales vemga en objetos cuyos valores son enlances de texto
const parseSocialLinks = (value: unknown): Record<string, string> =>{
    if (value === undefined){
        return{};
    }

    if (typeof value !== 'object' || value === null || Array.isArray(value) || !Object.values(value).every(isNonEmptyString)){
        throw new DomainError("Las redes sociales deben ser un objeto con enlaces de texto");

    }
    return value as Record<string, string>;
};

// los lugares sean una lista de objetos y cada uno con una cuidad.
const parseLocation = (value: unknown): CompanyLocation[] =>{
    if (value === undefined){
        return [];
    }
    const isValid = Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null && isNonEmptyString((item as {city?: unknown }).city));
    if (!isValid){
        throw new DomainError("Cada sede debe tener al menos una ciudad");

    }
    return (value as CompanyLocation[]).map((location) => ({city: location.city.trim()}));
};

// Valida datos "crudos" y devuelve una compania nueva limpia.
export const parseNewCompany = (input: unknown): NewCompany =>{
    const {name, industry, benefits, socialLinks, locations} = (input ?? {}) as Record<string, unknown>;

    // Regla: nombre y sector son obligatorios
    if (!isNonEmptyString(name) || !isNonEmptyString(industry)){
        throw new DomainError("El nombre y el sector son obligatorios");
    }
    return {
        name: name.trim(),
        industry: industry.trim(),
        benefits: parseBenefits(benefits),
        socialLinks: parseSocialLinks(socialLinks),
        locations: parseLocation(locations)
    };
};