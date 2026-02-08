import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import type { InMemoryOrganizationRepository } from '@modules/organization/infra/repositories/in-memory-organization.repository';
import { createOrganizationApp } from './setup';

describe('GET /api/v1/organizations', () => {
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

  it('deve listar organizações', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa 1', slug: 'empresa-1' });

    await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Empresa 2', slug: 'empresa-2' });

    const response = await request(app.getHttpServer())
      .get('/api/v1/organizations')
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.total).toBe(2);
  });

  it('deve paginar resultados', async () => {
    for (let i = 1; i <= 3; i++) {
      await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .send({ name: `Empresa ${i}`, slug: `empresa-${i}` });
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/organizations?page=1&limit=2')
      .expect(200);

    expect(response.body.data).toHaveLength(2);
    expect(response.body.total).toBe(3);
  });
});
