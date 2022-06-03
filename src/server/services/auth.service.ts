import { HttpException } from '@/exceptions/HttpException';
import { UserModel } from '@/server/models/user.model';
import { AuthResponse, TokenPayload } from '@/types/auth/auth.types';
import { SignInDTO, SignUpDto, UpdateUserDto } from '@/types/user/user.dto';
import { User } from '@/types/user/user.types';
import { isId } from '@/utils/util';

import { signUserToken, validateToken } from '@/utils/auth.utils';

import bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';
import { Service } from 'typedi';

@Service()
export default class AuthService {
  constructor(private userModel: UserModel) {}

  public async signIn(userData: SignInDTO): Promise<AuthResponse> {
    // @ Validation
    let user: User;
    if (isEmail(userData.credential)) {
      user = await this.userModel.findByEmail(userData.credential);
    } else {
      user = await this.userModel.findByUsername(userData.credential);
    }

    if (!user) throw new HttpException(404, `User not found with provided credential`);

    // @ Process Response
    // check if password is valid
    if (!bcrypt.compareSync(userData.password, user.password))
      throw new HttpException(401, `Wrong password`);

    // @ sign access token
    const accessToken = signUserToken(user, 900, process.env.ACCESS_SECRET);
    // @ sign refresh token
    const refreshToken = signUserToken(user, 604800, process.env.REFRESH_SECRET);

    delete user.password;
    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  public async test(): Promise<void> {
    const user = await this.userModel.findById(1);
    console.log(user);
  }

  public async signUp(userData: SignUpDto): Promise<AuthResponse> {
    // @ Process Response
    userData.password = bcrypt.hashSync(userData.password, 8);

    const insertId = await this.userModel.create(userData);
    const newUser = await this.userModel.findById(insertId);

    const accessToken = signUserToken(newUser, 900, process.env.ACCESS_SECRET);
    const refreshToken = signUserToken(newUser, 604800, process.env.REFRESH_SECRET);

    delete newUser.password;
    return {
      accessToken,
      refreshToken,
      user: newUser,
    };
  }

  public async profile(userIdL: number): Promise<User> {
    isId(userIdL);
    const user = await this.userModel.findById(userIdL);
    if (!user) throw new HttpException(401, `Invalid access token`);
    delete user.password;
    return user;
  }

  /**
   * @param userId userId extracted from token payload
   */
  public async updateProfile(userId: number, userData: UpdateUserDto): Promise<AuthResponse> {
    // @ Validation
    isId(userId);
    const current = await this.userModel.findById(userId);
    if (!current) throw new HttpException(401, `Invalid access token`);

    if (
      userData.username &&
      current.username !== userData.username &&
      (await this.userModel.findByUsername(userData.username))
    ) {
      throw new HttpException(409, 'Username not available');
    }

    const emailChange = userData.email && userData.email !== current.email;
    if (emailChange && (await this.userModel.findByEmail(userData.email)))
      throw new HttpException(409, `Email already exists`);

    // @ Process Response

    await this.userModel.update(userId, {
      ...userData,
      emailVerified: emailChange ? false : current.emailVerified,
    });

    const newUser = await this.userModel.findById(userId);
    const accessToken = signUserToken(newUser, 900, process.env.ACCESS_SECRET);
    const refreshToken = signUserToken(newUser, 604800, process.env.REFRESH_SECRET);

    delete newUser.password;
    return {
      accessToken,
      refreshToken,
      user: newUser,
    };
  }

  public async refreshAToken(refreshToken: string): Promise<AuthResponse> {
    // @ Validation
    const decoded: TokenPayload = validateToken(refreshToken, 'refresh', ['userId']);

    // Find user that owns this refresh token
    const user = await this.userModel.findById(decoded.userId);
    if (!user) throw new HttpException(401, `Invalid refresh token`);

    // @ Process Response
    // Provide new accessToken
    const token = signUserToken(user, 900, process.env.ACCESS_SECRET); // should be 900;

    delete user.password;
    return {
      accessToken: token,
      refreshToken: refreshToken,
      user,
    };
  }

  public async checkUser(credential: string): Promise<boolean> {
    // @ Validation
    if (!credential || typeof credential !== 'string' || credential.length <= 0)
      throw new HttpException(400, `Credential must be a string`);

    // @ Process Response
    const byUsername = await this.userModel.findByUsername(credential);
    const byEmail = await this.userModel.findByEmail(credential);
    if (!byUsername && !byEmail) throw new HttpException(404, `User not found with provided credential`);

    return true;
  }
}
