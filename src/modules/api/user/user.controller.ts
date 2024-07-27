import {
  Controller,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
  Patch,
  Get,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { RequestWithUser } from './request-with-user.interface';
import { CurrentUser } from 'modules/common/decorator/current-user.decorator';
import { User } from './user.entity';
import { createS3FileInterceptor } from 'modules/storage/s3-file.interceptor';

const S3AvatarFileInterceptor = createS3FileInterceptor({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  bucket: 'avatars',
});

@ApiTags('user')
@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('form')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @UseInterceptors(S3AvatarFileInterceptor)
  @ApiOperation({ summary: 'Upload avatar and update name' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image and user name',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        avatar: {
          type: 'string',
          format: 'binary',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'The data has been updated.' })
  @ApiResponse({ status: 400, description: 'Invalid file or file too large.' })
  async uploadAvatar(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: RequestWithUser,
  ) {
    const fullName = req.body.name;

    if (!fullName) {
      throw new BadRequestException('Name is required');
    }

    const updateData: any = { fullName };
    if (files && files.length > 0) {
      const fileNames = files.map((file) => file.filename);
      updateData.avatar = fileNames[0];
    }
    await this.userService.update(req.user.id, updateData);
    return {
      filenames: files ? files.map((file) => file.filename) : null,
      fullName,
    };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @ApiOperation({ summary: 'Get the logged in user' })
  @Get('me')
  @ApiResponse({ status: 200, description: 'Successful Response', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getLoggedInUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
