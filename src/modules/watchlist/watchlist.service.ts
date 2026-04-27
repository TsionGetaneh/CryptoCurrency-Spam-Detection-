import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from './entities/watchlist.entity';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectRepository(Watchlist)
    private readonly watchlistRepo: Repository<Watchlist>,
  ) {}

  async findAll(): Promise<Watchlist[]> {
    return this.watchlistRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Watchlist | null> {
    return this.watchlistRepo.findOne({ where: { id } });
  }

  async add(body: { address: string; chain: string; name?: string }): Promise<Watchlist> {
    const existing = await this.watchlistRepo.findOne({
      where: { address: body.address, chain: body.chain as any },
    });
    if (existing) return existing;

    const item = this.watchlistRepo.create({
      address: body.address,
      chain: body.chain as any,
    });
    return this.watchlistRepo.save(item);
  }

  async update(id: string, payload: Partial<{ name: string; alerts_enabled: boolean }>): Promise<Watchlist> {
    const item = await this.watchlistRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Watchlist item not found');

    if (payload.name !== undefined) {
      (item as any).name = payload.name;
    }
    if (payload.alerts_enabled !== undefined) {
      (item as any).alerts_enabled = payload.alerts_enabled;
    }

    return this.watchlistRepo.save(item);
  }

  async remove(id: string): Promise<void> {
    await this.watchlistRepo.delete(id);
  }
}