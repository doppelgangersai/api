import {
  Controller,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  UseGuards,
  Req,
  Patch,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { RequestWithUser } from './request-with-user.interface';
import { CurrentUser } from '../../common/decorator/current-user.decorator';
import { User } from './user.entity';
import { createS3FileInterceptor } from '../../storage/s3-file.interceptor';
import { TUserID } from './user.types';

const S3AvatarFileInterceptor = createS3FileInterceptor({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  bucket: 'avatars',
});

@ApiTags('user')
@Controller('/api/user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Patch('form')
  @ApiBearerAuth()
  @UseGuards(AuthGuard())
  @UseInterceptors(S3AvatarFileInterceptor)
  @ApiOperation({ summary: 'Upload avatar and update name' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image and user name',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        username: {
          type: 'string',
          nullable: true,
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

    if (req.body.username) {
      updateData.username = req.body.username;
    }

    await this.usersService.update(req.user.id, updateData);
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

  /**
   * Add a friend to the current user's friend list.
   * @param user - The current authenticated user.
   * @param friendId - The ID of the user to add as a friend.
   * @returns A success message.
   */
  @ApiOperation({ summary: 'Add a friend' })
  @ApiResponse({ status: 201, description: 'Friend successfully added.' })
  @ApiParam({
    name: 'friendId',
    type: 'number',
    description: 'ID of the friend to add',
  })
  @Post('friends/:friendId')
  async addFriend(
    @CurrentUser() user: Partial<User>,
    @Param('friendId') friendId: TUserID,
  ) {
    await this.usersService.addFriend(user.id, friendId);
    return { message: 'Friend successfully added' };
  }

  /**
   * Retrieve the current user's list of friends.
   * @param user - The current authenticated user.
   * @returns An array of the user's friends.
   */
  @ApiOperation({ summary: 'Get friends list' })
  @ApiResponse({
    status: 200,
    description: 'List of friends retrieved successfully.',
  })
  @Get('friends')
  async getFriends(@CurrentUser() user: Partial<User>) {
    const friends = await this.usersService.getFriends(user.id);
    return friends;
  }
}
