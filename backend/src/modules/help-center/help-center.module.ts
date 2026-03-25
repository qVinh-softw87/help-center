import { Module } from '@nestjs/common';
import { HelpCenterController } from './help-center.controller';
import { HelpCenterService } from './help-center.service';
import { HelpCenterMapper } from './mappers/help-center.mapper';

@Module({
  controllers: [HelpCenterController],
  providers: [HelpCenterService, HelpCenterMapper],
  exports: [HelpCenterService],
})
export class HelpCenterModule {}
