import { NotFoundException } from '@nestjs/common';
import { ParseIdPipe } from './parse-id.pipe';

describe('ParseIdPipe', () => {
  const pipe = new ParseIdPipe();

  it.each(['1', '25', '2147483647'])('aceita %s', (value) => {
    expect(pipe.transform(value)).toBe(Number(value));
  });

  // Tudo isso conta como recurso inexistente (404), não como erro de formato.
  it.each([
    'abc',
    '0',
    '01',
    '-1',
    '1.5',
    '1e2',
    '0x10',
    ' 5',
    '',
    '2147483648',
    '99999999999999999999',
  ])('recusa %p com 404', (value) => {
    expect(() => pipe.transform(value)).toThrow(NotFoundException);
  });
});
