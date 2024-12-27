import { AuthGuard } from '@nestjs/passport';
import { User } from '../../modules/api/user';

export class OptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
