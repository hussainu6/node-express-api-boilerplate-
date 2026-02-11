import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError, ErrorCode } from '../errors';

type SchemaMap = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

export function validate(schemas: SchemaMap) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        next(
          new AppError(ErrorCode.VALIDATION, 'Validation failed', 400, err.flatten().fieldErrors)
        );
        return;
      }
      next(err);
    }
  };
}
