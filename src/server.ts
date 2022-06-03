import App from '@/app';
import 'dotenv/config';
import 'reflect-metadata';
import { AnalyticsController } from './server/controllers/analytics.controller';
import { AuthController } from './server/controllers/auth.controller';
import { EmailVerificationController } from './server/controllers/email-verification.controller';
import { PasswordController } from './server/controllers/password.controller';
process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

// validateEnv();

const app = new App([
  AuthController,
  EmailVerificationController,
  PasswordController,
  AnalyticsController,
]);
app.listen();
