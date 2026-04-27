import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('api/v1/transactions')
export class TransactionsController {}
