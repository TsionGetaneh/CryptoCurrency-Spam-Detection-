import { Injectable } from '@nestjs/common';
import { Repository, DataSource, Brackets } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Chain } from '../../shared/enums/chain.enum';

@Injectable()
export class TransactionsRepository {
  private repository: Repository<Transaction>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Transaction);
  }

  async findByTxHash(txHash: string): Promise<Transaction | null> {
    const result = await this.repository.findOne({ where: { txHash } });
    return result ?? null;
  }

  async findByAddress(
    address: string,
    chain: Chain,
    limit: number,
    offset: number,
  ): Promise<[Transaction[], number]> {
    return this.repository
      .createQueryBuilder('tx')
      .where('tx.chain = :chain', { chain })
      .andWhere(
        new Brackets((qb) => {
          qb.where('tx.fromAddress = :address', { address })
            .orWhere('tx.toAddress = :address', { address });
        }),
      )
      .orderBy('tx.timestamp', 'DESC')
      .skip(offset)
      .take(limit)
      .getManyAndCount();
  }

  async create(data: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.repository.create(data);
    return this.repository.save(transaction);
  }

  async findRecentByAddress(address: string, chain: Chain, since: Date): Promise<Transaction[]> {
    return this.repository
      .createQueryBuilder('tx')
      .where('tx.chain = :chain', { chain })
      .andWhere(
        new Brackets((qb) => {
          qb.where('tx.fromAddress = :address', { address })
            .orWhere('tx.toAddress = :address', { address });
        }),
      )
      .andWhere('tx.timestamp >= :since', { since })
      .orderBy('tx.timestamp', 'DESC')
      .getMany();
  }

  async findByFromTo(fromAddress: string, toAddress: string, chain: Chain): Promise<Transaction[]> {
    return this.repository.find({
      where: { fromAddress, toAddress, chain },
      order: { timestamp: 'DESC' },
    });
  }
}
