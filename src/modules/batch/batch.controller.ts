import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BatchService } from './batch.service';
import { BatchCheckDto } from './dto/batch-check.dto';
import { AddressSummaryDto } from '../addresses/dto/address-summary.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Batch Operations')
@Controller('api/v1/batch')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post('check-addresses')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check multiple addresses for risk scores and balances' })
  @ApiResponse({ status: 200, type: [AddressSummaryDto] })
  async checkAddresses(@Body() dto: BatchCheckDto): Promise<AddressSummaryDto[]> {
    return this.batchService.checkAddresses(dto);
  }

  @Post('analyze')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Analyze addresses from a CSV file' })
  async analyzeCsv(@UploadedFile() file: Express.Multer.File) {
    return this.batchService.analyzeCsv(file);
  }
}
