import { pool } from '@/db';
import { UpsertResult } from 'mariadb';
import { Service } from 'typedi';

/**
 * Class that can be extended or instanced.
 * It provides a plain CRUD API.
 * @type E entity type, class or interface
 */
@Service()
export default abstract class GenericModel<E> {
  table: string;
  pk: string;

  /**
   * @param table entity table
   * @param pk entity primary key
   */
  constructor(table: string, pk: string) {
    this.table = table;
    this.pk = pk;
  }

  // @ Static methods

  /**
   * This method execute a generic SELECT WHERE statement given column-value pair.
   *
   * @param table target table
   * @param column table column
   * @param value target table record
   * @returns any match
   */
  public static async staticFindByColumn<E>(table: string, column: string, value: number): Promise<E> {
    const rows: E[] = await pool.query(`SELECT * FROM ${table} WHERE ${column} = ?`, value);
    return rows[0];
  }

  /**
   * This method execute a generic SELECT statement.
   *
   * @param table target table
   */
  public static async staticfindAll<E>(table: string): Promise<E[]> {
    const rows: E[] = await pool.query(`SELECT * FROM ${table}`);
    return rows;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Data Fetch
  // -----------------------------------------------------------------------------------------------------

  public async findAll(): Promise<E[]> {
    const rows = await pool.query(`SELECT * FROM ${this.table}`);
    return rows;
  }

  public async findById(ID: number): Promise<E> {
    const rows: E[] = await pool.query(`SELECT * FROM ${this.table} WHERE ${this.pk} = ?`, ID);
    return rows[0];
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Data Manipulation
  // -----------------------------------------------------------------------------------------------------

  public async create(object: E | object): Promise<number> {
    const query: UpsertResult = await pool.query(`INSERT INTO ${this.table} SET ?`, object);
    return Number(`${query.insertId}`);
  }

  public async update(ID: number, object: E | object): Promise<number> {
    const query = await pool.query(`UPDATE ${this.table} SET ? WHERE ${this.pk} = ?`, [object, ID]);
    return query.affectedRows;
  }

  public async delete(ID: number): Promise<number> {
    const query: UpsertResult = await pool.query(`DELETE FROM ${this.table} WHERE ${this.pk} = ?`, ID);
    return query.affectedRows;
  }
}
