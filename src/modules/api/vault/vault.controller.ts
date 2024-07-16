import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('vault')
@Controller('/api/vault')
export class VaultController {
  constructor() {}


  @Post('instagram')
  async instagram() {
    return {
      message: 'Instagram',
    };
  }

  @Post('facebook')
  async facebook() {
    return {
      message: 'Facebook',
    };
  }

  @Post('twitter')
  async twitter() {
    return {
      message: 'Twitter',
    };
  }

  @Post('linkedin')
  async linkedin() {
    return {
      message: 'LinkedIn',
    };
  }

  @Post('whatsapp')
  async whatsapp() {
    return {
      message: 'WhatsApp',
    };
  }

  @Post('telegram')
  async telegram() {
    return {
      message: 'Telegram',
    };
  }

  @Post('slack')
  async slack() {
    return {
      message: 'Slack',
    };
  }
}
