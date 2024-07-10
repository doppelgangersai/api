import { ValueTransformer } from 'typeorm';
import { Hash } from '../../../utils/Hash';

export class PasswordTransformer implements ValueTransformer {
  to(value) {
    if (!value) {
      return;
    }
    return Hash.make(value);
  }

  from(value) {
    return value;
  }
}
