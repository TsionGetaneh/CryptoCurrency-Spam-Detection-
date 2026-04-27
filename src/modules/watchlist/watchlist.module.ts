import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchlistController } from './watchlist.controller';
import { WatchlistService } from './watchlist.service';
import { WatchlistRepository } from './watchlist.repository';
import { Watchlist } from './entities/watchlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Watchlist])],
  controllers: [WatchlistController],
  providers: [WatchlistService, WatchlistRepository],
  exports: [WatchlistService, WatchlistRepository],
})
export class WatchlistModule {}
