import { File } from './../../utils/util';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import authMiddleware from '@/server/middlewares/auth.middleware';
import { validateToken } from '@/utils/auth.utils';
import { Controller, HeaderParam, Post, UploadedFiles, UseBefore } from 'routing-controllers';
import Container from 'typedi';
import AnalyticsService from '../services/analytics.service';

@Controller('/api/analytics')
export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = Container.get(AnalyticsService);
  }

  @Post()
  @UseBefore(authMiddleware)
  async saveFile(
    @UploadedFiles('data', { required: true }) data: File[],
    @HeaderParam('authorization') accessToken: string,
  ) {
    const { userId } = validateToken(accessToken, 'access', ['userId']);
    return await this.analyticsService.analyze(data, userId);
  }
}
