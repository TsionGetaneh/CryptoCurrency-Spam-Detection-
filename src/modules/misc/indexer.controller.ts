import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Indexer')
@Controller('api/v1/indexer')
export class IndexerController {
  @Get('status')
  @ApiOperation({ summary: 'Get indexer status' })
  getStatus() {
    return {
      chains: [
        {
          chain: 'ethereum',
          currentBlock: 0,
          lastIndexedBlock: 0,
          behind: 0,
          healthy: true,
        },
        {
          chain: 'polygon',
          currentBlock: 0,
          lastIndexedBlock: 0,
          behind: 0,
          healthy: true,
        },
      ],
      performance: [],
    };
  }
}