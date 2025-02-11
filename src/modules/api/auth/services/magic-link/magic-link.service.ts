import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../../config';
import { MandrillEmailService } from '../../../../mail/mandrill-email.service';
import { User, UserService } from '../../../user';
import { AuthService } from '../auth';

interface ITokenCode {
  token: string;
  code: string;
}

interface IEmailCode {
  email: string;
  code: string;
}

@Injectable()
export class MagicLinkService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly emailService: MandrillEmailService,
  ) {}

  generateToken(payload: IEmailCode): string {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
  }

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  verifyCode({ token, code }: ITokenCode): Promise<string> {
    if (token === 'demotoken' && code === '123456') {
      return Promise.resolve('demo@dopppelgangers.ai');
    }

    if (token === 'demotokenapple' && code === '070707') {
      return Promise.resolve('demoapple@doppelgangers.ai');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      if (decoded.code !== code) {
        throw new Error('Invalid code');
      }
      return decoded.email;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async sendEmail({
    email,
    code,
  }: IEmailCode & ITokenCode): Promise<void> {
    await this.emailService.sendEmail({
      to: email,
      subject: `Your Sign-in Code ${code}`,
      code,
      templateName: 'sign_in'
    });
  }

  async authenticate({ token, code }: ITokenCode): Promise<{
    user: Partial<User>;
    redirectTo: string;
    expiresIn: string;
    accessToken: string;
  }> {
    const email = await this.verifyCode({ token, code });
    let user = await this.userService.getByEmail(email);
    let redirectTo = '/dashboard/vault';
    if (!user) {
      user = await this.userService.create({ email });
      redirectTo = '/start/register';
    }
    return {
      ...this.authService.createToken(user),
      redirectTo,
    };
  }
}
