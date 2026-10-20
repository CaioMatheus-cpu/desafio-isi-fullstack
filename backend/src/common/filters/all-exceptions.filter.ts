import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorBody {
  status: number;
  message: string;
}

// Todo erro da API passa por aqui e sai no mesmo formato: { message }.
// Nunca devolvemos stack trace nem detalhes internos para quem chamou.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, message } = this.describe(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // O detalhe fica só no log do servidor.
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    // O tipo é forçado para JSON: um tipo definido antes do erro (como o de um
    // arquivo CSV) não pode vazar para a resposta de erro.
    response.status(status).type('application/json').json({ message });
  }

  private describe(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        message: this.extractMessage(exception),
      };
    }

    // Erros do próprio Express, como JSON quebrado no corpo, chegam com
    // um status 4xx mas sem ser HttpException do Nest.
    const status = this.clientErrorStatus(exception);
    if (status !== null) {
      return { status, message: 'Requisição inválida.' };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor.',
    };
  }

  private extractMessage(exception: HttpException): string {
    const body = exception.getResponse();
    if (typeof body === 'string') {
      return body;
    }
    const { message } = body as { message?: string | string[] };
    if (Array.isArray(message)) {
      return message.join('; ');
    }
    return message || exception.message;
  }

  private clientErrorStatus(exception: unknown): number | null {
    const status = (exception as { status?: unknown } | null)?.status;
    const isClientError =
      typeof status === 'number' && status >= 400 && status < 500;
    return isClientError ? status : null;
  }
}
