import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PointsTransaction } from './points-transaction.entity';
import { Repository } from 'typeorm';
import { UserService } from '../api/user';
import { TUserID } from '../api/user/user.types';

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointsTransaction)
    private readonly pointsRepository: Repository<PointsTransaction>,
    private readonly userService: UserService,
  ) {}

  // DB START

  async save(transaction: Partial<PointsTransaction>) {
    return this.pointsRepository.save(transaction);
  }

  async countSent(userId: TUserID) {
    const { totalSent }: { totalSent: string | null } =
      await this.pointsRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalSent')
        .where('transaction.fromUserId = :userId', { userId })
        .getRawOne();

    return totalSent;
  }

  async countReceived(userId: TUserID) {
    const { totalReceived }: { totalReceived: string | null } =
      // DB PAIN
      await this.pointsRepository
        .createQueryBuilder('transaction')
        .select('SUM(transaction.amount)', 'totalReceived')
        .where('transaction.toUserId = :userId', { userId })
        .getRawOne();

    return totalReceived;
  }

  // / DB END

  async reward(userId: TUserID, amount: number, message?: string) {
    const rewardTransaction = await this.save({
      fromUserId: null,
      toUserId: userId,
      amount,
      type: 'reward',
      message,
    });

    await this.countAndUpdateUserPoints(userId);

    return rewardTransaction;
  }

  async countAndUpdateUserPoints(userId: TUserID): Promise<void> {
    const totalReceived = await this.countReceived(userId);
    const totalSent = await this.countSent(userId);

    const netPoints =
      (totalReceived ? parseInt(totalReceived, 10) : 0) -
      (totalSent ? parseInt(totalSent, 10) : 0);

    await this.userService.update(userId, { points: netPoints });
  }
}
