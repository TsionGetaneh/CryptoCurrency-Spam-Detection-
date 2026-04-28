import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Audit')
@Controller('api/v1/audit')
export class AuditController {
  @Get()
  @ApiOperation({ summary: 'Get audit log' })
  getAuditLog() {
    return { items: [] };
  }
}

@ApiTags('Indexer')
@Controller('api/v1/indexer')
export class IndexerController {
  @Get('status')
  @ApiOperation({ summary: 'Get indexer status' })
  getStatus() {
    return {
      chains: [
        { chain: 'ethereum', currentBlock: 0, lastIndexedBlock: 0, behind: 0, healthy: true },
        { chain: 'polygon', currentBlock: 0, lastIndexedBlock: 0, behind: 0, healthy: true },
      ],
      performance: [],
    };
  }
}

@ApiTags('Organization')
@Controller('api/v1/organization')
export class OrganizationController {
  @Get('keys')
  @ApiOperation({ summary: 'Get organization API keys' })
  getKeys() {
    return { keys: [] };
  }
}

@ApiTags('Search')
@Controller('api/v1/search')
export class SearchController {
  @Get()
  @ApiOperation({ summary: 'Global search' })
  search(@Query('q') q: string, @Query('chain') chain?: string) {
    return { results: [], q, chain };
  }
}

@ApiTags('Simulate')
@Controller('api/v1/simulate')
export class SimulateController {
  @Post('transaction')
  @ApiOperation({ summary: 'Simulate transaction' })
  simulateTransaction(@Body() body: any) {
    return { success: true, simulation: null };
  }
}