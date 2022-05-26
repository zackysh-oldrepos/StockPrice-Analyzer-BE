/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from 'class-validator';

// -----------------------------------------------------------------------------------------------------
// @ Constraints
// -----------------------------------------------------------------------------------------------------

export const _IsOwnProperty = {
  validate: async (value: any, _args: ValidationArguments) => {
    return await value.service._ownPropertyKey(value.key);
  },
};

// -----------------------------------------------------------------------------------------------------
// @ Decorators
// -----------------------------------------------------------------------------------------------------

export function ExistsOnDb(
  constraint: ValidatorConstraintInterface,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,

      propertyName: propertyName,

      options: validationOptions,

      constraints: [],

      validator: constraint,
    });
  };
}

export function ValidateArray(
  constraint: ValidatorConstraintInterface,
  validationOptions?: ValidationOptions,
) {
  return function (target: Object, propertyName: string) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: constraint,
    });
  };
}

export function IsOwnProperty(
  constraint: ValidatorConstraintInterface,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: constraint,
    });
  };
}
