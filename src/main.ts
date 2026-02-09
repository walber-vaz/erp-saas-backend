import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/presentation/guards/jwt-auth.guard';
import { AppModule } from './app.module';
import { DomainExceptionFilter } from './shared/exceptions/domain-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiVersion = configService.get<string>('API_VERSION', 'v1');
  app.setGlobalPrefix(`api/${apiVersion}`);

  // Configurar o guard JWT como global
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter());

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
}
bootstrap();
