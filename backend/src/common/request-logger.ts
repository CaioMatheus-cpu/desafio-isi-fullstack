import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

// Uma linha por requisição: método, caminho, status e quanto tempo levou. A data
// e a hora vêm do próprio Logger do Nest, que escreve no começo de cada linha.
export function formatRequestLog(
  method: string,
  path: string,
  status: number,
  durationMs: number,
): string {
  return `${method} ${path} ${status} ${durationMs}ms`;
}

// Registra a requisição quando a resposta termina (e não quando chega), para o
// status já ser o definitivo. Erro do servidor sai como erro; o resto, como log.
export function requestLogger(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const startedAt = process.hrtime.bigint();
  response.on('finish', () => {
    const durationMs = Math.round(
      Number(process.hrtime.bigint() - startedAt) / 1_000_000,
    );
    const line = formatRequestLog(
      request.method,
      request.originalUrl,
      response.statusCode,
      durationMs,
    );
    if (response.statusCode >= 500) {
      logger.error(line);
    } else if (response.statusCode >= 400) {
      logger.warn(line);
    } else {
      logger.log(line);
    }
  });
  next();
}
