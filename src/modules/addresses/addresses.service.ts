import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressesRepository } from './addresses.repository';
import { RiskScoringService } from '../risk-scoring/risk-scoring.service';
import { FlaggedAddressesService } from '../flagged-addresses/flagged-addresses.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AddressRelationshipsService } from '../address-relationships/address-relationships.service';
import { AddressSummaryDto } from './dto/address-summary.dto';
import { RiskScoreDto } from './dto/risk-score.dto';
import { GraphDataDto } from './dto/graph-data.dto';
import { Chain } from '../../shared/enums/chain.enum';

@Injectable()
export class AddressesService {
  constructor(
    private readonly addressesRepository: AddressesRepository,
    private readonly riskScoringService: RiskScoringService,
    private readonly flaggedAddressesService: FlaggedAddressesService,
    private readonly transactionsService: TransactionsService,
    private readonly addressRelationshipsService: AddressRelationshipsService,
  ) { }

  async getAddressSummary(address: string, chain: Chain): Promise<AddressSummaryDto> {
    let addr = await this.addressesRepository.findByAddressAndChain(address, chain);

    if (!addr) {
      // Create placeholder for new address
      addr = await this.addressesRepository.create({
        address,
        chain,
        balance: 0,
        totalReceived: 0,
        totalSent: 0,
        txCount: 0,
        riskScore: 0,
        isFlagged: false,
      });
    }

    const riskData = await this.riskScoringService.calculateRisk(address, chain);
    const flaggedData = await this.flaggedAddressesService.checkFlagged(address, chain);

    // Update risk score
    addr.riskScore = riskData.score;
    addr.isFlagged = flaggedData.isFlagged;
    await this.addressesRepository.save(addr);

    return {
      address: addr.address,
      chain: addr.chain,
      balance: addr.balance,
      totalReceived: addr.totalReceived,
      totalSent: addr.totalSent,
      txCount: addr.txCount,
      riskScore: riskData.score,
      riskFactors: riskData.factors.map((f) => f.factor),
      isFlagged: flaggedData.isFlagged,
      firstSeen: addr.firstSeen,
      lastChecked: new Date(),
    };
  }

  async getAddressTransactions(address: string, chain: Chain, limit: number, offset: number) {
    return this.transactionsService.findByAddress(address, chain, limit, offset);
  }

  async checkFlagged(address: string, chain: Chain) {
    return this.flaggedAddressesService.checkFlagged(address, chain);
  }

  async getRiskScore(address: string, chain: Chain): Promise<RiskScoreDto> {
    return this.riskScoringService.calculateRisk(address, chain);
  }

  async getGraphData(address: string, chain: Chain, depth: number): Promise<GraphDataDto> {
    return this.addressRelationshipsService.getGraphData(address, chain, depth);
  }

  async updateAddressTotals(address: string, chain: Chain, amount: number, isSender: boolean) {
    return this.addressesRepository.updateTotals(address, chain, amount, isSender);
  }

  async incrementTxCount(address: string, chain: Chain) {
    return this.addressesRepository.incrementTxCount(address, chain);
  }

  async findOrCreate(address: string, chain: Chain) {
    let addr = await this.addressesRepository.findByAddressAndChain(address, chain);
    if (!addr) {
      addr = await this.addressesRepository.create({
        address,
        chain,
        balance: 0,
        totalReceived: 0,
        totalSent: 0,
        txCount: 0,
        riskScore: 0,
        isFlagged: false,
        firstSeen: new Date(),
      });
    }
    return addr;
  }
}
