import express from "express";
import cors from 'cors';

import { InMemoryVacancyRepository } from "./modules/vacancies/adapters/persistence/InMemoryVacancyRepository";
import { VacancyService } from "./modules/vacancies/application/VacancyService";
import { createVacancyRouter } from "./modules/vacancies/adapters/http/vacancyRoutes";
import { InMemoryCandidateRepository } from "./modules/candidates/adapters/persistence/InMemoryCandidateRepository";
import { CandidateService } from "./modules/candidates/application/CandidateService";
import { createCandidateRouter } from "./modules/candidates/adapters/http/candidateRoutes";
import { PostgresCandidateRepository } from "./modules/candidates/adapters/persistence/PostgresCandidateRepository";
import { PrismaCandidateRepository } from "./modules/candidates/adapters/persistence/PrismaCandidateRepository";
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
import { PrismaCompanyRepository } from "./modules/companies/adapters/persistence/PrismaCompanyRepository";
import { createPrismaClient } from "./shared/database/prismaClient";
import { PrismaVacancyRepository } from "./modules/vacancies/adapters/persistence/PrismaVacancyRepository";


const app = express();

//CORS: solo el origen del frontend puede leer las respuestas
//La dirreccion sale de cors_origin si no existe, se usa la de desarrollo de Vite
app.use(cors({origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173'}))

app.use(express.json());

const samplesVacancies = [
    {id: 1, title: 'Desarrollador Backend', companyId:'empresa-1', companyName: 'Tech Andes', modality: 'remoto', salary: 800},
    {id: 2, title: 'Analista de Datos', companyId:'empresa-2', companyName: 'DataSur', modality: 'híbrido', salary: 1200},
];

//Elige el repositorio de vancantes según las variables de entorno .evn
const createVacancyRepository = (): {name: string; repository: VacancyRepository} => {
    const databaseUrl = process.env.DATABASE_URL;

    //Sin DATABASE_URL -> lista en memoria
    if(!databaseUrl){
        return {name: 'in memory', repository: new InMemoryVacancyRepository(samplesVacancies)};
    }

    // Con VACANACIES_ADAPTER = prisma: PostgreSQL a través de Prisma
    if(process.env.VACANCIES_ADAPTER === 'prisma'){
        return {name: 'PostgreSQL with Prisma', repository: new PrismaVacancyRepository(createPrismaClient(databaseUrl)),};
    }

    //Por defecto: PostgreSQL puro
    return { name: 'PostgreSQL with pg', repository: new PostgresVacancyRepository(createPostgresPool(databaseUrl)),};
}

const {name: vacanciesAdapterName, repository: vacancyRepository} = createVacancyRepository();
console.log(`Vacancies persistence: ${vacanciesAdapterName}`);


const createCompanyRepository = () : {name: string; repository: CompanyRepository} => {
    const databaseUrl = process.env.DATABASE_URL;
    const mongodbUri = process.env.MONGODB_URI;

    if (process.env.COMPANIES_ADAPTER === 'prisma' && databaseUrl){
        return {name: 'PostgresSQL with Prisma', repository: new PrismaCompanyRepository(createPrismaClient(databaseUrl)),};
    };
    if(!mongodbUri){
        return {name: 'in memory', repository: new InMemoryCompanyRepository()};
    }
    // Por defecto: PostgresSQL puro
    return {name: 'Mongo DB', repository: new MongoCompanyRepository(createMongoClient(mongodbUri))};
}
const {name: companiesAdapterName, repository: companyRepository} = createCompanyRepository();
console.log(`Companies persistence: ${companiesAdapterName}`);
   

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

// Elige el repositorio de candidatos según las variables de entorno .env
const createCandidateRepository = (): {name: string; repository: CandidateRepository} => {
    const databaseUrl = process.env.DATABASE_URL;

    // Sin DATABASE_URL -> lista en memoria
    if(!databaseUrl){
        return {name: 'in memory', repository: new InMemoryCandidateRepository(sampleCandidates)};
    }

    // Con CANDIDATES_ADAPTER = prisma: PostgreSQL a través de Prisma
    if(process.env.CANDIDATES_ADAPTER === 'prisma'){
        return {name: 'PostgreSQL with Prisma', repository: new PrismaCandidateRepository(createPrismaClient(databaseUrl)),};
    }

    // Con CANDIDATES_ADAPTER = sql: PostgreSQL puro (pg)
    if(process.env.CANDIDATES_ADAPTER === 'sql'){
        return {name: 'PostgreSQL with pg', repository: new PostgresCandidateRepository(createPostgresPool(databaseUrl)),};
    }

    // Por defecto: lista en memoria
    return {name: 'in memory', repository: new InMemoryCandidateRepository(sampleCandidates)};
}

const {name: candidatesAdapterName, repository: candidateRepository} = createCandidateRepository();
console.log(`Candidates persistence: ${candidatesAdapterName}`);

//2) Servicio (casos de uso)
const candidateService = new CandidateService(candidateRepository);

//3) Rutas montadas bajo el prefijo /candidates
app.use('/candidates', createCandidateRouter(candidateService));

app.use(notFoundHandler);

app.use (errorHandler);

export default app;