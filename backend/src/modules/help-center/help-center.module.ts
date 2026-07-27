import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { HelpCenterController } from './help-center.controller';
import { HelpCenterService } from './help-center.service';
import { HelpCenterMapper } from './mappers/help-center.mapper';

@Module({
  imports: [AuthModule, AiModule],
  controllers: [HelpCenterController],
  providers: [HelpCenterService, HelpCenterMapper],
  exports: [HelpCenterService],
})
export class HelpCenterModule {}
