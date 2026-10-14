import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { API_PREFIX } from './common/api-prefix';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { BodyValidationPipe } from './common/pipes/body-validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix(API_PREFIX);

  // Só o frontend configurado pode chamar a API. Nada de liberar tudo com *.
  app.enableCors({
    origin: config.getOrThrow<string>('CORS_ORIGIN'),
    exposedHeaders: ['Location', 'Content-Disposition'],
  });

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new BodyValidationPipe());

  await app.listen(config.get<number>('PORT') ?? 3000);
}
void bootstrap();
