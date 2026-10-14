import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  // Só o frontend configurado pode chamar a API. Nada de liberar tudo com *.
  app.enableCors({
    origin: config.getOrThrow<string>('CORS_ORIGIN'),
    exposedHeaders: ['Location', 'Content-Disposition'],
  });

  // whitelist descarta campos que não pertencem ao endpoint, sem dar erro,
  // como o enunciado pede (V7). Não ligamos a conversão implícita de tipos
  // de propósito: "15" (texto) tem que ser recusado, não virar 15.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(config.get<number>('PORT') ?? 3000);
}
void bootstrap();
