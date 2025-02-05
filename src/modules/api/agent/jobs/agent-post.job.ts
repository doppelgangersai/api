import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AgentService } from '../agent.service';

@Injectable()
export class AgentPostJob {
  constructor(private readonly agentService: AgentService) {}

  @Cron('* * * * * *')
  async tick() {
    return;
    if (Math.random() > 1 / 30 / 60) {
      return;
    }
    console.log('tick');
    await this.agentService.tick();
  }
}
