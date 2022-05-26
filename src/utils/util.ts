import { HttpException } from '@/exceptions/HttpException';
import crypto from 'crypto';

export function _titleCase(str: string) {
  const first = str.substring(0, 1).toUpperCase();
  return first + str.substring(1);
}

/** Useful method to validate params that should be a number */
export function isId(id: number, name?: string): boolean {
  if (!id || typeof id !== 'number') throw new HttpException(400, `${name ?? 'ID'} must be a number`);
  return true;
}

export function between(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export function randomString(length: number): string {
  const buf = new Uint8Array(length);
  const bytes = crypto.randomBytes(buf.length);
  buf.set(bytes);
  return buf.reduce((str, num) => str + `${num.toString(16)}`.charAt(0), '').toUpperCase();
}
