import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { HelpCenterModule } from './modules/help-center/help-center.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HelpCenterModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 5 * 60 * 1000, // default TTL 5 minutes
    }),
  ],
})
export class AppModule {}
