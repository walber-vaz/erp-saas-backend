import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { InMemoryOrganizationRepository } from '@modules/organization/infra/repositories/in-memory-organization.repository';
import { createOrganizationApp } from './setup';

const VALID_CNPJ = '31578776000117';

describe('POST /api/v1/organizations', () => {
  let app: INestApplication;
  let repository: InMemoryOrganizationRepository;

  beforeAll(async () => {
    ({ app, repository } = await createOrganizationApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    repository.clear();
  });

  it('deve criar uma organização', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa Teste', slug: 'empresa-teste' })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe('Empresa Teste');
    expect(response.body.slug).toBe('empresa-teste');
    expect(response.body.isActive).toBe(true);
  });

  it('deve criar organização com documento', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({
        name: 'Empresa Teste',
        slug: 'empresa-teste',
        document: VALID_CNPJ,
      })
      .expect(201);

    expect(response.body.document).toBe(VALID_CNPJ);
  });

  it('deve retornar 400 para slug duplicado', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa 1', slug: 'empresa' });

    const response = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa 2', slug: 'empresa' })
      .expect(400);

    expect(response.body.message).toBe('Slug já está em uso');
  });

  it('deve retornar 400 para dados inválidos', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: '', slug: '' })
      .expect(400);
  });

  it('deve retornar 400 para slug com formato inválido', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa', slug: 'INVALIDO' })
      .expect(400);
  });
});
