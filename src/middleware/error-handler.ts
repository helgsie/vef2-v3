import { Context, MiddlewareHandler } from 'hono';
import { ZodError } from 'zod';

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof ZodError) {
      return c.json(
        { error: 'Validation Error', details: error.errors },
        400
      );
    }
    
    return c.json(
      { error: 'Internal Server Error' },
      500
    );
  }
};