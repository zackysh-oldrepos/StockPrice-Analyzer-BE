import authMiddleware from '@/server/middlewares/auth.middleware';
import { validationMiddleware } from '@/server/middlewares/validation.middleware';
import { AuthResponse } from '@/types/auth/auth.types';
import { SignInDTO, SignUpDto, UpdateUserDto } from '@/types/user/user.dto';
import { validateToken } from '@/utils/auth.utils';
import {
  Body,
  Controller,
  Get,
  HeaderParam,
  Post,
  Put,
  QueryParam,
  UseBefore,
} from 'routing-controllers';
import Container from 'typedi';
import AuthService from '../services/auth.service';

@Controller('/api/user')
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = Container.get(AuthService);
  }

  @Get('/profile')
  @UseBefore(authMiddleware)
  async profile(@HeaderParam('authorization') accessToken: string): Promise<unknown> {
    const { userId } = validateToken(accessToken, 'access', ['userId']);
    return this.authService.profile(userId);
  }

  @Post('/sign-in')
  @UseBefore(validationMiddleware(SignInDTO, 'body'))
  async signIn(@Body() userData: SignInDTO): Promise<AuthResponse> {
    return await this.authService.signIn(userData);
  }

  @Post('/sign-up')
  @UseBefore(validationMiddleware(SignUpDto, 'body'))
  async signUp(@Body() userData: SignUpDto): Promise<AuthResponse> {
    return await this.authService.signUp(userData);
  }

  @Put('/profile/update')
  async updateProfile(
    @Body() userData: UpdateUserDto,
    @HeaderParam('authorization') accessToken: string,
  ) {
    const res = validateToken(accessToken, 'access', ['userId']);
    return this.authService.updateProfile(res.userId, userData);
  }

  @Post('/refresh-token')
  async refreshAToken(@HeaderParam('x-refresh-token') refreshToken: string): Promise<AuthResponse> {
    return await this.authService.refreshAToken(refreshToken);
  }

  @Post('/check-access')
  @UseBefore(authMiddleware)
  async checkAccess(): Promise<unknown> {
    return { authorized: true };
  }

  @Get('/check-user')
  async checkCredential(@QueryParam('credential') credential: string): Promise<boolean> {
    return this.authService.checkUser(credential);
  }
}
