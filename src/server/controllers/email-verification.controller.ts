import authMiddleware from '@/server/middlewares/auth.middleware';
import { validateToken } from '@/utils/auth.utils';

import { Body, Controller, HeaderParam, Post, UseBefore, Get } from 'routing-controllers';
import Container from 'typedi';
import EmailVerificationService from '../services/email-verification.service';

@Controller('/api/email-verification')
export class EmailVerificationController {
  private emailVerificationService: EmailVerificationService;

  constructor() {
    console.log('PasswordController');
    this.emailVerificationService = Container.get(EmailVerificationService);
  }

  @Get('/send')
  @UseBefore(authMiddleware)
  async sendCode(@HeaderParam('authorization') accessToken: string): Promise<unknown> {
    const { userId } = validateToken(accessToken, 'access', ['userId']);
    await this.emailVerificationService.sendVerificationCode(userId);
    return { message: 'Verification code sent' };
  }

  @Post('/verify')
  @UseBefore(authMiddleware)
  async verify(
    @HeaderParam('authorization') accessToken: string,
    @Body() verificationCode: string,
  ): Promise<unknown> {
    console.log(verificationCode);
    const { userId } = validateToken(accessToken, 'access', ['userId']);
    await this.emailVerificationService.verify(userId, verificationCode);
    return { message: 'Email verified' };
  }
}
