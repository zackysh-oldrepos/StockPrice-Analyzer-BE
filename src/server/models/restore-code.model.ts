import { Code } from '@/types/auth/auth.types';

import { Service } from 'typedi';
import GenericModel from './generic.model';

export const RESTORE_TABLE = 'restore_code';
export const RESTORE_PK = 'userId';

@Service()
export class RestoreCodeModel extends GenericModel<Code> {
  constructor() {
    super(RESTORE_TABLE, RESTORE_PK);
  }
}
