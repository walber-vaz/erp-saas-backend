import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import {
  createRbacApp,
  setupAuthenticatedUser,
  RbacTestContext,
  ORG_ID,
  TEST_MODULE_ID,
} from './setup';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import {
  RoleErrorMessages,
  PermissionErrorMessages,
} from '@modules/rbac/domain/constants/error-messages';

describe('Role E2E', () => {
  let app: INestApplication;
  let ctx: RbacTestContext;
  let accessToken: string;
  let userId: string;

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

    ({ accessToken, userId } = await setupAuthenticatedUser(ctx, [
      'RBAC_ROLE_CREATE',
      'RBAC_ROLE_READ',
      'RBAC_ROLE_UPDATE',
      'RBAC_ROLE_DELETE',
    ]));
  });

  describe('POST /api/v1/roles', () => {
    it('deve criar um role com sucesso', async () => {
      const dto = {
        name: 'Manager',
        code: 'MANAGER',
        organizationId: ORG_ID,
        description: 'Manager role',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('Manager');
      expect(response.body.code).toBe('MANAGER');
      expect(response.body.organizationId).toBe(ORG_ID);
    });

    it('deve auto-preencher organizationId do usuário autenticado', async () => {
      const dto = {
        name: 'Editor',
        code: 'EDITOR',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(201);

      expect(response.body.organizationId).toBe(ORG_ID);
    });

    it('deve retornar 400 para código duplicado', async () => {
      const dto = {
        name: 'Viewer',
        code: 'VIEWER',
        organizationId: ORG_ID,
      };

      await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(400);

      expect(response.body.message).toBe(RoleErrorMessages.CODE_ALREADY_IN_USE);
    });

    it('deve retornar 400 para dados inválidos', async () => {
      const dto = {
        name: '',
        code: '',
      };

      await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(dto)
        .expect(400);
    });
  });

  describe('GET /api/v1/roles', () => {
    it('deve listar roles da organização do usuário', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Role A', code: 'ROLE_A' });

      const response = await request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/v1/roles/:id', () => {
    it('deve buscar um role por id', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'FindMe', code: 'FIND_ME' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/roles/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.name).toBe('FindMe');
    });

    it('deve retornar 404 para role não encontrado', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/roles/550e8400-e29b-41d4-a716-446655440999')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);

      expect(response.body.message).toBe(RoleErrorMessages.NOT_FOUND);
    });
  });

  describe('PATCH /api/v1/roles/:id', () => {
    it('deve atualizar um role com sucesso', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Old Name', code: 'UPDATE_ME' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/roles/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'New Name', description: 'Updated desc' })
        .expect(200);

      expect(response.body.name).toBe('New Name');
      expect(response.body.description).toBe('Updated desc');
    });

    it('deve retornar 400 ao tentar atualizar role de sistema', async () => {
      const systemRole = Role.createSystemRole({
        name: 'Super Admin',
        code: 'SUPER_ADMIN',
      });
      await ctx.roleRepository.create(systemRole);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/roles/${systemRole.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Hacked' })
        .expect(400);

      expect(response.body.message).toBe(
        RoleErrorMessages.IS_SYSTEM_IMMUTABLE,
      );
    });

    it('deve retornar 404 para role não encontrado', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/roles/550e8400-e29b-41d4-a716-446655440999')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/roles/:id', () => {
    it('deve deletar um role com sucesso', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Delete Me', code: 'DELETE_ME' })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/roles/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const found = await ctx.roleRepository.findById(createResponse.body.id);
      expect(found).toBeNull();
    });

    it('deve retornar 400 ao tentar deletar role de sistema', async () => {
      const systemRole = Role.createSystemRole({
        name: 'Sys Role',
        code: 'SYS_ROLE',
      });
      await ctx.roleRepository.create(systemRole);

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/roles/${systemRole.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(400);

      expect(response.body.message).toBe(
        RoleErrorMessages.IS_SYSTEM_IMMUTABLE,
      );
    });
  });

  describe('POST /api/v1/roles/:id/permissions', () => {
    it('deve atribuir permissão a um role', async () => {
      const roleRes = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Perm Role', code: 'PERM_ROLE' })
        .expect(201);

      const perm = Permission.create({
        moduleId: TEST_MODULE_ID,
        code: 'RBAC_TEST_ACTION',
        resource: 'TEST',
        action: 'ACTION',
      });
      await ctx.permissionRepository.create(perm);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/roles/${roleRes.body.id}/permissions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ roleId: roleRes.body.id, permissionId: perm.id })
        .expect(201);

      expect(response.body.roleId).toBe(roleRes.body.id);
      expect(response.body.permissionId).toBe(perm.id);
    });

    it('deve retornar 404 para role não encontrado', async () => {
      const perm = Permission.create({
        moduleId: TEST_MODULE_ID,
        code: 'RBAC_TEST_X',
        resource: 'TEST',
        action: 'X',
      });
      await ctx.permissionRepository.create(perm);

      const response = await request(app.getHttpServer())
        .post('/api/v1/roles/550e8400-e29b-41d4-a716-446655440999/permissions')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          roleId: '550e8400-e29b-41d4-a716-446655440999',
          permissionId: perm.id,
        })
        .expect(404);

      expect(response.body.message).toBe(RoleErrorMessages.NOT_FOUND);
    });

    it('deve retornar 404 para permissão não encontrada', async () => {
      const roleRes = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'NoPerm Role', code: 'NOPERM_ROLE' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/roles/${roleRes.body.id}/permissions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          roleId: roleRes.body.id,
          permissionId: '550e8400-e29b-41d4-a716-446655440999',
        })
        .expect(404);

      expect(response.body.message).toBe(PermissionErrorMessages.NOT_FOUND);
    });
  });

  describe('DELETE /api/v1/roles/:id/permissions/:permissionId', () => {
    it('deve remover permissão de um role', async () => {
      const roleRes = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'RP Role', code: 'RP_ROLE' })
        .expect(201);

      const perm = Permission.create({
        moduleId: TEST_MODULE_ID,
        code: 'RBAC_RP_TEST',
        resource: 'RP',
        action: 'TEST',
      });
      await ctx.permissionRepository.create(perm);

      await request(app.getHttpServer())
        .post(`/api/v1/roles/${roleRes.body.id}/permissions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ roleId: roleRes.body.id, permissionId: perm.id })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/roles/${roleRes.body.id}/permissions/${perm.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const remaining = await ctx.rolePermissionRepository.findByRoleId(
        roleRes.body.id,
      );
      expect(remaining).toHaveLength(0);
    });
  });

  describe('GET /api/v1/roles/:id/permissions', () => {
    it('deve listar permissões de um role', async () => {
      const roleRes = await request(app.getHttpServer())
        .post('/api/v1/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'List RP', code: 'LIST_RP' })
        .expect(201);

      const perm = Permission.create({
        moduleId: TEST_MODULE_ID,
        code: 'RBAC_LP_TEST',
        resource: 'LP',
        action: 'TEST',
      });
      await ctx.permissionRepository.create(perm);

      await request(app.getHttpServer())
        .post(`/api/v1/roles/${roleRes.body.id}/permissions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ roleId: roleRes.body.id, permissionId: perm.id })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/roles/${roleRes.body.id}/permissions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0].permissionId).toBe(perm.id);
    });
  });

  describe('Autenticação e autorização', () => {
    it('deve retornar 401 sem token', async () => {
      await request(app.getHttpServer()).get('/api/v1/roles').expect(401);
    });

    it('deve retornar 403 sem permissão adequada', async () => {
      const { accessToken: limitedToken } = await setupAuthenticatedUser(
        ctx,
        [],
      );

      await request(app.getHttpServer())
        .get('/api/v1/roles')
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(403);
    });
  });
});
