import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Address } from '../../addresses/entities/address.entity';
import { Chain } from '../../../shared/enums/chain.enum';

@Entity('transactions')
@Index(['txHash', 'chain'], { unique: true })
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  txHash: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  fromAddress: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  toAddress: string;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  amount: number;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({
    type: 'enum',
    enum: Chain,
    default: Chain.ETHEREUM,
  })
  chain: Chain;

  @Column({ type: 'bigint', nullable: true })
  blockNumber: number;

  @Column({ type: 'decimal', precision: 36, scale: 18, nullable: true })
  gasPrice: number;

  @Column({ type: 'bigint', nullable: true })
  gasUsed: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Address, (addr) => addr.outgoingTransactions)
  @JoinColumn({ name: 'fromAddress', referencedColumnName: 'address' })
  fromAddressEntity: Address;

  @ManyToOne(() => Address, (addr) => addr.incomingTransactions)
  @JoinColumn({ name: 'toAddress', referencedColumnName: 'address' })
  toAddressEntity: Address;
}
