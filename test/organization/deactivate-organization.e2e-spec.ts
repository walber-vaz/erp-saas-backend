import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { InMemoryOrganizationRepository } from '@modules/organization/infra/repositories/in-memory-organization.repository';
import { createOrganizationApp } from './setup';

describe('DELETE /api/v1/organizations/:id', () => {
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

  it('deve desativar organização (soft delete)', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa Teste', slug: 'empresa-teste' });

    await request(app.getHttpServer())
      .delete(`/api/v1/organizations/${created.body.id}`)
      .expect(200);

    const found = await request(app.getHttpServer())
      .get(`/api/v1/organizations/${created.body.id}`)
      .expect(200);

    expect(found.body.isActive).toBe(false);
  });

  it('deve retornar 400 ao desativar organização já inativa', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa Teste', slug: 'empresa-teste' });

    await request(app.getHttpServer())
      .delete(`/api/v1/organizations/${created.body.id}`);

    await request(app.getHttpServer())
      .delete(`/api/v1/organizations/${created.body.id}`)
      .expect(400);
  });

  it('deve retornar 404 para id inexistente', async () => {
    await request(app.getHttpServer())
      .delete('/api/v1/organizations/id-inexistente')
      .expect(404);
  });
});
