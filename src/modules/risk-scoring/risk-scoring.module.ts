import { Module } from '@nestjs/common';
import { RiskScoringService } from './risk-scoring.service';
import { RiskScoringController } from './risk-scoring.controller';
import { FlaggedAddressesModule } from '../flagged-addresses/flagged-addresses.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { AddressRelationshipsModule } from '../address-relationships/address-relationships.module';

@Module({
  imports: [FlaggedAddressesModule, TransactionsModule, AddressRelationshipsModule],
  controllers: [RiskScoringController],
  providers: [RiskScoringService],
  exports: [RiskScoringService],
})
export class RiskScoringModule {}
