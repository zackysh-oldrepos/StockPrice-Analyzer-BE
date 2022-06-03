import { HttpException } from '@exceptions/HttpException';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { RequestHandler } from 'express';
import { HttpError } from 'routing-controllers';

export function _extractVErrorsMessage(errors: ValidationError[]): string {
  return errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
}

export const validationMiddleware = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any,
  value: 'body' | 'query' | 'params' | 'headers' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req, res, next) => {
    validate(plainToClass(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted })
      .then((errors: ValidationError[]) => {
        if (errors?.length > 0) {
          if (errors instanceof HttpError) next(errors);
          else next(new HttpException(400, _extractVErrorsMessage(errors)));
        } else {
          next();
        }
      })

      .catch(error => {
        if (error instanceof HttpError) next(error);
        else next(new HttpException(400, error));
      });
  };
};
