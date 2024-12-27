import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsOptional,
} from 'class-validator';
import { Unique } from '../../common';
import { SameAs } from '../../common/validator/same-as.validator';
import { User } from '../user';

export class RegisterDTO {
  @ApiProperty({
    required: true,
    example: 'j@hn.do',
  })
  @IsEmail()
  @Unique([User])
  email: string;

  @ApiProperty({
    required: true,
    example: 'John Doe',
  })
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @MinLength(5)
  password: string;

  @ApiProperty({ required: true })
  @SameAs('password')
  passwordConfirmation: string;
}

export class LoginDTO {
  @ApiProperty({
    required: true,
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    required: true,
  })
  @IsNotEmpty()
  @MinLength(5)
  password: string;
}

export class TokenDTO {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  expiresIn: string;
  @ApiProperty()
  user: User;
}

export class GoogleMobileAuthDto {
  @ApiProperty({
    description:
      'Google ID Token, полученный в мобильном приложении (iOS/Android)',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ5NzQwYTcwYjA5...',
  })
  @IsString()
  idToken: string;

  @ApiPropertyOptional({
    description: 'Опциональный реферальный код',
    example: '123',
  })
  @IsOptional()
  @IsString()
  ref?: string;
}
