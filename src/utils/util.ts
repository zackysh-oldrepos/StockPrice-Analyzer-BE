import { HttpException } from '@/exceptions/HttpException';
import crypto, { Encoding } from 'crypto';
import { MimeType } from 'file-type';

export const _getTwoDigitsId = (id: number) => {
  return `${id < 10 ? `0${id}` : id}`;
};

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

export function _indev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export interface iUploadedFile {
  /** file name */
  name: string;
  /** A function to move the file elsewhere on your server */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mv(path: string, callback: (err: any) => void): void;
  mv(path: string): Promise<void>;
  /** Encoding type of the file */
  encoding: string;
  /** The mimetype of your file */
  mimetype: string;
  /** A buffer representation of your file, returns empty buffer in case useTempFiles option was set to true. */
  data: Buffer;
  /** A path to the temporary file in case useTempFiles option was set to true. */
  tempFilePath: string;
  /** A boolean that represents if the file is over the size limit */
  truncated: boolean;
  /** Uploaded size in bytes */
  size: number;
  /** MD5 checksum of the uploaded file */
  md5: string;
}

export interface File {
  fieldname: string;
  originalname: string;
  encoding: Encoding;
  mimetype: MimeType;
  buffer: Buffer;
}
