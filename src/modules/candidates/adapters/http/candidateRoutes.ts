import { Router } from 'express';

import { DomainError } from '../../../../shared/DomainError';
import { HTTP_STATUS } from '../../../../shared/httpStatus';

import { CandidateService } from '../../application/CandidateService';

// Convierte el id que llega como texto ("5") en número (5) y comprueba que sea válido.
const parseId = (value: string): number => {
  const id = Number(value);

  // Debe ser un número entero y positivo (no "abc", ni 1.5, ni -3).
  if (!Number.isInteger(id) || id <= 0) {
    throw new DomainError('El identificador no es válido');
  }

  return id;
};

// Recibe el servicio desde afuera (inyección de dependencias) y devuelve las rutas ya armadas.
export const createCandidateRouter = (service: CandidateService): Router => {
  const router = Router();

  // GET /candidates → listar todos los candidatos.
  router.get('/', async (req, res) => {
    const candidates = await service.list();

    res.status(HTTP_STATUS.OK).json(candidates);
  });

  // GET /candidates/:id → ver un candidato.
  router.get('/:id', async (req, res) => {
    const candidate = await service.getById(parseId(req.params.id));

    res.status(HTTP_STATUS.OK).json(candidate);
  });

  // POST /candidates → crear un candidato.
  router.post('/', async (req, res) => {
    // Si los datos son inválidos, el dominio lanza DomainError (→ 400).
    const candidate = await service.create(req.body);

    res.status(HTTP_STATUS.CREATED).json(candidate);
  });

  // PUT /candidates/:id → editar un candidato.
  router.put('/:id', async (req, res) => {
    const candidate = await service.update(parseId(req.params.id), req.body);

    res.status(HTTP_STATUS.OK).json(candidate);
  });

  // DELETE /candidates/:id → eliminar un candidato.
  router.delete('/:id', async (req, res) => {
    // Si no existe, el servicio lanza NotFoundError (→ 404).
    await service.remove(parseId(req.params.id));

    // 204: salió bien y no hay contenido que devolver.
    res.status(HTTP_STATUS.NO_CONTENT).send();
  });

  return router;
};
