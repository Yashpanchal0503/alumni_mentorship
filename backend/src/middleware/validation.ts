import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      res.status(400).json({ error: 'Invalid request parameters' });
    }
  };
}
