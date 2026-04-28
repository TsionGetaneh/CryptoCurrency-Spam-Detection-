import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AddressesModule } from '../addresses/addresses.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { RiskScoringModule } from '../risk-scoring/risk-scoring.module';

@Module({
  imports: [AddressesModule, TransactionsModule, RiskScoringModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
