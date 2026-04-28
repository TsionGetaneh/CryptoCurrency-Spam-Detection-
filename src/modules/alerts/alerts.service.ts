import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertSettingsEntity } from './alert-settings.entity';
import { AlertEntity } from './alert.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(AlertSettingsEntity)
    private settingsRepo: Repository<AlertSettingsEntity>,
    @InjectRepository(AlertEntity)
    private alertsRepo: Repository<AlertEntity>,
  ) {}

  async getSettings(userId?: string): Promise<AlertSettingsEntity> {
    let settings = await this.settingsRepo.findOne({
      where: { userId: userId ?? '' },
    });
    if (!settings) {
      settings = this.settingsRepo.create({ userId: userId ?? '' });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async saveSettings(
    payload: Record<string, unknown>,
    userId?: string,
  ): Promise<AlertSettingsEntity> {
    let settings = await this.settingsRepo.findOne({
      where: { userId: userId ?? '' },
    });
    if (!settings) {
      settings = this.settingsRepo.create({ userId: userId ?? '' });
    }

    if (payload['telegram'] !== undefined) {
      settings.telegram = payload['telegram'] as Record<string, string>;
    }
    if (payload['discord'] !== undefined) {
      settings.discord = payload['discord'] as Record<string, string>;
    }
    if (payload['email'] !== undefined) {
      settings.email = payload['email'] as Record<string, string>;
    }
    if (payload['rules'] !== undefined) {
      settings.rules = payload['rules'] as Record<string, unknown>;
    }

    return this.settingsRepo.save(settings);
  }

  async getAlerts(): Promise<AlertEntity[]> {
    return this.alertsRepo.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async checkAndTriggerAlerts(params: {
    fromAddress: string;
    toAddress: string;
    txHash: string;
    amount: string;
    chain: string;
    timestamp: string;
  }): Promise<void> {
    const settings = await this.getSettings();
    const rules = settings.rules ?? {};
    const minAmount = rules['minimumAmount'] as number | undefined;
    const minRisk = rules['minimumRiskScore'] as number | undefined;
    const amount = parseFloat(params.amount);

    const shouldAlert =
      (minAmount !== undefined && !isNaN(amount) && amount >= minAmount) ||
      minRisk !== undefined;

    if (shouldAlert) {
      const alert = this.alertsRepo.create({
        address: params.fromAddress,
        chain: params.chain,
        type: 'threshold',
        message: `Alert triggered for tx ${params.txHash}: amount ${params.amount}`,
      });
      await this.alertsRepo.save(alert);
    }
  }
}