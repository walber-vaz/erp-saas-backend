import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationErrorMessages } from '../../constants/error-messages';
import { Organization } from '../organization.entity';

// CNPJ válido para testes: 31.578.776/0001-17
const VALID_CNPJ = '31578776000117';
const INVALID_CNPJ = '11222333000100';

describe('Organization Entity', () => {
  const validProps = {
    name: 'Empresa Teste',
    slug: 'empresa-teste',
  };

  describe('create', () => {
    it('deve criar uma organização com propriedades válidas', () => {
      const org = Organization.create(validProps);

      expect(org.id).toBeDefined();
      expect(org.name).toBe(validProps.name);
      expect(org.slug).toBe(validProps.slug);
      expect(org.document).toBeNull();
      expect(org.isActive).toBe(true);
      expect(org.createdAt).toBeInstanceOf(Date);
      expect(org.updatedAt).toBeInstanceOf(Date);
    });

    it('deve criar uma organização com documento válido', () => {
      const org = Organization.create({ ...validProps, document: VALID_CNPJ });

      expect(org.document).toBe(VALID_CNPJ);
    });

    it('deve usar id fornecido quando informado', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const org = Organization.create({ ...validProps, id });

      expect(org.id).toBe(id);
    });

    it('deve lançar exceção para nome com menos de 2 caracteres', () => {
      expect(() => Organization.create({ ...validProps, name: 'A' })).toThrow(
        new DomainException(OrganizationErrorMessages.NAME_MIN_LENGTH),
      );
    });

    it('deve lançar exceção para nome vazio', () => {
      expect(() => Organization.create({ ...validProps, name: '' })).toThrow(
        new DomainException(OrganizationErrorMessages.NAME_MIN_LENGTH),
      );
    });

    it('deve lançar exceção para slug vazio', () => {
      expect(() => Organization.create({ ...validProps, slug: '' })).toThrow(
        new DomainException(OrganizationErrorMessages.SLUG_REQUIRED),
      );
    });

    it('deve lançar exceção para slug com formato inválido', () => {
      const invalidSlugs = [
        'Empresa',
        'empresa teste',
        'empresa_teste',
        '-empresa',
        'empresa-',
      ];

      for (const slug of invalidSlugs) {
        expect(() => Organization.create({ ...validProps, slug })).toThrow(
          new DomainException(OrganizationErrorMessages.SLUG_INVALID_FORMAT),
        );
      }
    });

    it('deve aceitar slug com números e hífens', () => {
      const org = Organization.create({
        ...validProps,
        slug: 'empresa-123-teste',
      });
      expect(org.slug).toBe('empresa-123-teste');
    });

    it('deve lançar exceção para CNPJ inválido', () => {
      expect(() =>
        Organization.create({ ...validProps, document: INVALID_CNPJ }),
      ).toThrow(
        new DomainException(OrganizationErrorMessages.DOCUMENT_INVALID),
      );
    });

    it('deve lançar exceção para CNPJ com todos dígitos iguais', () => {
      expect(() =>
        Organization.create({ ...validProps, document: '11111111111111' }),
      ).toThrow(
        new DomainException(OrganizationErrorMessages.DOCUMENT_INVALID),
      );
    });
  });

  describe('update', () => {
    it('deve atualizar o nome', () => {
      const org = Organization.create(validProps);
      org.update({ name: 'Novo Nome' });

      expect(org.name).toBe('Novo Nome');
    });

    it('deve atualizar o slug', () => {
      const org = Organization.create(validProps);
      org.update({ slug: 'novo-slug' });

      expect(org.slug).toBe('novo-slug');
    });

    it('deve atualizar o documento', () => {
      const org = Organization.create(validProps);
      org.update({ document: VALID_CNPJ });

      expect(org.document).toBe(VALID_CNPJ);
    });

    it('deve remover o documento quando null', () => {
      const org = Organization.create({ ...validProps, document: VALID_CNPJ });
      org.update({ document: null });

      expect(org.document).toBeNull();
    });

    it('deve atualizar updatedAt', () => {
      const org = Organization.create(validProps);
      const previousUpdatedAt = org.updatedAt;

      org.update({ name: 'Novo Nome' });

      expect(org.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });

    it('deve lançar exceção para nome inválido no update', () => {
      const org = Organization.create(validProps);

      expect(() => org.update({ name: 'A' })).toThrow(
        new DomainException(OrganizationErrorMessages.NAME_MIN_LENGTH),
      );
    });

    it('deve lançar exceção para slug inválido no update', () => {
      const org = Organization.create(validProps);

      expect(() => org.update({ slug: 'INVALIDO' })).toThrow(
        new DomainException(OrganizationErrorMessages.SLUG_INVALID_FORMAT),
      );
    });

    it('deve lançar exceção para documento inválido no update', () => {
      const org = Organization.create(validProps);

      expect(() => org.update({ document: INVALID_CNPJ })).toThrow(
        new DomainException(OrganizationErrorMessages.DOCUMENT_INVALID),
      );
    });
  });

  describe('deactivate', () => {
    it('deve desativar a organização', () => {
      const org = Organization.create(validProps);
      org.deactivate();

      expect(org.isActive).toBe(false);
    });

    it('deve lançar exceção ao desativar organização já inativa', () => {
      const org = Organization.create({ ...validProps, isActive: false });

      expect(() => org.deactivate()).toThrow(
        new DomainException(OrganizationErrorMessages.ALREADY_INACTIVE),
      );
    });

    it('deve atualizar updatedAt ao desativar', () => {
      const org = Organization.create(validProps);
      const previousUpdatedAt = org.updatedAt;

      org.deactivate();

      expect(org.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });
  });
});
