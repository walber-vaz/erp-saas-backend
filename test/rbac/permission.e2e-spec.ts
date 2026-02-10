import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import {
  createRbacApp,
  setupAuthenticatedUser,
  RbacTestContext,
  TEST_MODULE_ID,
} from './setup';
import { InMemoryPermissionRepository } from '@modules/rbac/infra/repositories/in-memory-permission.repository';
import { PermissionErrorMessages } from '@modules/rbac/domain/constants/error-messages';

describe('Permission E2E', () => {
  let app: INestApplication;
  let ctx: RbacTestContext;
  let accessToken: string;

  beforeAll(async () => {
    ctx = await createRbacApp();
    app = ctx.app;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    ctx.permissionRepository.clear();
    ctx.roleRepository.clear();
    ctx.rolePermissionRepository.clear();
    ctx.userRoleRepository.clear();
    ctx.roleInheritanceRepository.clear();
    ctx.userRepository.clear();
    ctx.refreshTokenRepository.clear();

    ({ accessToken } = await setupAuthenticatedUser(ctx, [
      'RBAC_PERMISSION_CREATE',
      'RBAC_PERMISSION_READ',
      'RBAC_PERMISSION_DELETE',
    ]));
  });

  describe('POST /api/v1/permissions', () => {
    it('deve criar uma permissão com sucesso', async () => {
      const dto = {
        moduleId: TEST_MODULE_ID,
        resource: 'USER',
        action: 'CREATE',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.code).toBe('RBAC_USER_CREATE');
      expect(response.body.resource).toBe('USER');
      expect(response.body.action).toBe('CREATE');
      expect(response.body.moduleId).toBe(TEST_MODULE_ID);
    });

    it('deve retornar 400 para dados inválidos', async () => {
      const dto = {
        moduleId: 'invalid-uuid',
        resource: '',
        action: '',
      };

      await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(400);
    });

    it('deve retornar 400 para código duplicado', async () => {
      const dto = {
        moduleId: TEST_MODULE_ID,
        resource: 'USER',
        action: 'READ',
      };

      await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(400);

      expect(response.body.message).toBe(
        PermissionErrorMessages.CODE_ALREADY_IN_USE,
      );
    });

    it('deve retornar 400 para módulo inexistente', async () => {
      const dto = {
        moduleId: '550e8400-e29b-41d4-a716-446655440111',
        resource: 'USER',
        action: 'CREATE',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(404);

      expect(response.body.message).toBe(
        PermissionErrorMessages.MODULE_NOT_FOUND,
      );
    });
  });

  describe('GET /api/v1/permissions', () => {
    it('deve listar todas as permissões', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ moduleId: TEST_MODULE_ID, resource: 'ITEM', action: 'LIST' });

      const response = await request(app.getHttpServer())
        .get('/api/v1/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should include setup permissions + the one we just created
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('deve filtrar por moduleId', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          moduleId: TEST_MODULE_ID,
          resource: 'REPORT',
          action: 'VIEW',
        });

      const response = await request(app.getHttpServer())
        .get('/api/v1/permissions')
        .query({ moduleId: TEST_MODULE_ID })
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((p: any) => {
        expect(p.moduleId).toBe(TEST_MODULE_ID);
      });
    });
  });

  describe('GET /api/v1/permissions/:id', () => {
    it('deve buscar uma permissão por id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          moduleId: TEST_MODULE_ID,
          resource: 'ORDER',
          action: 'DELETE',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/permissions/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.code).toBe('RBAC_ORDER_DELETE');
    });

    it('deve retornar 404 para permissão não encontrada', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/permissions/550e8400-e29b-41d4-a716-446655440999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.message).toBe(PermissionErrorMessages.NOT_FOUND);
    });
  });

  describe('DELETE /api/v1/permissions/:id', () => {
    it('deve deletar uma permissão com sucesso', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          moduleId: TEST_MODULE_ID,
          resource: 'STOCK',
          action: 'UPDATE',
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/permissions/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const found = await ctx.permissionRepository.findById(
        createResponse.body.id,
      );
      expect(found).toBeNull();
    });

    it('deve retornar 404 para permissão não encontrada', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/permissions/550e8400-e29b-41d4-a716-446655440999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.message).toBe(PermissionErrorMessages.NOT_FOUND);
    });
  });

  describe('Autenticação e autorização', () => {
    it('deve retornar 401 sem token de autenticação', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/permissions')
        .expect(401);
    });

    it('deve retornar 403 sem permissão adequada', async () => {
      const { accessToken: limitedToken } = await setupAuthenticatedUser(
        ctx,
        [],
      );

      await request(app.getHttpServer())
        .get('/api/v1/permissions')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(403);
    });
  });
});
