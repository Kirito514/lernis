import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';

  // Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation error';
    code = 'VALIDATION_ERROR';
    return res.status(statusCode).json({
      success: false,
      error: message,
      code,
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    });
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        code = 'DUPLICATE_ERROR';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        code = 'NOT_FOUND';
        break;
      default:
        statusCode = 400;
        message = 'Database error';
        code = 'DATABASE_ERROR';
    }
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Custom errors
  if (error.statusCode) {
    statusCode = error.statusCode;
  }

  if (error.message && error.message !== 'Internal server error') {
    message = error.message;
  }

  if (error.code) {
    code = error.code;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    code,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};
