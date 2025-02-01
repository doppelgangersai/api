import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AgentService } from '../agent.service';

@Injectable()
export class AgentPostJob {
  constructor(private readonly agentService: AgentService) {}

  @Cron('0 */5 * * * *')
  async tick() {
    await this.agentService.post();
  }
}
