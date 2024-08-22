import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MandrillEmailService } from '../../../../mail/mandrill-email.service';
import { AuthService } from '../auth';
import { ConfigService } from '../../../../config';
import { UserService } from '../../../user';

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

  async generateToken(payload: IEmailCode): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
  }

  async generateCode(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async verifyCode({ token, code }: ITokenCode): Promise<string> {
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
    token,
    code,
  }: IEmailCode & ITokenCode): Promise<void> {
    const appUrl = this.configService.get('APP_URL');
    const magicLink = `${appUrl}/auth/mail?token=${token}`;
    console.log(`Sending magic link to ${email}: ${magicLink}`);
    await this.emailService.sendEmail({
      to: email,
      subject: 'Magic Link',
      text:
        'Click the following link to log in or sign up. Your code is ' +
        code +
        '.',
      buttonText: 'Click me',
      buttonUrl: magicLink,
    });
  }

  async authenticate({ token, code }: ITokenCode): Promise<any> {
    const email = await this.verifyCode({ token, code });
    let user = await this.userService.getByEmail(email);
    let redirectTo = '/dashboard/vault';
    if (!user) {
      user = await this.userService.create({ email });
      redirectTo = '/start/register';
    }
    return {
      ...(await this.authService.createToken(user)),
      redirectTo,
    };
  }
}
