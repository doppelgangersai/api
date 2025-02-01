import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { AuthModule } from '../api/auth';
import { CommonModule } from './../common';
import { ConfigModule, ConfigService } from './../config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VaultModule } from '../api/vault/vault.module';
import { ChatModule } from '../api/chat';
import { ProcessModule } from '../process/process.module';
import { InstagramParserModule } from '../parsers/instagram/instagram-parser.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import {
  DB_DATABASE,
  DB_HOST,
  DB_PASSWORD,
  DB_PORT,
  DB_SYNC,
  DB_TYPE,
  DB_USERNAME,
} from '../../core/constants/environment.constants';
import { MissionModule } from '../api/mission/mission.module';
import { PointsModule } from '../points/points.module';
import { PosterModule } from '../api/poster/poster.module';
import { AgentModule } from '../api/agent/agent.module';
import { TwitterModule } from '../api/twitter/twitter.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: configService.get(DB_TYPE),
          host: configService.get(DB_HOST),
          port: configService.get(DB_PORT),
          username: configService.get(DB_USERNAME),
          password: configService.get(DB_PASSWORD),
          database: configService.get(DB_DATABASE),
          entities: [__dirname + './../**/**.entity{.ts,.js}'],
          synchronize: configService.get(DB_SYNC) === 'true',
        } as TypeOrmModuleAsyncOptions;
      },
    }),
    ScheduleModule.forRoot(),
    ConfigModule,
    // -------------------

    AgentModule,
    AuthModule,
    ChatModule,
    CommonModule,
    InstagramParserModule,
    MissionModule,
    PointsModule,
    PosterModule,
    ProcessModule,
    TwitterModule,
    VaultModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
