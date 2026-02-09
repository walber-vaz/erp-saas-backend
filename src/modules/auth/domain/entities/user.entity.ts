import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '../constants/error-messages';

export interface UserProps {
  id?: string;
  organizationId: string;
  name: string;
  email: string;
  passwordHash: string;
  isActive?: boolean;
  lastLoginAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
  readonly id: string;
  readonly organizationId: string;
  private _name: string;
  private _email: string;
  private _passwordHash: string;
  private _isActive: boolean;
  private _lastLoginAt: Date | null;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: Required<UserProps>) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this._name = props.name;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._isActive = props.isActive;
    this._lastLoginAt = props.lastLoginAt;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: UserProps): User {
    User.validateOrganizationId(props.organizationId);
    User.validateName(props.name);
    User.validateEmail(props.email);
    User.validatePasswordHash(props.passwordHash);

    const now = new Date();

    return new User({
      id: props.id ?? uuidv7(),
      organizationId: props.organizationId,
      name: props.name,
      email: props.email.toLowerCase().trim(),
      passwordHash: props.passwordHash,
      isActive: props.isActive ?? true,
      lastLoginAt: props.lastLoginAt ?? null,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  update(props: Partial<Pick<UserProps, 'name' | 'email'>>): void {
    if (props.name !== undefined) {
      User.validateName(props.name);
      this._name = props.name;
    }

    if (props.email !== undefined) {
      User.validateEmail(props.email);
      this._email = props.email.toLowerCase().trim();
    }

    this._updatedAt = new Date();
  }

  updatePassword(newPasswordHash: string): void {
    User.validatePasswordHash(newPasswordHash);
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (!this._isActive) {
      throw new DomainException(UserErrorMessages.ALREADY_INACTIVE);
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  recordLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this._name,
      email: this._email,
      isActive: this._isActive,
      lastLoginAt: this._lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private static validateOrganizationId(organizationId: string): void {
    if (!organizationId) {
      throw new DomainException(UserErrorMessages.ORGANIZATION_ID_REQUIRED);
    }
    if (!UUID_REGEX.test(organizationId)) {
      throw new DomainException(UserErrorMessages.ORGANIZATION_ID_INVALID);
    }
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new DomainException(UserErrorMessages.NAME_MIN_LENGTH);
    }
  }

  private static validateEmail(email: string): void {
    if (!email) {
      throw new DomainException(UserErrorMessages.EMAIL_REQUIRED);
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      throw new DomainException(UserErrorMessages.EMAIL_INVALID);
    }
  }

  private static validatePasswordHash(passwordHash: string): void {
    if (!passwordHash) {
      throw new DomainException(UserErrorMessages.PASSWORD_HASH_REQUIRED);
    }
  }
}
