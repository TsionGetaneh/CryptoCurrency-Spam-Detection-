import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertSettingsEntity } from './alert-settings.entity';
import { AlertEntity } from './alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlertSettingsEntity, AlertEntity])],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}