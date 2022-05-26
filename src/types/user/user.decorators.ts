/* eslint-disable @typescript-eslint/no-unused-vars */
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { HttpException } from '@/exceptions/HttpException';
import { UserModel } from '@/server/models/user.model';
const userModel = new UserModel();

// -----------------------------------------------------------------------------------------------------
// @ Constraints
// -----------------------------------------------------------------------------------------------------

/**
 * Try to find user by username.
 *
 * @throws 404 if doesn't exists
 * @return true if exists
 */
@ValidatorConstraint({ async: true })
export class FindUserByUsername implements ValidatorConstraintInterface {
  async validate(username: string, args: ValidationArguments) {
    if (!username) return true;
    const resource = await userModel.findByUsername(username);
    if (!resource) throw new HttpException(404, `Couldn't find user with provided username`);
    return true;
  }
}

/**
 * Try to find user by email.
 *
 * @throws 404 if doesn't exists
 * @return true if exists
 */
@ValidatorConstraint({ async: true })
export class FindUserByEmail implements ValidatorConstraintInterface {
  async validate(username: string, args: ValidationArguments) {
    if (!username) return true;
    const resource = await userModel.findByEmail(username);
    if (!resource) throw new HttpException(404, `Couldn't find user with provided email`);
    return true;
  }
}

/**
 * Try to find user by ID.
 *
 * @throws 404 if doesn't exists
 * @return true if exists
 */
@ValidatorConstraint({ async: true })
export class FindUserById implements ValidatorConstraintInterface {
  async validate(userId: number, args: ValidationArguments) {
    if (!userId) return true;
    const resource = await userModel.findById(userId);
    if (!resource) throw new HttpException(404, `Couldn't find user with provided ID`);
    return true;
  }
}

/**
 * Check if username is available.
 *
 * @throws 409 if it's not available
 * @return true if available
 */
@ValidatorConstraint({ async: true })
export class CheckUsername implements ValidatorConstraintInterface {
  async validate(username: string, args: ValidationArguments) {
    if (!username) return true;
    const resource = await userModel.findByUsername(username);
    if (resource) throw new HttpException(409, `Provided username isn't available`);
    return true;
  }
}

/**
 * Check if email is available.
 *
 * @throws 409 if it's not available
 * @return true if available
 */
@ValidatorConstraint({ async: true })
export class CheckEmail implements ValidatorConstraintInterface {
  async validate(email: string, args: ValidationArguments) {
    if (!email) return true;
    const resource = await userModel.findByEmail(email);
    if (resource) throw new HttpException(409, `Provided email isn't available`);
    return true;
  }
}
