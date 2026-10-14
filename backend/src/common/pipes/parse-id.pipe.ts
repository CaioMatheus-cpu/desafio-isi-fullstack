import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';

const MAX_ID = 2147483647;
const POSITIVE_INTEGER = /^[1-9][0-9]*$/;

// Id na URL só vale se for inteiro positivo, escrito só com dígitos e sem
// zero à esquerda. Qualquer outra forma (abc, 0, 01, -1, 1.5, gigante) conta
// como recurso inexistente: 404, e não 400.
@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = POSITIVE_INTEGER.test(value) ? Number(value) : NaN;
    if (!Number.isSafeInteger(id) || id > MAX_ID) {
      throw new NotFoundException('Recurso não encontrado.');
    }
    return id;
  }
}
