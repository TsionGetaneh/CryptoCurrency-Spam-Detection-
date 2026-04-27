import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FlaggedAddressesService } from './flagged-addresses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Chain } from '../../shared/enums/chain.enum';

@ApiTags('Flagged Addresses')
@ApiBearerAuth()
@Controller('api/v1/flagged')
export class FlaggedAddressesController {
  constructor(private readonly flaggedAddressesService: FlaggedAddressesService) {}

  @Get(':address')
  @ApiOperation({ summary: 'Check if address is flagged' })
  async check(@Param('address') address: string, @Query('chain') chain: Chain = Chain.ETHEREUM) {
    return this.flaggedAddressesService.checkFlagged(address, chain);
  }

  @Get()
  @ApiOperation({ summary: 'Get all flagged addresses' })
  async getAll(@Query('chain') chain?: Chain) {
    return this.flaggedAddressesService.findAll(chain);
  }
}
