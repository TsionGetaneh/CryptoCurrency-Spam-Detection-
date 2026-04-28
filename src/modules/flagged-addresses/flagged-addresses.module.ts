import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlaggedAddressesController } from './flagged-addresses.controller';
import { FlaggedAddressesService } from './flagged-addresses.service';
import { FlaggedAddressesRepository } from './flagged-addresses.repository';
import { FlaggedAddress } from './entities/flagged-address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlaggedAddress])],
  controllers: [FlaggedAddressesController],
  providers: [FlaggedAddressesService, FlaggedAddressesRepository],
  exports: [FlaggedAddressesService, FlaggedAddressesRepository],
})
export class FlaggedAddressesModule {}
