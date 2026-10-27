import express from "express";

import { InMemoryVacancyRepository } from "./modules/vacancies/adapters/persistence/InMemoryVacancyRepository";
import { VacancyService } from "./modules/vacancies/application/VacancyService";
import { createVacancyRouter } from "./modules/vacancies/adapters/http/vacancyRoutes";
import { InMemoryCandidateRepository } from "./modules/candidates/adapters/persistence/InMemoryCandidateRepository";
import { CandidateService } from "./modules/candidates/application/CandidateService";
import { createCandidateRouter } from "./modules/candidates/adapters/http/candidateRoutes";
import { errorHandler, notFoundHandler } from "./shared/httpErrorHandlers";
import { PostgresVacancyRepository } from "./modules/vacancies/adapters/persistence/PostgresVacancyRepository";
import { VacancyRepository } from "./modules/vacancies/ports/VacancyRepository";
import { createPostgresPool } from  "./shared/database/postgresPool";

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

//2) Servicio (caso de uso)
const vacancyService = new VacancyService(vacancyRepository);

//3) Rutas: se le entrega el servicio y se monta bajo el prefijo / vacancies
app.use('/vacancies', createVacancyRouter(vacancyService));

// --- Módulo Candidates (misma estructura hexagonal que Vacancies) ---

//1) Repositorio donde se guardan los candidatos
const candidateRepository = new InMemoryCandidateRepository([
    {id: 1, name: 'María Pérez', email: 'maria.perez@correo.com', city: 'Quito', experienceYears: 3},
    {id: 2, name: 'Carlos Andrade', email: 'carlos.andrade@correo.com', city: 'Guayaquil', experienceYears: 5},
]);

//2) Servicio (casos de uso)
const candidateService = new CandidateService(candidateRepository);

//3) Rutas montadas bajo el prefijo /candidates
app.use('/candidates', createCandidateRouter(candidateService));

app.use(notFoundHandler);

app.use (errorHandler);

export default app;