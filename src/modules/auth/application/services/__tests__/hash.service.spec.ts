import { HashService } from '../hash.service';

describe('HashService', () => {
  let hashService: HashService;

  beforeEach(() => {
    hashService = new HashService();
  });

  describe('hash', () => {
    it('deve gerar um hash da senha', async () => {
      const password = 'minhaSenha123';
      const hash = await hashService.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2b$10$')).toBe(true);
    });

    it('deve gerar hashes diferentes para a mesma senha', async () => {
      const password = 'minhaSenha123';
      const hash1 = await hashService.hash(password);
      const hash2 = await hashService.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('deve retornar true para senha correta', async () => {
      const password = 'minhaSenha123';
      const hash = await hashService.hash(password);

      const result = await hashService.compare(password, hash);

      expect(result).toBe(true);
    });

    it('deve retornar false para senha incorreta', async () => {
      const password = 'minhaSenha123';
      const hash = await hashService.hash(password);

      const result = await hashService.compare('senhaErrada', hash);

      expect(result).toBe(false);
    });
  });
});
