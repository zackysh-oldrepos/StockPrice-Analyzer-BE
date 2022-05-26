import { ValidationError } from 'class-validator';
import { HttpError } from 'routing-controllers';

export class HttpException<T> extends HttpError {
  public status: number;
  public message: string;
  public errors: ValidationError[];
  public data: T;

  constructor(status: number, message: string, data?: T) {
    super(status, message);
    this.status = status;
    this.message = message || '';
    this.data = data;
  }
}
