import { NextFunction, Request, Response } from "express";

import { DomainError } from "./DomainError";
import { HTTP_STATUS } from "./httpStatus";

export const notFoundHandler = (req: Request, res:Response): void =>{
    res.status(HTTP_STATUS.NOT_FOUND).json({error: 'Ruta no encontrada'});
}

// Manejador central de errores
export const errorHandler=(
    error: Error & {status?: number},
    req: Request,
    res: Response,
    next: NextFunction,
): void =>{
    // CASO 1: se rompe una regla de negocio
    if (error instanceof DomainError){
        res.status(HTTP_STATUS.BAD_REQUEST).json({error: error.message});
        return;
    }
    // CASO 2: otro error presentado.
    const status = error.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;

    if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) console.error(error);

    res.status(status).json({
        error: status <HTTP_STATUS.INTERNAL_SERVER_ERROR ? 'La peticion no es validad': 'Error interno del servidor',
    });
};
