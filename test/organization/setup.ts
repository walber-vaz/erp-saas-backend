import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DomainExceptionFilter } from '@shared/exceptions/domain-exception.filter';
import { OrganizationRepository } from '@modules/organization/domain/repositories/organization.repository';
import { InMemoryOrganizationRepository } from '@modules/organization/infra/repositories/in-memory-organization.repository';
import { OrganizationModule } from '@modules/organization/organization.module';

export async function createOrganizationApp() {
  const repository = new InMemoryOrganizationRepository();

  const moduleRef = await Test.createTestingModule({
    imports: [OrganizationModule],
  })
    .overrideProvider(OrganizationRepository)
    .useValue(repository)
    .compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());
  await app.init();

  return { app, repository };
}
