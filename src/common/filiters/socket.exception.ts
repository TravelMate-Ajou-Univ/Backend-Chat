import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';

export type SocketExceptionStatus =
  | 'BadRequest'
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'Conflict'
  | 'InternalServerError';

export class SocketException extends WsException {
  constructor(status: SocketExceptionStatus, message: string) {
    super({ status, message });
  }
}

@Catch(Error)
export class SocketExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof SocketException) {
      const ackCallback = host.getArgByIndex(2);
      ackCallback(exception);
    } else {
      console.error(exception);
    }
  }
}
