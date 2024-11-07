import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PointsTransaction } from './points-transaction.entity';
import { Repository } from 'typeorm';
import { UserService } from '../api/user';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointsTransaction)
    private readonly pointsRepository: Repository<PointsTransaction>,
    private readonly userService: UserService,
  ) {}

  async reward(userId: number, amount: number, message?: string) {
    const rewardTransaction = await this.pointsRepository.save({
      fromUserId: null,
      toUserId: userId,
      amount,
      type: 'reward',
      message,
    });

    await this.countAndUpdateUserPoints(userId);

    return rewardTransaction;
  }

  async countAndUpdateUserPoints(userId: number): Promise<void> {
    // Calculate total points received by the user
    const { totalReceived }: { totalReceived: string | null } =
      await this.pointsRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalReceived')
        .where('transaction.toUserId = :userId', { userId })
        .getRawOne();

    // Calculate total points sent by the user
    const { totalSent }: { totalSent: string | null } =
      await this.pointsRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalSent')
        .where('transaction.fromUserId = :userId', { userId })
        .getRawOne();

    // Handle null or undefined values and calculate net points
    const netPoints =
      (totalReceived ? parseInt(totalReceived, 10) : 0) -
      (totalSent ? parseInt(totalSent, 10) : 0);

    // Update the user's points in the User entity
    await this.userService.update(userId, { points: netPoints });
  }
}
