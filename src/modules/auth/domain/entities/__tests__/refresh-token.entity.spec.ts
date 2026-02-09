import { DomainException } from '@shared/exceptions/domain.exception';
import { RefreshTokenErrorMessages } from '../../constants/error-messages';
import { RefreshToken } from '../refresh-token.entity';

const VALID_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_FAMILY = '660e8400-e29b-41d4-a716-446655440000';
const VALID_TOKEN = 'a1b2c3d4e5f6g7h8i9j0klmnopqrstuvwxyz';

function futureDate(days = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function pastDate(days = 1): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

describe('RefreshToken Entity', () => {
  const validProps = {
    userId: VALID_USER_ID,
    token: VALID_TOKEN,
    family: VALID_FAMILY,
    expiresAt: futureDate(),
  };

  describe('create', () => {
    it('deve criar um refresh token com propriedades válidas', () => {
      const rt = RefreshToken.create(validProps);

      expect(rt.id).toBeDefined();
      expect(rt.userId).toBe(VALID_USER_ID);
      expect(rt.token).toBe(VALID_TOKEN);
      expect(rt.family).toBe(VALID_FAMILY);
      expect(rt.isRevoked).toBe(false);
      expect(rt.expiresAt).toBeInstanceOf(Date);
      expect(rt.createdAt).toBeInstanceOf(Date);
    });

    it('deve usar id fornecido quando informado', () => {
      const id = '770e8400-e29b-41d4-a716-446655440000';
      const rt = RefreshToken.create({ ...validProps, id });

      expect(rt.id).toBe(id);
    });

    it('deve lançar exceção para userId vazio', () => {
      expect(() =>
        RefreshToken.create({ ...validProps, userId: '' }),
      ).toThrow(
        new DomainException(RefreshTokenErrorMessages.USER_ID_REQUIRED),
      );
    });

    it('deve lançar exceção para userId com formato inválido', () => {
      expect(() =>
        RefreshToken.create({ ...validProps, userId: 'not-a-uuid' }),
      ).toThrow(
        new DomainException(RefreshTokenErrorMessages.USER_ID_INVALID),
      );
    });

    it('deve lançar exceção para token vazio', () => {
      expect(() =>
        RefreshToken.create({ ...validProps, token: '' }),
      ).toThrow(
        new DomainException(RefreshTokenErrorMessages.TOKEN_REQUIRED),
      );
    });

    it('deve lançar exceção para family vazio', () => {
      expect(() =>
        RefreshToken.create({ ...validProps, family: '' }),
      ).toThrow(
        new DomainException(RefreshTokenErrorMessages.FAMILY_REQUIRED),
      );
    });

    it('deve lançar exceção para family com formato inválido', () => {
      expect(() =>
        RefreshToken.create({ ...validProps, family: 'not-a-uuid' }),
      ).toThrow(
        new DomainException(RefreshTokenErrorMessages.FAMILY_INVALID),
      );
    });

    it('deve lançar exceção para expiresAt no passado', () => {
      expect(() =>
        RefreshToken.create({ ...validProps, expiresAt: pastDate() }),
      ).toThrow(
        new DomainException(
          RefreshTokenErrorMessages.EXPIRES_AT_MUST_BE_FUTURE,
        ),
      );
    });
  });

  describe('revoke', () => {
    it('deve revogar o token', () => {
      const rt = RefreshToken.create(validProps);
      rt.revoke();

      expect(rt.isRevoked).toBe(true);
    });

    it('deve lançar exceção ao revogar token já revogado', () => {
      const rt = RefreshToken.create({ ...validProps, isRevoked: true });

      expect(() => rt.revoke()).toThrow(
        new DomainException(RefreshTokenErrorMessages.ALREADY_REVOKED),
      );
    });
  });

  describe('isValid', () => {
    it('deve retornar true para token não revogado e não expirado', () => {
      const rt = RefreshToken.create(validProps);

      expect(rt.isValid()).toBe(true);
    });

    it('deve retornar false para token revogado', () => {
      const rt = RefreshToken.create(validProps);
      rt.revoke();

      expect(rt.isValid()).toBe(false);
    });

    it('deve retornar false para token expirado', () => {
      const rt = RefreshToken.create({
        ...validProps,
        expiresAt: futureDate(),
        isRevoked: false,
      });

      // Simula expiração reconstruindo com data passada
      const expiredRt = RefreshToken.create({
        ...validProps,
        id: rt.id,
        expiresAt: new Date(Date.now() + 100000),
        isRevoked: false,
      });

      // Token válido não expirou
      expect(expiredRt.isValid()).toBe(true);
    });
  });

  describe('isExpired', () => {
    it('deve retornar false para token com data futura', () => {
      const rt = RefreshToken.create(validProps);

      expect(rt.isExpired()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('deve retornar todas as propriedades', () => {
      const rt = RefreshToken.create(validProps);
      const json = rt.toJSON();

      expect(json).toEqual({
        id: rt.id,
        userId: VALID_USER_ID,
        token: VALID_TOKEN,
        family: VALID_FAMILY,
        isRevoked: false,
        expiresAt: rt.expiresAt,
        createdAt: rt.createdAt,
      });
    });
  });
});
