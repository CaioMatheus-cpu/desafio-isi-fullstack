import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  AGE_WITH_FIXED_POTENTIAL,
  AGILITY_MAX_FOR_VETERANS,
  ATTRIBUTES_SUM_MAX,
  VETERAN_AGE_FOR_AGILITY,
} from './player-limits';
import { playerNameError } from './player-name';

const ATTRIBUTE_FIELDS = [
  'pace',
  'shooting',
  'passing',
  'dribbling',
  'defending',
  'physical',
] as const;

// Lê os seis atributos do objeto que está sendo validado. Se algum não for
// inteiro, devolve null: nesse caso o erro já é do próprio campo, e as
// regras que cruzam campos ficam quietas para não duplicar a mensagem.
function readAttributes(object: object): number[] | null {
  const record = object as Record<string, unknown>;
  const values = ATTRIBUTE_FIELDS.map((field) => record[field]);
  return values.every(Number.isInteger) ? (values as number[]) : null;
}

function readAge(object: object): number | null {
  const age = (object as { age?: unknown }).age;
  return Number.isInteger(age) ? (age as number) : null;
}

@ValidatorConstraint({ name: 'playerName' })
export class PlayerNameConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value !== 'string' || playerNameError(value) === null;
  }

  defaultMessage(args: ValidationArguments): string {
    return playerNameError(String(args.value)) ?? 'name inválido';
  }
}

// Quem tem 35 anos ou mais não passa de 85 de agilidade.
@ValidatorConstraint({ name: 'agilityWithinAgeLimit' })
export class AgilityWithinAgeLimitConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const age = readAge(args.object);
    if (age === null || age < VETERAN_AGE_FOR_AGILITY) {
      return true;
    }
    return typeof value !== 'number' || value <= AGILITY_MAX_FOR_VETERANS;
  }

  defaultMessage(): string {
    return `agility deve ser no máximo ${AGILITY_MAX_FOR_VETERANS} com ${VETERAN_AGE_FOR_AGILITY} anos ou mais`;
  }
}

// A soma dos seis atributos não pode passar de 480.
@ValidatorConstraint({ name: 'attributesSumLimit' })
export class AttributesSumLimitConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const attributes = readAttributes(args.object);
    if (attributes === null) {
      return true;
    }
    return (
      attributes.reduce((sum, value) => sum + value, 0) <= ATTRIBUTES_SUM_MAX
    );
  }

  defaultMessage(): string {
    return `a soma dos seis atributos deve ser no máximo ${ATTRIBUTES_SUM_MAX}`;
  }
}

// O potencial nunca é menor que o maior atributo. Com 33 anos ou mais no
// cadastro, ele precisa ser exatamente igual ao maior atributo.
@ValidatorConstraint({ name: 'potentialMatchesAttributes' })
export class PotentialMatchesAttributesConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const attributes = readAttributes(args.object);
    if (attributes === null || typeof value !== 'number') {
      return true;
    }
    const highest = Math.max(...attributes);
    const age = readAge(args.object);
    const mustBeEqual = age !== null && age >= AGE_WITH_FIXED_POTENTIAL;
    return mustBeEqual ? value === highest : value >= highest;
  }

  defaultMessage(): string {
    return `potential deve ser maior ou igual ao maior atributo (e igual a ele com ${AGE_WITH_FIXED_POTENTIAL} anos ou mais)`;
  }
}
