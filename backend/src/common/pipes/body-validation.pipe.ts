import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';

// Valida SÓ o corpo das requisições. Parâmetros da URL e query ficam como
// chegaram, em texto: se este pipe os convertesse, "01" viraria 1 antes do
// ParseIdPipe olhar, e o id inválido passaria como se fosse válido.
export class BodyValidationPipe extends ValidationPipe {
  constructor() {
    super({
      // whitelist descarta campos que não pertencem ao endpoint, sem dar
      // erro, como o enunciado pede (V7). Não ligamos a conversão implícita
      // de tipos de propósito: "15" (texto) tem que ser recusado.
      whitelist: true,
      transform: true,
      // Junta todas as falhas numa mensagem só, em texto.
      exceptionFactory: (errors) =>
        new BadRequestException(
          errors
            .flatMap((error) => Object.values(error.constraints ?? {}))
            .join('; '),
        ),
    });
  }

  override async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    if (metadata.type !== 'body') {
      return value;
    }
    // O corpo tem que ser um objeto JSON (V1). Array, texto ou número solto
    // passariam batido pela validação dos campos, então barramos aqui.
    const isObject =
      typeof value === 'object' && value !== null && !Array.isArray(value);
    if (!isObject) {
      throw new BadRequestException(
        'O corpo da requisição deve ser um objeto JSON.',
      );
    }
    return super.transform(value, metadata);
  }
}
