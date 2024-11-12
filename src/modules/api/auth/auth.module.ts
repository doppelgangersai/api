import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '../../config';
import { UserModule } from '../user';
import { AuthService, MagicLinkService } from './services';
import { JwtStrategy } from './services';
import {
  AuthController,
  GoogleAuthController,
  MagicLinkAuthController,
  NearController,
} from './controllers';
import { MandrillEmailService } from '../../mail/mandrill-email.service';
import {
  JWT_EXPIRATION_TIME,
  JWT_SECRET_KEY,
} from '../../../core/constants/environment.constants';
import { PointsModule } from '../../points/points.module';

@Module({
  imports: [
    UserModule,
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PointsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get(JWT_SECRET_KEY),
          signOptions: {
            ...(configService.get(JWT_EXPIRATION_TIME)
              ? {
                  expiresIn: Number(configService.get(JWT_EXPIRATION_TIME)),
                }
              : {}),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    GoogleAuthController,
    MagicLinkAuthController,
    NearController,
  ],
  providers: [AuthService, JwtStrategy, MagicLinkService, MandrillEmailService],
  exports: [PassportModule.register({ defaultStrategy: 'jwt' })],
})
export class AuthModule {}
