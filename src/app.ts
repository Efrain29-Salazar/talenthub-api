
import express ,{ NextFunction, Request, Response} from 'express';
import { error } from 'node:console';
import { title } from 'node:process';

const HTTP_STATUS ={
    OK:200,
    CREATED:201,
    BAD_REQUEST:400,
    NOT_FOUND:404,
    INTERNAL_SERVER_ERROR:500

} as const;

// interface: definir la estructura de los objetos vacantes
interface Vacancy{
    id:number;
    title: string;
    company: string;
    modality: string;
    salary: number;

}

// Datos que se espera recicibir desde el cliente
type CreateVacancyInput = Omit <Vacancy, 'id'>;


// Revisa los datos de entrada. Devuelve el mensaje de error, o null si todo está bien
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

const app = express ();

// Middware: convierte el Json que llega en un objeto disponible en req.body
app.use(express.json());

//Datos de pruebas en memoria
const vacancies: Vacancy [] = [
    { id: 1, title:'Desarrollador Backend Jr', company: 'Tech Andes', modality: 'remoto', salary: 800},
    { id: 2, title:'Analista de Datos', company: 'DataSur', modality: 'hibrido', salary: 1100}
]

let nextId = vacancies.length + 1;

// Ruta GET/vacancies
app.get('/vacancies', (req, res) => {
    res.status(HTTP_STATUS.OK).json(vacancies);


});

// Ruta POST/vacancies
app.post('/vacancies', (req, res) =>{
    const input = req.body as CreateVacancyInput;

    const error= validateVacancy(input ?? {});
    
    if(error){
        res.status(HTTP_STATUS.BAD_REQUEST).json({error});
        return;
    }

    // crear la vacante (objeto)
    const newVacancy: Vacancy ={
        id: nextId++,
        title: input.title.trim(),
        company: input.company.trim(),
        modality: input.modality.trim(),
        salary: input.salary

    }

    vacancies.push(newVacancy);

    res.status(HTTP_STATUS.CREATED).json(newVacancy);

});

app.use((req, res) =>{
    res.status(HTTP_STATUS.NOT_FOUND).json({error: 'Ruta no encontrada'});

});

// Manejador de errores : Express lo reconoce porque tiene 4 parametros
app.use((error: Error & {status?: number}, req: Request, res: Response, next: NextFunction) => {
    const status = error.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
    if(status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) console.error(error);

    res.status(status).json({
        error: status <HTTP_STATUS.INTERNAL_SERVER_ERROR ? 'La peticion no es validad': 'Error interno del servidor',

    });
});

export default app;




