import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrganizationModule } from './modules/organization/organization.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './shared/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    OrganizationModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
