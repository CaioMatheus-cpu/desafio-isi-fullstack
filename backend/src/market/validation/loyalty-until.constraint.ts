import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { parseBrasiliaDateTime } from '../../common/brasilia-time';

// RN01: AAAA-MM-DDTHH:MM-03:00, e uma data que existe de verdade.
@ValidatorConstraint({ name: 'brasiliaDateTime' })
export class BrasiliaDateTimeConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value !== 'string' || parseBrasiliaDateTime(value) !== null;
  }

  defaultMessage(): string {
    return 'loyalty_until deve estar no formato AAAA-MM-DDTHH:MM-03:00 e ser uma data que existe';
  }
}
