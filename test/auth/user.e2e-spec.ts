import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { RegisterUserDto } from '@modules/auth/application/dtos/register-user.dto';
import { LoginDto } from '@modules/auth/application/dtos/login.dto';
import { InMemoryUserRepository } from '@modules/auth/infra/repositories/in-memory-user.repository';
import { createAuthApp } from './setup';
import { User } from '@modules/auth/domain/entities/user.entity';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('User E2E', () => {
  let app: INestApplication;
  let userRepository: InMemoryUserRepository;
  let adminAccessToken: string;
  let adminUserId: string;

  const adminRegisterDto: RegisterUserDto = {
    organizationId: ORG_ID,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'AdminPassword123!',
  };

  beforeAll(async () => {
    ({ app, userRepository } = await createAuthApp());

    const registerResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(adminRegisterDto)
      .expect(201);
    adminUserId = registerResponse.body.id;

    const loginDto: LoginDto = {
      organizationId: ORG_ID,
      email: adminRegisterDto.email,
      password: adminRegisterDto.password,
    };

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(loginDto)
      .expect(200);
    adminAccessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    userRepository.clear();
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(adminRegisterDto)
      .expect(201);
    const loginDto: LoginDto = {
      organizationId: ORG_ID,
      email: adminRegisterDto.email,
      password: adminRegisterDto.password,
    };
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send(loginDto)
      .expect(200);
    adminAccessToken = loginResponse.body.accessToken;
  });

  describe('GET /users', () => {
    it('deve retornar 401 se não autenticado', async () => {
      await request(app.getHttpServer()).get('/api/v1/users').expect(401);
    });

    it('deve listar usuários da organização', async () => {
      const user1 = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          organizationId: ORG_ID,
          name: 'User One',
          email: 'user1@example.com',
          password: 'Password123!',
        })
        .expect(201);

      const user2 = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          organizationId: ORG_ID,
          name: 'User Two',
          email: 'user2@example.com',
          password: 'Password123!',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3); // Admin + User1 + User2
      expect(response.body.total).toBe(3);
      expect(response.body.data.map((u: User) => u.email)).toEqual(
        expect.arrayContaining([
          adminRegisterDto.email,
          user1.body.email,
          user2.body.email,
        ]),
      );
    });
  });

  describe('GET /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          organizationId: ORG_ID,
          name: 'Find Me User',
          email: 'findme@example.com',
          password: 'Password123!',
        })
        .expect(201);
      userId = registerResponse.body.id;
    });

    it('deve retornar 401 se não autenticado', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`)
        .expect(401);
    });

    it('deve buscar um usuário pelo ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe('findme@example.com');
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/users/non-existent-id`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          organizationId: ORG_ID,
          name: 'Update Target User',
          email: 'update@example.com',
          password: 'Password123!',
        })
        .expect(201);
      userId = registerResponse.body.id;
    });

    it('deve retornar 401 se não autenticado', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .send({ name: 'Updated' })
        .expect(401);
    });

    it('deve atualizar o nome de um usuário', async () => {
      const newName = 'Updated Name';
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: newName })
        .expect(200);

      expect(response.body.name).toBe(newName);
      const updatedUser = await userRepository.findById(userId);
      expect(updatedUser).not.toBeNull();
      expect(updatedUser!.name).toBe(newName);
    });

    it('deve atualizar o email de um usuário', async () => {
      const newEmail = 'new-email@example.com';
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ email: newEmail })
        .expect(200);

      expect(response.body.email).toBe(newEmail);
      const updatedUser = await userRepository.findById(userId);
      expect(updatedUser).not.toBeNull();
      expect(updatedUser!.email).toBe(newEmail);
    });

    it('deve retornar 400 se o email já estiver em uso', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          organizationId: ORG_ID,
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'Password123!',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .patch(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ email: 'existing@example.com' })
        .expect(400);

      expect(response.body.message).toBe(
        'Email já está em uso nesta organização',
      );
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/users/non-existent-id`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ name: 'Update Failed' })
        .expect(404);
    });
  });

  describe('DELETE /users/:id', () => {
    let userId: string;

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          organizationId: ORG_ID,
          name: 'Deactivate Target User',
          email: 'deactivate@example.com',
          password: 'Password123!',
        })
        .expect(201);
      userId = registerResponse.body.id;
    });

    it('deve retornar 401 se não autenticado', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}`)
        .expect(401);
    });

    it('deve desativar um usuário', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      const deactivatedUser = await userRepository.findById(userId);
      expect(deactivatedUser).not.toBeNull();
      expect(deactivatedUser!.isActive).toBe(false);
    });

    it('deve retornar 400 se o usuário já estiver inativo', async () => {
      const user = await userRepository.findById(userId);
      user!.deactivate();
      await userRepository.update(user!);

      const response = await request(app.getHttpServer())
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(400);

      expect(response.body.message).toBe('Usuário já está inativo');
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/users/non-existent-id`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(404);
    });
  });
});
