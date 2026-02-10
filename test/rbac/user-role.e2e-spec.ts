import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import {
  createRbacApp,
  setupAuthenticatedUser,
  RbacTestContext,
  ORG_ID,
} from './setup';
import { User } from '@modules/auth/domain/entities/user.entity';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { UserRoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { RoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';

describe('UserRole E2E', () => {
  let app: INestApplication;
  let ctx: RbacTestContext;
  let accessToken: string;
  let adminUserId: string;

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

    ({ accessToken, userId: adminUserId } = await setupAuthenticatedUser(ctx, [
      'RBAC_USER_ROLE_ASSIGN',
      'RBAC_USER_ROLE_REVOKE',
      'RBAC_USER_ROLE_READ',
    ]));
  });

  async function createTestUser(): Promise<User> {
    const passwordHash = await ctx.hashService.hash('TestPass123!');
    const user = User.create({
      organizationId: ORG_ID,
      name: `User ${Date.now()}`,
      email: `user-${Date.now()}@test.com`,
      passwordHash,
    });
    await ctx.userRepository.create(user);
    return user;
  }

  async function createTestRole(): Promise<Role> {
    const role = Role.create({
      organizationId: ORG_ID,
      name: `Role ${Date.now()}`,
      code: `ROLE_${Date.now()}`,
    });
    await ctx.roleRepository.create(role);
    return role;
  }

  describe('POST /api/v1/users/:userId/roles', () => {
    it('deve atribuir role a um usuário', async () => {
      const user = await createTestUser();
      const role = await createTestRole();

      const response = await request(app.getHttpServer())
        .post(`/api/v1/users/${user.id}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: user.id,
          roleId: role.id,
          assignedBy: adminUserId,
        })
        .expect(201);

      expect(response.body.userId).toBe(user.id);
      expect(response.body.roleId).toBe(role.id);
      expect(response.body.assignedBy).toBe(adminUserId);
    });

    it('deve retornar 404 para usuário não encontrado', async () => {
      const role = await createTestRole();
      const fakeUserId = '550e8400-e29b-41d4-a716-446655440888';

      const response = await request(app.getHttpServer())
        .post(`/api/v1/users/${fakeUserId}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: fakeUserId,
          roleId: role.id,
          assignedBy: adminUserId,
        })
        .expect(404);

      expect(response.body.message).toBe(UserErrorMessages.NOT_FOUND);
    });

    it('deve retornar 404 para role não encontrado', async () => {
      const user = await createTestUser();
      const fakeRoleId = '550e8400-e29b-41d4-a716-446655440777';

      const response = await request(app.getHttpServer())
        .post(`/api/v1/users/${user.id}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: user.id,
          roleId: fakeRoleId,
          assignedBy: adminUserId,
        })
        .expect(404);

      expect(response.body.message).toBe(RoleErrorMessages.NOT_FOUND);
    });

    it('deve retornar 400 para organização incompatível', async () => {
      const user = await createTestUser();
      const otherOrgRole = Role.create({
        organizationId: '550e8400-e29b-41d4-a716-446655440666',
        name: 'Other Org Role',
        code: `OTHER_${Date.now()}`,
      });
      await ctx.roleRepository.create(otherOrgRole);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/users/${user.id}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: user.id,
          roleId: otherOrgRole.id,
          assignedBy: adminUserId,
        })
        .expect(400);

      expect(response.body.message).toBe(
        UserRoleErrorMessages.ORGANIZATION_MISMATCH,
      );
    });

    it('deve permitir atribuir role de sistema a qualquer usuário', async () => {
      const user = await createTestUser();
      const systemRole = Role.createSystemRole({
        name: 'System Role',
        code: `SYS_${Date.now()}`,
      });
      await ctx.roleRepository.create(systemRole);

      const response = await request(app.getHttpServer())
        .post(`/api/v1/users/${user.id}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: user.id,
          roleId: systemRole.id,
          assignedBy: adminUserId,
        })
        .expect(201);

      expect(response.body.roleId).toBe(systemRole.id);
    });

    it('deve retornar 400 para dados inválidos', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/users/invalid-uuid/roles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: 'invalid-uuid',
          roleId: 'invalid-uuid',
          assignedBy: 'invalid-uuid',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/users/:userId/roles', () => {
    it('deve listar roles do usuário', async () => {
      const user = await createTestUser();
      const role = await createTestRole();

      await request(app.getHttpServer())
        .post(`/api/v1/users/${user.id}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: user.id,
          roleId: role.id,
          assignedBy: adminUserId,
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${user.id}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].roleId).toBe(role.id);
    });

    it('deve retornar lista vazia para usuário sem roles', async () => {
      const user = await createTestUser();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${user.id}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('DELETE /api/v1/users/:userId/roles/:roleId', () => {
    it('deve remover role de um usuário', async () => {
      const user = await createTestUser();
      const role = await createTestRole();

      await request(app.getHttpServer())
        .post(`/api/v1/users/${user.id}/roles`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          userId: user.id,
          roleId: role.id,
          assignedBy: adminUserId,
        })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/users/${user.id}/roles/${role.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const remaining = await ctx.userRoleRepository.findByUserId(user.id);
      expect(remaining).toHaveLength(0);
    });
  });

  describe('Autenticação e autorização', () => {
    it('deve retornar 401 sem token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/users/some-id/roles')
        .expect(401);
    });

    it('deve retornar 403 sem permissão adequada', async () => {
      const { accessToken: limitedToken } = await setupAuthenticatedUser(
        ctx,
        [],
      );
      const user = await createTestUser();

      await request(app.getHttpServer())
        .get(`/api/v1/users/${user.id}/roles`)
        .set('Authorization', `Bearer ${limitedToken}`)
        .expect(403);
    });
  });
});
