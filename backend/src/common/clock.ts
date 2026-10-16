import { Global, Injectable, Module } from '@nestjs/common';

// O relógio fica isolado aqui para o resto do código nunca chamar new Date()
// por conta própria. Em produção devolve o instante do servidor; nos testes
// dá para trocar por um relógio fixo e conferir datas sem esperar.
@Injectable()
export class Clock {
  now(): Date {
    return new Date();
  }
}

@Global()
@Module({ providers: [Clock], exports: [Clock] })
export class ClockModule {}
