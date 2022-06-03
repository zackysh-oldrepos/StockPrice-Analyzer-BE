import { HttpException } from '@/exceptions/HttpException';
import { UserModel } from '@/server/models/user.model';
import { isId, randomString, _indev } from '@/utils/util';
import { EmailVerificationTemplate } from '@/views/email-verification/email-verification.handler';

import nodemailer, { SendMailOptions } from 'nodemailer';
import { Service } from 'typedi';
import { VerificationCodeModel } from './../models/verification-code.model';

@Service()
export default class EmailVerificationService {
  constructor(private userModel: UserModel, private verificationModel: VerificationCodeModel) {}

  public async sendVerificationCode(userId: number): Promise<void> {
    // @ Validation
    isId(userId);

    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException(401, 'Invalid access token');
    if (user.emailVerified) throw new HttpException(409, 'Email already verified');

    // @ Process data

    // check any existing verification code
    const existingCode = (await this.verificationModel.findById(userId))?.code;

    // generate new code if neccesary
    const code = existingCode ?? randomString(6);
    if (!existingCode) {
      await this.verificationModel.create({ userId, code });
    }

    const html = EmailVerificationTemplate.loadTemplate(user.username, code);

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
      subject: 'SP Analyzer Email Verification',
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error(err);
      throw new HttpException(500, _indev() ? 'Email sending failed' : '');
    }
  }

  public async verify(userId: number, code: string): Promise<boolean> {
    // @ Validation
    isId(userId);

    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException(401, 'Invalid access token');
    if (user.emailVerified) throw new HttpException(409, 'Email already verified');

    // @ Process Response
    const verificationCode = (await this.verificationModel.findById(userId))?.code;

    if (!verificationCode) throw new HttpException(403, 'Wrong verification code');
    if (verificationCode !== code) throw new HttpException(403, 'Wrong verification code');

    // @ Update user
    await this.userModel.update(userId, { emailVerified: true });
    await this.verificationModel.delete(userId);

    return true;
  }
}
