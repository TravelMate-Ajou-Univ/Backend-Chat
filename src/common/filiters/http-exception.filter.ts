import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ValidationHttpError } from '../errors/validation-http-error';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    let message = exception.message;

    if (exception instanceof ValidationHttpError) {
      const error = exception.getResponse()[0];

      if (error.constraints) {
        const firstConstraintKey = Object.getOwnPropertyNames(
          error.constraints,
        )[0];
        message = error.constraints[firstConstraintKey] ?? exception.message;
      }
      return response.status(status).json({
        message: message,
        timestamp: new Date().toISOString(),
        path: request.url,
        user: request.user?.userIdx,
      });
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
      user: request.user?.userIdx,
    });
  }
}
