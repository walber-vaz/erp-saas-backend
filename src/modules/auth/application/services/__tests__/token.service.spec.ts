import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../token.service';

describe('TokenService', () => {
  let tokenService: TokenService;
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService({
      secret: 'test-secret-key',
      signOptions: { expiresIn: '15m' },
    });
    tokenService = new TokenService(jwtService);
  });

  describe('generateAccessToken', () => {
    it('deve gerar um access token JWT válido', () => {
      const payload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        organizationId: '660e8400-e29b-41d4-a716-446655440000',
      };

      const token = tokenService.generateAccessToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('deve conter userId e organizationId no payload', () => {
      const payload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        organizationId: '660e8400-e29b-41d4-a716-446655440000',
      };

      const token = tokenService.generateAccessToken(payload);
      const decoded = jwtService.verify(token);

      expect(decoded.sub).toBe(payload.userId);
      expect(decoded.organizationId).toBe(payload.organizationId);
    });
  });

  describe('generateRefreshToken', () => {
    it('deve gerar um refresh token como string hex', () => {
      const token = tokenService.generateRefreshToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token).toHaveLength(128);
    });

    it('deve gerar tokens diferentes a cada chamada', () => {
      const token1 = tokenService.generateRefreshToken();
      const token2 = tokenService.generateRefreshToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyAccessToken', () => {
    it('deve verificar e extrair payload de um token válido', () => {
      const payload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        organizationId: '660e8400-e29b-41d4-a716-446655440000',
      };

      const token = tokenService.generateAccessToken(payload);
      const result = tokenService.verifyAccessToken(token);

      expect(result.userId).toBe(payload.userId);
      expect(result.organizationId).toBe(payload.organizationId);
    });

    it('deve lançar erro para token inválido', () => {
      expect(() => tokenService.verifyAccessToken('token-invalido')).toThrow();
    });

    it('deve lançar erro para token expirado', () => {
      const expiredJwtService = new JwtService({
        secret: 'test-secret-key',
        signOptions: { expiresIn: '0s' },
      });
      const expiredTokenService = new TokenService(expiredJwtService);

      const token = expiredTokenService.generateAccessToken({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        organizationId: '660e8400-e29b-41d4-a716-446655440000',
      });

      expect(() => tokenService.verifyAccessToken(token)).toThrow();
    });
  });
});
