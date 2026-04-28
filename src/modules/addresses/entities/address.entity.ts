import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Chain } from '../../../shared/enums/chain.enum';

@Entity('addresses')
@Index(['address', 'chain'], { unique: true })
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  address: string;

  @Column({
    type: 'enum',
    enum: Chain,
    default: Chain.ETHEREUM,
  })
  chain: Chain;

  @Column({ type: 'timestamp', nullable: true })
  firstSeen: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastChecked: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: 0 })
  totalReceived: number;

  @Column({ type: 'decimal', precision: 36, scale: 18, default: 0 })
  totalSent: number;

  @Column({ type: 'int', default: 0 })
  txCount: number;

  @Column({ type: 'boolean', default: false })
  isFlagged: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, (tx) => tx.fromAddressEntity)
  outgoingTransactions: Transaction[];

  @OneToMany(() => Transaction, (tx) => tx.toAddressEntity)
  incomingTransactions: Transaction[];
}
