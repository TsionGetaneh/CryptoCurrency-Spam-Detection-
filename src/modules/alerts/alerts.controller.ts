import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

@ApiTags('Alerts')
@Controller('api/v1/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all alerts' })
  getAlerts() {
    return this.alertsService.getAlerts();
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get alert settings' })
  getSettings() {
    return this.alertsService.getSettings();
  }

  @Post('settings')
  @ApiOperation({ summary: 'Save alert settings' })
  saveSettings(@Body() body: any) {
    return this.alertsService.saveSettings(body);
  }
}