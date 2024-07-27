import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigService {
  private readonly envConfig: { [key: string]: string };

  constructor(filePath: string) {
    this.envConfig = dotenv.parse(fs.readFileSync(filePath));
  }

  get<T = string>(key: string): T {
    return this.envConfig[key] as T;
  }

  getInt(key: string): number {
    return parseInt(this.envConfig[key], 10);
  }

  getBoolean(key: string): boolean {
    return this.envConfig[key] === 'true';
  }

  isEnv(env: string) {
    return this.envConfig.APP_ENV === env;
  }
}
