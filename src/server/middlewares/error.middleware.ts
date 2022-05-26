import { HttpException } from '@exceptions/HttpException';
import { logger } from '@utils/logger';
import { ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

interface ErrorResponse {
  status: number;
  message: string;
  errors?: ValidationError[];
  data?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorMiddleware = (error: HttpException<any>, req: Request, res: Response, next: NextFunction) => {
  try {
    const status: number = error.errors ? 400 : error.status || 500;
    const message: string = error.message || 'Something went wrong';
    const response: ErrorResponse = { status, message };

    if (error.errors) {
      response.errors = error.errors;
    }

    if (error.data) {
      response.data = error.data;
    }

    console.log(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`);
    res.status(status).json(response);
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
