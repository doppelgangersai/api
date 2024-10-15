import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Hash } from '../../../../../utils/Hash';
import { ConfigService } from '../../../../config';
import { User, UserService } from '../../../user';
import { LoginDTO } from '../../auth.dtos';
import {
  JWT_EXPIRATION_TIME,
  NODE_ENV,
} from '../../../../../core/constants/environment.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async createToken(user: User) {
    return {
      expiresIn: this.configService.get(JWT_EXPIRATION_TIME),
      accessToken: this.jwtService.sign({ id: user.id }),
      user,
    };
  }

  async validateUser(payload: LoginDTO): Promise<any> {
    const user = await this.userService.getByEmail(payload.email);
    if (!user || !Hash.compare(payload.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials!');
    }
    return user;
  }

  async mockLogin(user_id = 1) {
    const isNotProd = ['test', 'local', 'development'].includes(
      this.configService.get(NODE_ENV),
    );

    if (isNotProd) {
      throw new UnauthorizedException(
        'This method is only available in local environment!',
      );
    }

    const user = await this.userService.get(user_id);
    return await this.createToken(user);
  }
}
