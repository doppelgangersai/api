import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AgentService } from '../agent.service';

@Injectable()
export class AgentPostJob {
  constructor(private readonly agentService: AgentService) {}

  @Cron('* * * * * *')
  async tick() {
    if (Math.random() > 1 / 15 / 60) {
      return;
    }
    await this.agentService.tick();
  }
}
