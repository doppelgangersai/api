import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { createS3FileInterceptor } from 'modules/storage/s3-file.interceptor';
import { RequestWithUser } from '../user/request-with-user.interface';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User, UserService } from '../user';

const S3FileInterceptor = createS3FileInterceptor({
  allowedMimeTypes: ['application/zip', 'application/x-zip-compressed'],
});

class UsernameDTO {
  @ApiProperty({ required: true, example: 'johndoe' })
  username: string;
}

@ApiTags('vault')
@ApiBearerAuth()
@Controller('/api/vault')
export class VaultController {
  constructor(private readonly userService: UserService) {}

  @Post('instagram')
  @UseGuards(AuthGuard())
  @UseInterceptors(S3FileInterceptor)
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
    return {
      message: 'Instagram archive uploaded successfully',
      filenames: files.map((file) => file.filename),
    };
  }

  @Post('linkedin')
  @UseGuards(AuthGuard())
  @UseInterceptors(S3FileInterceptor)
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
  @UseInterceptors(S3FileInterceptor)
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
  @UseInterceptors(S3FileInterceptor)
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
  @UseInterceptors(S3FileInterceptor)
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
  @UseInterceptors(S3FileInterceptor)
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
