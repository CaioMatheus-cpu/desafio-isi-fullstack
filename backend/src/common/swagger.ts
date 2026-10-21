import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// A documentação interativa fica fora do prefixo da API: http://localhost:3000/docs
// (o JSON do OpenAPI sai em /docs-json).
export const SWAGGER_PATH = 'docs';

export function setupSwagger(app: INestApplication): void {
  const options = new DocumentBuilder()
    .setTitle('Passe - API da liga')
    .setDescription(
      'Jogadores, clubes, compra e venda com contrato de fidelidade, histórico, escalação, partidas e classificação. ' +
        'Valores em moedas, com 2 casas, sempre calculados pela API. Datas no horário de Brasília (-03:00).',
    )
    .setVersion('1.0')
    .build();

  SwaggerModule.setup(
    SWAGGER_PATH,
    app,
    SwaggerModule.createDocument(app, options),
  );
}
