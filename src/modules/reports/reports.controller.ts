import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('api/v1/reports')
@UseGuards(JwtAuthGuard, RateLimitGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate PDF report for address' })
  async generateReport(@Body() dto: GenerateReportDto, @Res() res: Response) {
    const pdfBuffer = await this.reportsService.generatePdfReport(dto);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${dto.address}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }

  @Post('custom')
  @ApiOperation({ summary: 'Generate custom report' })
  generateCustomReport(@Body() body: any) {
    return { success: true, report: null };
  }
}