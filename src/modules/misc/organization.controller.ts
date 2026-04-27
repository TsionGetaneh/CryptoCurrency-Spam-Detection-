import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Organization')
@Controller('api/v1/organization')
export class OrganizationController {
  @Get('keys')
  @ApiOperation({ summary: 'Get organization API keys' })
  getKeys() {
    return { keys: [] };
  }
}