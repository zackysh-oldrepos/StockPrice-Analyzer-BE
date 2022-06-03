/* eslint-disable @typescript-eslint/no-empty-function */
import { HttpException } from '@/exceptions/HttpException';
import { RawStock, Stock, _camelizeStock } from '@/types/analytics/analytics.types';
import { logger } from '@/utils/logger';
import { File, _getTwoDigitsId, _indev } from '@/utils/util';
import fs from 'fs';
import fetch, { Headers } from 'node-fetch';
import { Service } from 'typedi';

@Service()
export default class AnalyticsService {
  constructor() {}
  public async analyze(
    data: File[],
    _userId: number,
  ): Promise<{ valid: Stock[]; train: Stock[]; complete: Stock[] }> {
    // @ Validate uploaded file

    if (!data[0] || !data[0].originalname) throw new HttpException(400, 'No file uploaded');
    if (data[0].originalname.split('.').pop() !== 'csv')
      throw new HttpException(400, 'Invalid file extension');

    const userId = _getTwoDigitsId(_userId);
    const file = data[0];

    file.originalname = `analytics${userId}.csv`;

    try {
      // TODO - store files in a hashed dir structure to avoid disk saturation
      fs.writeFileSync(`src/server/scripts/${file.originalname}`, file.buffer);
    } catch (err) {
      console.log(err);
      throw new HttpException(500, _indev() ? `Error saving file: ${err}` : '');
    }

    try {
      // @ Pass data to Flask

      const headers = new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });

      const _res = await fetch(`http://localhost:5000/${userId}`, { method: 'GET', headers });

      // @ Handle Flask errors

      if (_res.status === 400) throw new HttpException(400, 'Invalid csv', await _res.json());
      else if (_res.status === 500) throw new Error('Flask server crashed/not available');

      // remove file after analysis
      fs.rm(`src/server/scripts/${file.originalname}`, err => {
        if (err) logger.error('Error deleting file: ', err);
      });

      // @ Read Flask response
      const res = await _res.json();
      const valid: RawStock[] = res.valid ? JSON.parse(res.valid) : [];
      const train: RawStock[] = res.train ? JSON.parse(res.train) : [];
      const complete: RawStock[] = res.complete ? JSON.parse(res.complete) : [];

      return {
        valid: valid.map(_camelizeStock),
        train: train.map(_camelizeStock),
        complete: complete.map(_camelizeStock),
      };
    } catch (err) {
      throw new HttpException(
        err.status ?? 500,
        _indev() ? `Error running model: ${err.message ?? err}` : '',
        err.data,
      );
    }
  }
}
