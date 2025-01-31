import { Injectable, UnauthorizedException } from '@nestjs/common';
import { decode, verify } from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { AuthService } from './auth';
import { User, UserService } from '../../user'; // lib is not friendly with typescript

@Injectable()
export class AppleAuthService {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
  private readonly jwks = jwksClient({
    jwksUri: 'https://appleid.apple.com/auth/keys',
  });

  public async authByIdToken(idToken: string): Promise<{
    accessToken: string;
    expiresIn: string;
    user: User;
  }> {
    const decodedHeader = decode(idToken, { complete: true });

    if (!decodedHeader?.header?.kid) {
      throw new UnauthorizedException('Invalid Apple token header');
    }

    const { kid } = decodedHeader.header;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const key = await this.jwks.getSigningKey(kid);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const publicKey = key.getPublicKey();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const decoded: any = verify(idToken, publicKey, {
        algorithms: ['RS256'],
      });

      const { sub, email } = decoded as { sub: string; email: string };

      let user = email
        ? await this.userService.getByEmail(email)
        : await this.userService.getByAppleSubId(sub);

      if (!user) {
        user = await this.userService.create({
          email,
          appleSubId: sub,
        });
      }

      if (user.email !== email) {
        await this.userService.update(user.id, { email });
      }

      if (user.appleSubId !== sub) {
        await this.userService.update(user.id, { appleSubId: sub });
      }

      const jwt = this.authService.createToken(user);

      return {
        accessToken: jwt.accessToken,
        expiresIn: jwt.expiresIn,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Apple IdToken');
    }
  }
}
