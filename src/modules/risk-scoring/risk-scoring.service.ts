import { Injectable } from '@nestjs/common';
import { FlaggedAddressesService } from '../flagged-addresses/flagged-addresses.service';
import { TransactionsService } from '../transactions/transactions.service';
import { AddressRelationshipsService } from '../address-relationships/address-relationships.service';
import { RiskScoreDto, RiskFactorDto } from '../addresses/dto/risk-score.dto';
import { Chain } from '../../shared/enums/chain.enum';
import { RiskCalculator } from '../../shared/utils/risk-calculator.util';

@Injectable()
export class RiskScoringService {
  // Known high-risk contract addresses (mock data - replace with real DB)
  private readonly TORNADO_CASH_ADDRESSES = [
    '0x722122df12d4e14e13ac3b6895a86e84145b6967',
    '0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936',
    '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf',
  ];

  private readonly DARKNET_ADDRESSES = [
    '0xdarknet123456789012345678901234567890123456',
    '0xblackmarket98765432109876543210987654321098',
  ];

  private readonly EXCHANGE_ADDRESSES = [
    '0xexchange12345678901234567890123456789012345',
    '0xbinancewallet987654321098765432109876543210',
  ];

  constructor(
    private readonly flaggedAddressesService: FlaggedAddressesService,
    private readonly transactionsService: TransactionsService,
    private readonly addressRelationshipsService: AddressRelationshipsService,
  ) { }

  async calculateRisk(address: string, chain: Chain): Promise<RiskScoreDto> {
    const factors: RiskFactorDto[] = [];
    let score = 0;

    // 1. Directly flagged (+60)
    const isDirectlyFlagged = await this.flaggedAddressesService.isDirectlyFlagged(address, chain);
    if (isDirectlyFlagged) {
      score += 60;
      factors.push({
        factor: 'directly_flagged',
        points: 60,
        description: 'Address is directly flagged in our database for suspicious activity',
      });
    }

    // 2. 1 hop from flagged (+40)
    const oneHopFlagged = await this.addressRelationshipsService.findNeighbors(address, chain, 1);
    for (const neighbor of oneHopFlagged) {
      const flagged = await this.flaggedAddressesService.isDirectlyFlagged(neighbor, chain);
      if (flagged) {
        score += 40;
        factors.push({
          factor: 'one_hop_from_flagged',
          points: 40,
          description: `Interacted with flagged address: ${neighbor.substring(0, 10)}...`,
        });
        break; // Only count once
      }
    }

    // 3. 2 hops from flagged (+20)
    const twoHopFlagged = await this.addressRelationshipsService.findNeighbors(address, chain, 2);
    for (const neighbor of twoHopFlagged) {
      const flagged = await this.flaggedAddressesService.isDirectlyFlagged(neighbor, chain);
      if (flagged) {
        score += 20;
        factors.push({
          factor: 'two_hops_from_flagged',
          points: 20,
          description: `Two hops away from flagged address: ${neighbor.substring(0, 10)}...`,
        });
        break;
      }
    }

    // 4. Tornado Cash interaction (+35)
    const hasTornadoInteraction = await this.checkTornadoCashInteraction(address, chain);
    if (hasTornadoInteraction) {
      score += 35;
      factors.push({
        factor: 'tornado_cash_interaction',
        points: 35,
        description: 'Address has interacted with Tornado Cash mixer',
      });
    }

    // 5. Exchange deposit (+10)
    const hasExchangeDeposit = await this.checkExchangeDeposit(address, chain);
    if (hasExchangeDeposit) {
      score += 10;
      factors.push({
        factor: 'exchange_deposit',
        points: 10,
        description: 'Address has deposited to known exchange',
      });
    }

    // 6. Darknet interaction (+50)
    const hasDarknetInteraction = await this.checkDarknetInteraction(address, chain);
    if (hasDarknetInteraction) {
      score += 50;
      factors.push({
        factor: 'darknet_interaction',
        points: 50,
        description: 'Address has interacted with darknet marketplace',
      });
    }

    // 7. Velocity > 100 ETH/day (+15)
    const velocity = await this.transactionsService.calculateVelocity(address, chain, 24);
    if (velocity > 100) {
      score += 15;
      factors.push({
        factor: 'high_velocity',
        points: 15,
        description: `High transaction velocity: ${velocity.toFixed(2)} ETH in last 24h`,
      });
    }

    // 8. New address (<7 days) with high volume (+10)
    const isNewWithHighVolume = await this.checkNewAddressHighVolume(address, chain);
    if (isNewWithHighVolume) {
      score += 10;
      factors.push({
        factor: 'new_address_high_volume',
        points: 10,
        description: 'New address with unusually high transaction volume',
      });
    }

    const finalScore = RiskCalculator.capScore(score);
    const level = RiskCalculator.calculateLevel(finalScore);
    const recommendation = RiskCalculator.getRecommendation(finalScore);

    return {
      score: finalScore,
      factors,
      recommendation,
      level,
    };
  }

  private async checkTornadoCashInteraction(address: string, chain: Chain): Promise<boolean> {
    const recentTxs = await this.transactionsService.getRecentTransactions(address, chain, 90);
    return recentTxs.some(
      (tx) =>
        this.TORNADO_CASH_ADDRESSES.includes(tx.toAddress.toLowerCase()) ||
        this.TORNADO_CASH_ADDRESSES.includes(tx.fromAddress.toLowerCase()),
    );
  }

  private async checkExchangeDeposit(address: string, chain: Chain): Promise<boolean> {
    const recentTxs = await this.transactionsService.getRecentTransactions(address, chain, 30);
    return recentTxs.some(
      (tx) =>
        tx.fromAddress.toLowerCase() === address.toLowerCase() &&
        this.EXCHANGE_ADDRESSES.includes(tx.toAddress.toLowerCase()),
    );
  }

  private async checkDarknetInteraction(address: string, chain: Chain): Promise<boolean> {
    const recentTxs = await this.transactionsService.getRecentTransactions(address, chain, 90);
    return recentTxs.some(
      (tx) =>
        this.DARKNET_ADDRESSES.includes(tx.toAddress.toLowerCase()) ||
        this.DARKNET_ADDRESSES.includes(tx.fromAddress.toLowerCase()),
    );
  }

  private async checkNewAddressHighVolume(address: string, chain: Chain): Promise<boolean> {
    const allTxs = await this.transactionsService.findByAddress(address, chain, 1000, 0);
    if (allTxs.data.length < 5) return false;

    const firstTx = allTxs.data[allTxs.data.length - 1];
    const addressAge = Date.now() - new Date(firstTx.timestamp).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (addressAge < sevenDays) {
      const totalVolume = allTxs.data.reduce((sum, tx) => sum + tx.amount, 0);
      return totalVolume > 50; // 50 ETH threshold for new address
    }

    return false;
  }
}
