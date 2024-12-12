import { AuthGuard } from '@nestjs/passport';
import { User } from '../../modules/api/user';

export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest so it never throws an error
  handleRequest(err, user, info, context) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }
}
