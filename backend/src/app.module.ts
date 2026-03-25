import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HelpCenterModule } from './modules/help-center/help-center.module';

@Module({
  imports: [PrismaModule, AuthModule, HelpCenterModule],
})
export class AppModule {}
