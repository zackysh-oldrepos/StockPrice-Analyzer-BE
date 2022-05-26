import { pool } from '@/db';
import { User } from '@/types/user/user.types';

import { Service } from 'typedi';
import GenericModel from './generic.model';

export const USER_TABLE = 'user';
export const USER_PK = 'userId';

@Service()
export class UserModel extends GenericModel<User> {
  constructor() {
    super(USER_TABLE, USER_PK);
  }

  public async findByUsername(username: string): Promise<User> {
    const rows: User[] = await pool.query(`SELECT * FROM user WHERE username = ?;`, username);
    return rows[0];
  }

  public async findByEmail(email: string): Promise<User> {
    const rows: User[] = await pool.query(`SELECT * FROM user WHERE email = ?;`, email);
    return rows[0];
  }
}
