import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamEntity } from './team.entity';
import { TeamActivityEntity } from './team-activity.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamEntity)
    private teamsRepo: Repository<TeamEntity>,
    @InjectRepository(TeamActivityEntity)
    private activityRepo: Repository<TeamActivityEntity>,
  ) {}

  async getTeams(): Promise<TeamEntity[]> {
    return this.teamsRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getActivity(teamId: string): Promise<TeamActivityEntity[]> {
    return this.activityRepo.find({
      where: { teamId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async invite(teamId: string, email: string): Promise<void> {
    const activity = this.activityRepo.create({
      teamId,
      actor: 'System',
      action: `Invited ${email}`,
    });
    await this.activityRepo.save(activity);
  }

  async getPresence(teamId: string) {
    return { teamId, online: [] };
  }
}
