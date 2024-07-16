import {
  Controller,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
  Patch,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { RequestWithUser } from './request-with-user.interface';
import { CurrentUser } from 'modules/common/decorator/current-user.decorator';
import { User } from './user.entity';

const MAX_FILE_SIZE = 1 * 1024 * 1024;

@ApiTags('user')
@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('form')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req: RequestWithUser, file, callback) => {
          const userId = req.user.id;
          const ext = extname(file.originalname);
          callback(null, `${userId}${ext}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (req, file, callback) => {
        console.log(file.mimetype)
        if (file && !file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          console.log('Unsupported');
          callback(new BadRequestException('Unsupported file type'), false);
        } else {
          callback(null, true);
        }
      },
    }),
  )
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
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    const fullName = req.body.name;
    console.log('avatar upload', req.user.id, fullName, req.body);

    if (!fullName) {
      throw new BadRequestException('Name is required');
    }

    const updateData: any = { fullName };
    if (file) {
      updateData.avatar = file.filename;
    }
    await this.userService.update(req.user.id, updateData);
    return {
      filename: file ? file.filename : null,
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
