import { HttpException, HttpStatus } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { VALIDATION_ERROR_DEFAULT } from '../constants/validation.constant';

export class ValidationHttpError extends HttpException {
  constructor(error?: any) {
    super(error || VALIDATION_ERROR_DEFAULT, HttpStatus.BAD_REQUEST);
  }

  getResponse(): ValidationError[] {
    return super.getResponse() as ValidationError[];
  }
}
