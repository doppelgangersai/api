import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Req,
  Body,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RequestWithUser } from '../user/request-with-user.interface';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User, UserService } from '../user';
import { VaultEmitter } from './vault.emitter';
import { UsernameDTO } from './vault.dtos';
import { VaultFileInterceptor } from './vault.interceptors';
import { PointsService } from '../../points/points.service';

@ApiTags('vault')
@ApiBearerAuth()
@Controller('/api/vault')
export class VaultController {
  constructor(
    private readonly userService: UserService,
    private readonly vaultEmitter: VaultEmitter,
    private readonly pointsService: PointsService,
  ) {}

  @Post('instagram')
  @UseGuards(AuthGuard())
  @UseInterceptors(VaultFileInterceptor)
  @ApiOperation({ summary: 'Upload Instagram archive' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Instagram archive',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        archive: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The archive has been uploaded.' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large.' })
  async instagram(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }
    await this.userService.update(req.user.id, {
      instagramFile: files[0].filename,
    });
    if (!req.user.instagramFile) {
      await this.userService.reward(req.user.id, 20);
    }
    this.vaultEmitter.emitInstagramUploaded(req.user.id);
    return {
      message: 'Instagram archive uploaded successfully',
      filenames: files.map((file) => file.filename),
    };
  }

  @Get('instagram/trigger/uploaded')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Trigger Instagram archive processing' })
  triggerInstagram(@CurrentUser() user: User) {
    this.vaultEmitter.emitInstagramUploaded(user.id);
    return {
      message: 'Instagram archive processing triggered',
    };
  }

  @Get('instagram/trigger/preprocessed')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Trigger Instagram archive preprocessed' })
  triggerInstagramPreprocessed(@CurrentUser() user: User) {
    this.vaultEmitter.emitInstagramPreprocessed(user.id);
    return {
      message: 'Instagram archive preprocessed triggered',
    };
  }

  @Post('linkedin')
  @UseGuards(AuthGuard())
  @UseInterceptors(VaultFileInterceptor)
  @ApiOperation({ summary: 'Upload LinkedIn archive' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'LinkedIn archive',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        archive: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The archive has been uploaded.' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large.' })
  async linkedin(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }
    await this.userService.update(req.user.id, {
      linkedInFile: files[0].filename,
    });
    if (!req.user.linkedInFile) {
      await this.userService.reward(req.user.id, 20);
    }
    return {
      message: 'LinkedIn archive uploaded successfully',
      filenames: files.map((file) => file.filename),
    };
  }

  @Post('whatsapp')
  @UseGuards(AuthGuard())
  @UseInterceptors(VaultFileInterceptor)
  @ApiOperation({ summary: 'Upload WhatsApp archive' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'WhatsApp archive',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        archive: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The archive has been uploaded.' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large.' })
  async whatsapp(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }
    await this.userService.update(req.user.id, {
      whatsAppFile: files[0].filename,
    });
    if (!req.user.whatsAppFile) {
      await this.userService.reward(req.user.id, 20);
    }
    return {
      message: 'WhatsApp archive uploaded successfully',
      filenames: files.map((file) => file.filename),
    };
  }

  @Post('facebook')
  @UseGuards(AuthGuard())
  @UseInterceptors(VaultFileInterceptor)
  @ApiOperation({ summary: 'Upload Facebook archive' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Facebook archive',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        archive: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The archive has been uploaded.' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large.' })
  async facebook(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }
    await this.userService.update(req.user.id, {
      facebookFile: files[0].filename,
    });
    if (!req.user.facebookFile) {
      await this.userService.reward(req.user.id, 20);
    }
    return {
      message: 'Facebook archive uploaded successfully',
      filenames: files.map((file) => file.filename),
    };
  }

  @Post('messenger')
  @UseGuards(AuthGuard())
  @UseInterceptors(VaultFileInterceptor)
  @ApiOperation({ summary: 'Upload Messenger archive' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Messenger archive',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        archive: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The archive has been uploaded.' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large.' })
  async messenger(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }
    await this.userService.update(req.user.id, {
      messengerFile: files[0].filename,
    });
    if (!req.user.messengerFile) {
      await this.userService.reward(req.user.id, 20);
    }
    return {
      message: 'Messenger archive uploaded successfully',
      filenames: files.map((file) => file.filename),
    };
  }

  @Post('x')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Connect to X (formerly Twitter)' })
  async x(@Body() { username }: UsernameDTO, @CurrentUser() user: User) {
    await this.userService.update(user.id, { xUsername: username });
    if (!user.xUsername) {
      await this.userService.reward(user.id, 20);
    }
    return {
      username,
      message: 'Connected to X',
    };
  }

  @Post('telegram')
  @UseGuards(AuthGuard())
  @UseInterceptors(VaultFileInterceptor)
  @ApiOperation({ summary: 'Upload Telegram archive' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Telegram archive',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        archive: {
          type: 'string',
          format: 'binary',
          nullable: false,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The archive has been uploaded.' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large.' })
  async telegram(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No file uploaded');
    }
    await this.userService.update(req.user.id, {
      telegramFile: files[0].filename,
    });
    if (!req.user.telegramFile) {
      await this.userService.reward(req.user.id, 20);
    }
    return {
      message: 'Telegram archive uploaded successfully',
      filenames: files.map((file) => file.filename),
    };
  }

  @Post('slack')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Connect to Slack' })
  async slack() {
    return {
      message: 'Connected to Slack',
    };
  }

  @Post('tiktok')
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Connect to TikTok' })
  async tiktok(@Body() { username }: UsernameDTO, @CurrentUser() user: User) {
    await this.userService.update(user.id, { tikTokUsername: username });
    if (!user.tikTokUsername) {
      await this.userService.reward(user.id, 20);
    }
    return {
      username,
      message: 'Connected to TikTok',
    };
  }
}
