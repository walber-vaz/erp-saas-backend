import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { InMemoryOrganizationRepository } from '@modules/organization/infra/repositories/in-memory-organization.repository';
import { createOrganizationApp } from './setup';

describe('PATCH /api/v1/organizations/:id', () => {
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

  it('deve atualizar organização', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa Teste', slug: 'empresa-teste' });

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/organizations/${created.body.id}`)
      .send({ name: 'Novo Nome' })
      .expect(200);

    expect(response.body.name).toBe('Novo Nome');
    expect(response.body.slug).toBe('empresa-teste');
  });

  it('deve retornar 400 para slug duplicado no update', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa 1', slug: 'empresa-1' });

    const created = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa 2', slug: 'empresa-2' });

    await request(app.getHttpServer())
      .patch(`/api/v1/organizations/${created.body.id}`)
      .send({ slug: 'empresa-1' })
      .expect(400);
  });

  it('deve retornar 404 para id inexistente', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/organizations/id-inexistente')
      .send({ name: 'Teste' })
      .expect(404);
  });
});
