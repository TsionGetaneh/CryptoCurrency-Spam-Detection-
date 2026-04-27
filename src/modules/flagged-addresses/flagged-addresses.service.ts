import { Injectable } from '@nestjs/common';
import { FlaggedAddressesRepository } from './flagged-addresses.repository';
import { FlaggedAddressResponseDto } from './dto/flagged-address.dto';
import { Chain } from '../../shared/enums/chain.enum';
import { FlaggedAddress } from './entities/flagged-address.entity';

@Injectable()
export class FlaggedAddressesService {
  constructor(private readonly flaggedAddressesRepository: FlaggedAddressesRepository) {}

  async checkFlagged(address: string, chain: Chain): Promise<FlaggedAddressResponseDto> {
    const flagged = await this.flaggedAddressesRepository.findByAddressAndChain(address, chain);

    if (!flagged || flagged.length === 0) {
      return { isFlagged: false, reasons: [] };
    }

    return {
      isFlagged: true,
      reasons: flagged.map((f) => f.reason),
    };
  }

  async findAll(chain?: Chain): Promise<FlaggedAddress[]> {
    if (chain) {
      return this.flaggedAddressesRepository.findByChain(chain);
    }
    return this.flaggedAddressesRepository.findAll();
  }

  async isDirectlyFlagged(address: string, chain: Chain): Promise<boolean> {
    const flagged = await this.flaggedAddressesRepository.findByAddressAndChain(address, chain);
    return flagged.some((f) => f.hopDistance === 1);
  }

  async getFlaggedAtHopDistance(address: string, chain: Chain, hopDistance: number): Promise<FlaggedAddress[]> {
    return this.flaggedAddressesRepository.findByAddressAndHopDistance(address, chain, hopDistance);
  }

  async createFlagged(data: Partial<FlaggedAddress>): Promise<FlaggedAddress> {
    return this.flaggedAddressesRepository.create(data);
  }
}
