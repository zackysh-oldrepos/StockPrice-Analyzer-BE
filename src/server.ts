import 'reflect-metadata';
import { PasswordController } from './server/controllers/password.controller';
import App from '@/app';
import 'dotenv/config';
import { AuthController } from './server/controllers/auth.controller';
import { EmailVerificationController } from './server/controllers/email-verification.controller';
process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

// validateEnv();

const app = new App([AuthController, EmailVerificationController, PasswordController]);
app.listen();
