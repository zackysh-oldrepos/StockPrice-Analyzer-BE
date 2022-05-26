import { _titleCase } from '@/utils/util';
import fs from 'fs';

export class ResetPasswordTemplate {
  public static loadTemplate(username: string, code: string): string {
    const html = fs.readFileSync(`${__dirname}/reset-password.template.html`, 'utf8');
    return html.replace('{{username}}', _titleCase(username.trim())).replace('{{code}}', code);
  }
}
