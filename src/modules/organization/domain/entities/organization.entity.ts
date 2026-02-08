import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { isValidCnpj } from '@shared/validators/cnpj.validator';
import { OrganizationErrorMessages } from '../constants/error-messages';

export interface OrganizationProps {
  id?: string;
  name: string;
  slug: string;
  document?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Organization {
  readonly id: string;
  private _name: string;
  private _slug: string;
  private _document: string | null;
  private _isActive: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: Required<OrganizationProps>) {
    this.id = props.id;
    this._name = props.name;
    this._slug = props.slug;
    this._document = props.document;
    this._isActive = props.isActive;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get document(): string | null {
    return this._document;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: OrganizationProps): Organization {
    Organization.validateName(props.name);
    Organization.validateSlug(props.slug);

    if (props.document) {
      Organization.validateDocument(props.document);
    }

    const now = new Date();

    return new Organization({
      id: props.id ?? uuidv7(),
      name: props.name,
      slug: props.slug,
      document: props.document ?? null,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  update(
    props: Partial<
      Pick<OrganizationProps, 'name' | 'slug' | 'document' | 'isActive'>
    >,
  ): void {
    if (props.name !== undefined) {
      Organization.validateName(props.name);
      this._name = props.name;
    }

    if (props.slug !== undefined) {
      Organization.validateSlug(props.slug);
      this._slug = props.slug;
    }

    if (props.document !== undefined) {
      if (props.document) {
        Organization.validateDocument(props.document);
      }
      this._document = props.document ?? null;
    }

    if (props.isActive !== undefined) {
      this._isActive = props.isActive;
    }

    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (!this._isActive) {
      throw new DomainException(OrganizationErrorMessages.ALREADY_INACTIVE);
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this._name,
      slug: this._slug,
      document: this._document,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new DomainException(OrganizationErrorMessages.NAME_MIN_LENGTH);
    }
  }

  private static validateSlug(slug: string): void {
    if (!slug) {
      throw new DomainException(OrganizationErrorMessages.SLUG_REQUIRED);
    }
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      throw new DomainException(OrganizationErrorMessages.SLUG_INVALID_FORMAT);
    }
  }

  private static validateDocument(document: string): void {
    if (!isValidCnpj(document)) {
      throw new DomainException(OrganizationErrorMessages.DOCUMENT_INVALID);
    }
  }
}
