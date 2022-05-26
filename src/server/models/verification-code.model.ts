import { Code } from '@/types/auth/auth.types';

import { Service } from 'typedi';
import GenericModel from './generic.model';

export const VERIFICATION_TABLE = 'verification_code';
export const VERIFICATION_PK = 'userId';

@Service()
export class VerificationCodeModel extends GenericModel<Code> {
  constructor() {
    super(VERIFICATION_TABLE, VERIFICATION_PK);
  }
}
