import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { acronymError, clubNameError } from './club-name';

@ValidatorConstraint({ name: 'clubName' })
export class ClubNameConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value !== 'string' || clubNameError(value) === null;
  }

  defaultMessage(args: ValidationArguments): string {
    return clubNameError(String(args.value)) ?? 'name inválido';
  }
}

// A sigla depende do nome, então a regra lê o nome do mesmo objeto. Se o nome
// nem é texto, o erro já é dele e esta regra fica quieta.
@ValidatorConstraint({ name: 'clubAcronym' })
export class ClubAcronymConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const name = (args.object as { name?: unknown }).name;
    if (typeof value !== 'string' || typeof name !== 'string') {
      return true;
    }
    return acronymError(value, name) === null;
  }

  defaultMessage(args: ValidationArguments): string {
    const name = (args.object as { name?: unknown }).name;
    return acronymError(String(args.value), String(name)) ?? 'acronym inválido';
  }
}
