import express , { NextFunction, Request, Response} from 'express';

const HTTP_STATUS ={
    ok:200,
    created:201,
    badRequest:400,
    notFound:404,
    internalServerError:500
} as const;

// Interface : definir la estructura de los objetos vacantes

interface Vacancy {
    id: number;
    title: string;
    company: string;
    modality: string;
    salary: number;
}

// Datos que se espera recibir desde el cliente 

type CreateVacancyInput = Omit <Vacancy, 'id'>;

// revisar lo datos de entrada desde el cliente 

const validateVacancy = (input: Partial<CreateVacancyInput>): string | null => {
  const { title, company, modality, salary } = input;

  if (typeof title !== 'string' || !title.trim() ||
      typeof company !== 'string' || !company.trim() ||
      typeof modality !== 'string' || !modality.trim()) {
    return 'El título, la empresa y la modalidad son obligatorios';
  }
  if (typeof salary !== 'number' || salary <= 0) {
    return 'El salario debe ser un número mayor que 0';
  }
  return null;
};

const app = express();

// middleware : convierte en json que llega en un objeto disponible en req.body
app.use(express.json());

// Datos de prueba en momoria
const vacancies: Vacancy[] = [
    {id: 1, title: 'Desarrollador Backend Jr', company: 'Tech Solutions', modality: 'Remoto', salary: 800},
    {id: 2, title: 'Analista de Datos', company: 'DataSur', modality: 'Hibrido', salary: 1200} 
]

let nextId = vacancies.length + 1;

// ruta Get / vacancies

app.get('/vacancies', (req, res) => {
    res.status(HTTP_STATUS.ok).json(vacancies);
});

// ruta post /vacancies

app.post('/vacancies', (req, res ) => {
    const input = req.body as CreateVacancyInput;

    const error = validateVacancy(input ?? {});

    if (error) {
        res.status(HTTP_STATUS.badRequest).json({ error });
        return;
    }

    // crear la vacante 
    const newVacancy: Vacancy = {
        id: nextId++,
        title: input.title.trim(),
        company: input.company.trim(),
        modality: input.modality.trim(),
        salary: input.salary
    }

    vacancies.push(newVacancy);

    res.status(HTTP_STATUS.created).json(newVacancy);
});

app.use((req, res) => {
    res.status(HTTP_STATUS.notFound).json({ error: 'Ruta no encontrada' });
});

// manejador de errores: Express lo reconoce porque tiene 4 parametros 

app.use((error: Error & {status?: number}, req: Request, res: Response, next: NextFunction) => {
    const status = error.status ?? HTTP_STATUS.internalServerError;

    if (status >= HTTP_STATUS.internalServerError) console.error(error);
    
    res.status(status).json({
        error: status < HTTP_STATUS.internalServerError ? 'La petecion no es valida' : 'Error interno del servidor',
        
    });
});

export default app;
