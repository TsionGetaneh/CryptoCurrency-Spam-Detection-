import { Module } from '@nestjs/common';
import {
  AuditController,
  IndexerController,
  OrganizationController,
  SearchController,
  SimulateController,
} from './misc.controllers';

@Module({
  controllers: [
    AuditController,
    IndexerController,
    OrganizationController,
    SearchController,
    SimulateController,
  ],
})
export class MiscModule {}