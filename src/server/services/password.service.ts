import { HttpException } from '@/exceptions/HttpException';
import { UserModel } from '@/server/models/user.model';
import { randomString } from '@/utils/util';
import { isEmail } from 'class-validator';
import nodemailer, { SendMailOptions } from 'nodemailer';
import { Service } from 'typedi';
import { ResetPasswordTemplate } from './../../views/reset-password/reset-password.handler';
import { RestoreCodeModel } from './../models/restore-code.model';

import { User } from '@/types/user/user.types';
import bcrypt from 'bcrypt';

@Service()
export default class PasswordService {
  constructor(private userModel: UserModel, private restoreModel: RestoreCodeModel) {}

  public async sendRestorePasswordCode(credential: string): Promise<void> {
    // @ Validation
    const user = await this._findUserByCredential(credential);

    // @ Process data

    // check any existing restore code
    const existingCode = (await this.restoreModel.findById(user.userId))?.code;

    // generate new code if neccesary
    const code = existingCode ?? randomString(6);
    if (!existingCode) {
      await this.restoreModel.create({ userId: user.userId, code });
    }

    const html = ResetPasswordTemplate.loadTemplate(user.username, code);

    // @ Send email

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'intersmeet@gmail.com',
        pass: 'moimoaiihgbqzdgx',
      },
    });

    const mailOptions: SendMailOptions = {
      from: 'intersmeet@gmail.com',
      to: user.email,
      subject: 'SP Analyzer Restore Password',
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error(err);
      throw new HttpException(500, 'Email sending failed');
    }
  }

  public async resetPassword(credential: string, code: string, newPassword: string): Promise<void> {
    // @ Validation
    const user = await this._findUserByCredential(credential);

    // @ Process data
    const restoreCode = await this.restoreModel.findById(user.userId);
    if (!restoreCode) throw new HttpException(403, 'Wrong restore password code');
    if (restoreCode.code !== code) throw new HttpException(403, 'Wrong restore password code');

    // @ Process Response
    await this.userModel.update(user.userId, { password: bcrypt.hashSync(newPassword, 8) });
    await this.restoreModel.delete(user.userId);
  }

  public async checkCode(credential: string, code: string): Promise<boolean> {
    // @ Validation
    const user = await this._findUserByCredential(credential);

    // @ Process Response
    const restoreCode = await this.restoreModel.findById(user.userId);
    if (!restoreCode) throw new HttpException(403, 'Wrong restore password code');
    if (restoreCode.code !== code.toUpperCase())
      throw new HttpException(403, 'Wrong restore password code');

    return true;
  }

  private async _findUserByCredential(credential: string): Promise<User> {
    console.log(credential);

    if (!credential || typeof credential !== 'string' || credential.length <= 0)
      throw new HttpException(400, 'Invalid credential');

    const user = isEmail(credential)
      ? await this.userModel.findByEmail(credential)
      : await this.userModel.findByUsername(credential);

    if (!user) throw new HttpException(404, 'User not found with provided credential');

    return user;
  }
}
