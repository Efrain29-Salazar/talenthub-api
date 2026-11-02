import express from "express";

import { InMemoryVacancyRepository } from "./modules/vacancies/adapters/persistence/InMemoryVacancyRepository";
import { VacancyService } from "./modules/vacancies/application/VacancyService";
import { createVacancyRouter } from "./modules/vacancies/adapters/http/vacancyRoutes";
import { InMemoryCandidateRepository } from "./modules/candidates/adapters/persistence/InMemoryCandidateRepository";
import { CandidateService } from "./modules/candidates/application/CandidateService";
import { createCandidateRouter } from "./modules/candidates/adapters/http/candidateRoutes";
import { PostgresCandidateRepository } from "./modules/candidates/adapters/persistence/PostgresCandidateRepository";
import { CandidateRepository } from "./modules/candidates/ports/CandidateRepository";
import { errorHandler, notFoundHandler } from "./shared/httpErrorHandlers";
import { PostgresVacancyRepository } from "./modules/vacancies/adapters/persistence/PostgresVacancyRepository";
import { VacancyRepository } from "./modules/vacancies/ports/VacancyRepository";
import { createPostgresPool } from  "./shared/database/postgresPool";
import { createCompanyRouter } from "./modules/companies/adapters/http/companyRoutes";
import { InMemoryCompanyRepository } from "./modules/companies/adapters/persistence/InMemoryCompanyRepository";
import { CompanyService } from "./modules/companies/application/CompanyService";
import { CompanyRepository } from "./modules/companies/ports/CompanyRepository";
import { MongoCompanyRepository } from "./modules/companies/adapters/persistence/MongoCompanyRepository";
import { createMongoClient } from "./shared/database/mongoClient";


const app = express();

app.use(express.json());

const sampleVacancies = [
    {id: 1, title: 'Desarrollador Backend', company:'Tech Andes', modality:'remoto', salary: 800},
    {id: 2, title: 'Analista de Datos', company:'DataSur', modality:'hibrido', salary: 1200},

];
//Repositorio: Guardando las vacantes
const vacancyRepository: VacancyRepository = process.env.DATABASE_URL
? new PostgresVacancyRepository(createPostgresPool(process.env.DATABASE_URL))
: new InMemoryVacancyRepository(sampleVacancies);
console.log(`Vacancies persistences: ${process.env.DATABASE_URL ? 'PostgresSQL' : 'In memory'}`);

// Repositorio: Guardar las companias
const companyRepository: CompanyRepository = process.env.MONGODB_URI
    ? new MongoCompanyRepository(createMongoClient(process.env.MONGODB_URI))
    : new InMemoryCompanyRepository();
console.log(`Companies persistences: ${process.env.MONGODB_URI ? 'MongoDB' : 'In memory'}`);    

//2) Servicio (caso de uso)
const vacancyService = new VacancyService(vacancyRepository);
const companyService = new CompanyService(companyRepository);

//3) Rutas: se le entrega el servicio y se monta bajo el prefijo / vacancies
app.use('/vacancies', createVacancyRouter(vacancyService));
app.use('/companies', createCompanyRouter(companyService));

// --- Módulo Candidates (misma estructura hexagonal que Vacancies) ---

// Datos de ejemplo para el repositorio en memoria
const sampleCandidates = [
    {id: 1, name: 'María Pérez', email: 'maria.perez@correo.com', city: 'Quito', experienceYears: 3, skills: ['TypeScript', 'SQL']},
    {id: 2, name: 'Carlos Andrade', email: 'carlos.andrade@correo.com', city: 'Guayaquil', experienceYears: 5, skills: ['Java', 'Docker']},
];

// Elige el repositorio de candidatos según las variables de entorno (.env)
const createCandidateRepository = (): { name: string; repository: CandidateRepository } => {
    const databaseUrl = process.env.DATABASE_URL;

    // con CANDIDATES_ADAPTER = sql y DATABASE_URL: PostgreSQL con pg (SQL escrito a mano)
    if (process.env.CANDIDATES_ADAPTER === 'sql' && databaseUrl) {
        return { name: 'PostgreSQL with pg', repository: new PostgresCandidateRepository(createPostgresPool(databaseUrl)) };
    }

    // por defecto: lista en memoria
    return { name: 'in memory', repository: new InMemoryCandidateRepository(sampleCandidates) };
};

//1) Repositorio donde se guardan los candidatos
const candidatePersistence = createCandidateRepository();
console.log(`Candidates persistence: ${candidatePersistence.name}`);
const candidateRepository: CandidateRepository = candidatePersistence.repository;

//2) Servicio (casos de uso)
const candidateService = new CandidateService(candidateRepository);

//3) Rutas montadas bajo el prefijo /candidates
app.use('/candidates', createCandidateRouter(candidateService));

app.use(notFoundHandler);

app.use (errorHandler);

export default app;