import { EventEmitter } from 'node:events';
import { Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { formatRequestLog, requestLogger } from './request-logger';

describe('formatRequestLog', () => {
  it('escreve método, caminho, status e duração em uma linha', () => {
    expect(formatRequestLog('GET', '/api/v1/players?page=2', 200, 12)).toBe(
      'GET /api/v1/players?page=2 200 12ms',
    );
  });
});

describe('requestLogger', () => {
  const request = { method: 'POST', originalUrl: '/api/v1/clubs' } as Request;

  function responseWith(statusCode: number) {
    return Object.assign(new EventEmitter(), {
      statusCode,
    }) as unknown as Response;
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('segue para o próximo passo e só registra quando a resposta termina', () => {
    const log = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    const next = jest.fn();
    const response = responseWith(201);

    requestLogger(request, response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(log).not.toHaveBeenCalled();

    response.emit('finish');

    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/^POST \/api\/v1\/clubs 201 \d+ms$/),
    );
  });

  it('registra recusa do cliente como aviso e falha do servidor como erro', () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const error = jest.spyOn(Logger.prototype, 'error').mockImplementation();

    const refused = responseWith(409);
    requestLogger(request, refused, jest.fn());
    refused.emit('finish');

    const failed = responseWith(500);
    requestLogger(request, failed, jest.fn());
    failed.emit('finish');

    expect(warn).toHaveBeenCalledWith(expect.stringContaining(' 409 '));
    expect(error).toHaveBeenCalledWith(expect.stringContaining(' 500 '));
  });
});
