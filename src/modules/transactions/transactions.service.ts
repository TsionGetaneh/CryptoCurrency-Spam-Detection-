import { Injectable } from '@nestjs/common';
import { TransactionsRepository } from './transactions.repository';
import { Transaction } from './entities/transaction.entity';
import { Chain } from '../../shared/enums/chain.enum';
import { PaginatedResponse } from '../../shared/interfaces/paginated-response.interface';

@Injectable()
export class TransactionsService {
  constructor(private readonly transactionsRepository: TransactionsRepository) { }

  async findByTxHash(txHash: string): Promise<Transaction | null> {
    return this.transactionsRepository.findByTxHash(txHash);
  }

  async findByAddress(
    address: string,
    chain: Chain,
    limit: number,
    offset: number,
  ): Promise<PaginatedResponse<Transaction>> {
    const [data, total] = await this.transactionsRepository.findByAddress(address, chain, limit, offset);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages,
    };
  }

  async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    return this.transactionsRepository.create(data);
  }

  async getRecentTransactions(address: string, chain: Chain, hours: number = 24): Promise<Transaction[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.transactionsRepository.findRecentByAddress(address, chain, since);
  }

  async calculateVelocity(address: string, chain: Chain, hours: number = 24): Promise<number> {
    const transactions = await this.getRecentTransactions(address, chain, hours);
    let totalVolume = 0;

    for (const tx of transactions) {
      if (tx.fromAddress.toLowerCase() === address.toLowerCase()) {
        totalVolume += tx.amount;
      }
    }

    return totalVolume;
  }
}
