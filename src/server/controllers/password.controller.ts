import { CheckPasswordDto, RestorePasswordDto } from '@/types/auth/password.dto';

import { Body, Controller, Get, Post, QueryParam, UseBefore } from 'routing-controllers';
import Container from 'typedi';
import { validationMiddleware } from '../middlewares/validation.middleware';
import PasswordService from '../services/password.service';

@Controller('/api/restore-password')
export class PasswordController {
  private passwordService: PasswordService;

  constructor() {
    console.log('PasswordController');
    this.passwordService = Container.get(PasswordService);
  }

  @Get('/send')
  async sendCode(@QueryParam('credential') credential: string): Promise<unknown> {
    await this.passwordService.sendRestorePasswordCode(credential);
    return { message: 'Restore password code sent' };
  }

  @Post('/reset')
  @UseBefore(validationMiddleware(RestorePasswordDto, 'body'))
  async reset(@Body() restorePasswordDto: RestorePasswordDto): Promise<unknown> {
    console.log(restorePasswordDto);

    await this.passwordService.resetPassword(
      restorePasswordDto.credential,
      restorePasswordDto.code,
      restorePasswordDto.password,
    );
    return { message: 'Password restored' };
  }

  @Post('/check')
  @UseBefore(validationMiddleware(CheckPasswordDto, 'body'))
  async checkCode(@Body() checkPasswordDto: CheckPasswordDto): Promise<unknown> {
    await this.passwordService.checkCode(checkPasswordDto.credential, checkPasswordDto.code);
    return { message: 'Valid password code' };
  }
}
