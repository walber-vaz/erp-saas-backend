import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RefreshTokenErrorMessages } from '../constants/error-messages';

export interface RefreshTokenProps {
  id?: string;
  userId: string;
  token: string;
  family: string;
  isRevoked?: boolean;
  expiresAt: Date;
  createdAt?: Date;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class RefreshToken {
  readonly id: string;
  readonly userId: string;
  readonly token: string;
  readonly family: string;
  private _isRevoked: boolean;
  readonly expiresAt: Date;
  readonly createdAt: Date;

  private constructor(props: Required<RefreshTokenProps>) {
    this.id = props.id;
    this.userId = props.userId;
    this.token = props.token;
    this.family = props.family;
    this._isRevoked = props.isRevoked;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }

  get isRevoked(): boolean {
    return this._isRevoked;
  }

  static create(props: RefreshTokenProps): RefreshToken {
    RefreshToken.validateUserId(props.userId);
    RefreshToken.validateToken(props.token);
    RefreshToken.validateFamily(props.family);
    RefreshToken.validateExpiresAt(props.expiresAt);

    return new RefreshToken({
      id: props.id ?? uuidv7(),
      userId: props.userId,
      token: props.token,
      family: props.family,
      isRevoked: props.isRevoked ?? false,
      expiresAt: props.expiresAt,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  revoke(): void {
    if (this._isRevoked) {
      throw new DomainException(RefreshTokenErrorMessages.ALREADY_REVOKED);
    }
    this._isRevoked = true;
  }

  isValid(): boolean {
    return !this._isRevoked && this.expiresAt > new Date();
  }

  isExpired(): boolean {
    return this.expiresAt <= new Date();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      token: this.token,
      family: this.family,
      isRevoked: this._isRevoked,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
    };
  }

  private static validateUserId(userId: string): void {
    if (!userId) {
      throw new DomainException(RefreshTokenErrorMessages.USER_ID_REQUIRED);
    }
    if (!UUID_REGEX.test(userId)) {
      throw new DomainException(RefreshTokenErrorMessages.USER_ID_INVALID);
    }
  }

  private static validateToken(token: string): void {
    if (!token) {
      throw new DomainException(RefreshTokenErrorMessages.TOKEN_REQUIRED);
    }
  }

  private static validateFamily(family: string): void {
    if (!family) {
      throw new DomainException(RefreshTokenErrorMessages.FAMILY_REQUIRED);
    }
    if (!UUID_REGEX.test(family)) {
      throw new DomainException(RefreshTokenErrorMessages.FAMILY_INVALID);
    }
  }

  private static validateExpiresAt(expiresAt: Date): void {
    if (!expiresAt) {
      throw new DomainException(RefreshTokenErrorMessages.EXPIRES_AT_REQUIRED);
    }
    if (expiresAt <= new Date()) {
      throw new DomainException(
        RefreshTokenErrorMessages.EXPIRES_AT_MUST_BE_FUTURE,
      );
    }
  }
}
