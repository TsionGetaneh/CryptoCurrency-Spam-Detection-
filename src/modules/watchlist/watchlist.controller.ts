import { Controller, Get, Post, Delete, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WatchlistService } from './watchlist.service';

@ApiTags('Watchlist')
@Controller('api/v1/watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get watchlist' })
  getWatchlist() {
    return this.watchlistService.findAll();
  }

  @Get(':address')
  @ApiOperation({ summary: 'Get watchlist item' })
  getOne(@Param('address') address: string) {
    return this.watchlistService.findOne(address);
  }

  @Post()
  @ApiOperation({ summary: 'Add to watchlist' })
  add(@Body() body: { address: string; chain: string; name?: string }) {
    return this.watchlistService.add(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update watchlist item' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<{ name: string; alerts_enabled: boolean }>,
  ) {
    return this.watchlistService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove from watchlist' })
  remove(@Param('id') id: string) {
    return this.watchlistService.remove(id);
  }
}