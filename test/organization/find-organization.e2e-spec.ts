import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { InMemoryOrganizationRepository } from '@modules/organization/infra/repositories/in-memory-organization.repository';
import { createOrganizationApp } from './setup';

describe('GET /api/v1/organizations/:id', () => {
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

  it('deve buscar organização por id', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa Teste', slug: 'empresa-teste' });

    const response = await request(app.getHttpServer())
      .get(`/api/v1/organizations/${created.body.id}`)
      .expect(200);

    expect(response.body.name).toBe('Empresa Teste');
  });

  it('deve retornar 404 para id inexistente', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/organizations/id-inexistente')
      .expect(404);

    expect(response.body.message).toBe('Organização não encontrada');
  });
});
