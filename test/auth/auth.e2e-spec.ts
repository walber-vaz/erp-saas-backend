import request from 'supertest';
import type { INestApplication } from '@nestjs/common';
import { RegisterUserDto } from '@modules/auth/application/dtos/register-user.dto';
import { LoginDto } from '@modules/auth/application/dtos/login.dto';
import { InMemoryUserRepository } from '@modules/auth/infra/repositories/in-memory-user.repository';
import { InMemoryRefreshTokenRepository } from '@modules/auth/infra/repositories/in-memory-refresh-token.repository';
import { createAuthApp } from './setup';
import { HashService } from '@modules/auth/application/services/hash.service';
import { User } from '@modules/auth/domain/entities/user.entity';
import { JwtPayload } from '@modules/auth/infra/strategies/jwt.strategy';
import type { JwtService } from '@nestjs/jwt';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('Auth E2E', () => {
  let app: INestApplication;
  let userRepository: InMemoryUserRepository;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let hashService: HashService;
  let jwtService: JwtService;

  beforeAll(async () => {
    ({ app, userRepository, refreshTokenRepository, hashService, jwtService } =
      await createAuthApp()); // Added jwtService
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    userRepository.clear();
    refreshTokenRepository.clear();
  });

  describe('POST /auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const registerDto: RegisterUserDto = {
        organizationId: ORG_ID,
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe(registerDto.name);
      expect(response.body.email).toBe(registerDto.email);
      expect(response.body).not.toHaveProperty('passwordHash');

      const createdUser = await userRepository.findById(response.body.id);
      expect(createdUser).toBeInstanceOf(User);
      expect(
        await hashService.compare(
          registerDto.password,
          createdUser!.passwordHash,
        ),
      ).toBe(true);
    });

    it('deve retornar 400 se o email já estiver em uso', async () => {
      const registerDto: RegisterUserDto = {
        organizationId: ORG_ID,
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.message).toBe(
        'Email já está em uso nesta organização',
      );
    });

    it('deve retornar 400 para dados de registro inválidos', async () => {
      const registerDto: RegisterUserDto = {
        organizationId: ORG_ID,
        name: '',
        email: 'invalid-email',
        password: '123',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'Nome é obrigatório',
          'Nome deve ter no mínimo 2 caracteres',
          'Email deve ter um formato válido',
          'Senha deve ter no mínimo 8 caracteres',
        ]),
      );
    });
  });

  describe('POST /auth/login', () => {
    const registerDto: RegisterUserDto = {
      organizationId: ORG_ID,
      name: 'Login User',
      email: 'login@example.com',
      password: 'LoginPassword123!',
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);
    });

    it('deve fazer login com sucesso e retornar tokens', async () => {
      const loginDto: LoginDto = {
        organizationId: ORG_ID,
        email: registerDto.email,
        password: registerDto.password,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(registerDto.email);
    });

    it('deve retornar 400 para credenciais inválidas', async () => {
      const loginDto: LoginDto = {
        organizationId: ORG_ID,
        email: registerDto.email,
        password: 'WrongPassword!',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(400);

      expect(response.body.message).toBe('Email ou senha inválidos');
    });

    it('deve retornar 400 se o usuário estiver inativo', async () => {
      const user = await userRepository.findByEmail(ORG_ID, registerDto.email);
      user!.deactivate();
      await userRepository.update(user!);

      const loginDto: LoginDto = {
        organizationId: ORG_ID,
        email: registerDto.email,
        password: registerDto.password,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(400);

      expect(response.body.message).toBe('Usuário está inativo');
    });
  });

  describe('POST /auth/refresh', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      const registerDto: RegisterUserDto = {
        organizationId: ORG_ID,
        name: 'Refresh User',
        email: 'refresh@example.com',
        password: 'RefreshPassword123!',
      };

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);

      const loginDto: LoginDto = {
        organizationId: ORG_ID,
        email: registerDto.email,
        password: registerDto.password,
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);

      accessToken = loginResponse.body.accessToken;
      refreshToken = loginResponse.body.refreshToken;

      // Introduce a small delay to ensure iat/exp claims are different
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    it('deve renovar o access token com um refresh token válido', async () => {
      // Decode original accessToken
      const decodedOriginal = jwtService.decode(accessToken) as JwtPayload;

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      // Decode new accessToken
      const decodedNew = jwtService.decode(
        response.body.accessToken,
      ) as JwtPayload;

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.accessToken).not.toBe(accessToken); // Keep as sanity check
      expect(response.body.refreshToken).not.toBe(refreshToken);

      // Assert that the new token's iat is greater than the original token's iat
      expect(decodedNew.iat).toBeGreaterThan(decodedOriginal.iat);

      const oldRefreshTokenEntity =
        await refreshTokenRepository.findByToken(refreshToken);
      expect(oldRefreshTokenEntity!.isRevoked).toBe(true);
    });

    it('deve retornar 400 para refresh token inválido', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(404);

      expect(response.body.message).toBe('Refresh token não encontrado');
    });

    it('deve retornar 400 para refresh token revogado', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200); // Token is now revoked

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(400);

      expect(response.body.message).toBe('Refresh token foi revogado');
    });

    it('deve retornar 400 para refresh token expirado', async () => {
      const expiredRefreshToken =
        await refreshTokenRepository.findByToken(refreshToken);
      vi.useFakeTimers();
      vi.setSystemTime(
        new Date(expiredRefreshToken!.expiresAt.getTime() + 1000),
      ); // Advance time past expiration

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(400);

      expect(response.body.message).toBe('Refresh token expirado');
      vi.useRealTimers();
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      const registerDto: RegisterUserDto = {
        organizationId: ORG_ID,
        name: 'Logout User',
        email: 'logout@example.com',
        password: 'LogoutPassword123!',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);

      userId = registerResponse.body.id;

      const loginDto: LoginDto = {
        organizationId: ORG_ID,
        email: registerDto.email,
        password: registerDto.password,
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);

      accessToken = loginResponse.body.accessToken;
      refreshToken = loginResponse.body.refreshToken;
    });

    it('deve fazer logout com sucesso e revogar o token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(204);

      const revokedToken =
        await refreshTokenRepository.findByToken(refreshToken);
      expect(revokedToken!.isRevoked).toBe(true);
    });

    it('deve retornar 401 se não autenticado', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('POST /auth/logout-all', () => {
    let accessToken: string;
    let userId: string;
    let firstRefreshToken: string;
    let secondRefreshToken: string;

    beforeEach(async () => {
      const registerDto: RegisterUserDto = {
        organizationId: ORG_ID,
        name: 'Logout All User',
        email: 'logoutall@example.com',
        password: 'LogoutAllPassword123!',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);

      userId = registerResponse.body.id;

      const loginDto: LoginDto = {
        organizationId: ORG_ID,
        email: registerDto.email,
        password: registerDto.password,
      };

      const loginResponse1 = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);
      accessToken = loginResponse1.body.accessToken;
      firstRefreshToken = loginResponse1.body.refreshToken;

      // Simulate login from another device
      const loginResponse2 = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);
      secondRefreshToken = loginResponse2.body.refreshToken;
    });

    it('deve revogar todos os refresh tokens do usuário', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const tokens = await refreshTokenRepository.findByUserId(userId);
      expect(tokens.every((token) => token.isRevoked)).toBe(true);
    });

    it('deve retornar 401 se não autenticado', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout-all')
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;
    let userId: string;
    const registerDto: RegisterUserDto = {
      organizationId: ORG_ID,
      name: 'Me User',
      email: 'me@example.com',
      password: 'MePassword123!',
    };

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);
      userId = registerResponse.body.id;

      const loginDto: LoginDto = {
        organizationId: ORG_ID,
        email: registerDto.email,
        password: registerDto.password,
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);
      accessToken = loginResponse.body.accessToken;
    });

    it('deve retornar informações do usuário autenticado', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.name).toBe(registerDto.name);
      expect(response.body.email).toBe(registerDto.email);
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('deve retornar 401 se não autenticado', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });
  });

  describe('PATCH /auth/me', () => {
    let accessToken: string;
    let userId: string;
    const registerDto: RegisterUserDto = {
      organizationId: ORG_ID,
      name: 'Update Me User',
      email: 'updateme@example.com',
      password: 'UpdateMePassword123!',
    };

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);
      userId = registerResponse.body.id;

      const loginDto: LoginDto = {
        organizationId: ORG_ID,
        email: registerDto.email,
        password: registerDto.password,
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);
      accessToken = loginResponse.body.accessToken;
    });

    it('deve atualizar o usuário autenticado', async () => {
      const newName = 'Updated Name';
      const newEmail = 'updated@example.com';
      const response = await request(app.getHttpServer())
        .patch('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: newName, email: newEmail })
        .expect(200);

      expect(response.body.name).toBe(newName);
      expect(response.body.email).toBe(newEmail);

      const updatedUser = await userRepository.findById(userId);
      expect(updatedUser!.name).toBe(newName);
      expect(updatedUser!.email).toBe(newEmail);
    });

    it('deve retornar 400 se o novo email já estiver em uso', async () => {
      const anotherRegisterDto: RegisterUserDto = {
        organizationId: ORG_ID,
        name: 'Another User',
        email: 'another@example.com',
        password: 'AnotherPassword123!',
      };
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(anotherRegisterDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .patch('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: anotherRegisterDto.email })
        .expect(400);

      expect(response.body.message).toBe(
        'Email já está em uso nesta organização',
      );
    });
  });

  describe('PATCH /auth/me/password', () => {
    let accessToken: string;
    let userId: string;
    const currentPassword = 'ChangePassword123!';
    const registerDto: RegisterUserDto = {
      organizationId: ORG_ID,
      name: 'Change Password User',
      email: 'changepass@example.com',
      password: currentPassword,
    };

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerDto)
        .expect(201);
      userId = registerResponse.body.id;

      const loginDto: LoginDto = {
        organizationId: ORG_ID,
        email: registerDto.email,
        password: registerDto.password,
      };

      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(loginDto)
        .expect(200);
      accessToken = loginResponse.body.accessToken;
    });

    it('deve alterar a senha do usuário e revogar todos os tokens', async () => {
      const newPassword = 'NewSecurePassword123!';
      await request(app.getHttpServer())
        .patch('/api/v1/auth/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword, newPassword })
        .expect(204);

      const user = await userRepository.findById(userId);
      expect(await hashService.compare(newPassword, user!.passwordHash)).toBe(
        true,
      );

      const tokens = await refreshTokenRepository.findByUserId(userId);
      expect(tokens.every((token) => token.isRevoked)).toBe(true);
    });

    it('deve retornar 400 para senha atual incorreta', async () => {
      const newPassword = 'NewSecurePassword123!';
      const response = await request(app.getHttpServer())
        .patch('/api/v1/auth/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'WrongCurrentPassword', newPassword })
        .expect(400);

      expect(response.body.message).toBe('Senha atual incorreta');
    });
  });
});
