/* eslint-disable indent */
import { IsDate, IsNumber } from 'class-validator';

export class StockDto {
  @IsDate()
  date: string;

  @IsNumber()
  close: number;
}
