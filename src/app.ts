import express from "express";

import { InMemoryVacancyRepository } from "./modules/vacancies/adapters/persistence/InMemoryVacancyRepository";
import { VacancyService } from "./modules/vacancies/application/VacancyService";
import { createVacancyRouter } from "./modules/vacancies/adapters/http/vacancyRoutes";
import { errorHandler, notFoundHandler } from "./shared/httpErrorHandlers";

const app = express();

app.use(express.json());

//1) Repositorio donde se guardan las vacantes
const vacancyRepository = new InMemoryVacancyRepository([
    {id: 1, title: 'Desarrollador Backend', company:'Tech Andes', modality:'remoto', salary: 800},
    {id: 1, title: 'Analista de Datos', company:'DataSur', modality:'hibrido', salary: 1200},

]);

//2) Servicio (caso de uso)
const vacancyService = new VacancyService(vacancyRepository);

//3) Rutas: se le entrega el servicio y se monta bajo el prefijo / vacancies
app.use('/vacancies', createVacancyRouter(vacancyService));

app.use(notFoundHandler);

app.use (errorHandler);

export default app;