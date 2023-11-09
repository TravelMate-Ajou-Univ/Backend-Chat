import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class UnhandledExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const message = exception.message;

    // TODO : logger

    response.status(500).json({
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
      user: request.user?.userIdx,
    });
  }
}
