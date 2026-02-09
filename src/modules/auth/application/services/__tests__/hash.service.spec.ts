import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from '../hash.service';

describe('HashService', () => {
  let service: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashService],
    }).compile();

    service = module.get<HashService>(HashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('should return a hash starting with $2b$10$', async () => {
      const password = 'password123';
      const hash = await service.hash(password);
      expect(hash).toMatch(/^\$2b\$10\$.{53}$/);
    });

    it('should return different hashes for the same password', async () => {
      const password = 'password123';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for a matching password and hash', async () => {
      const password = 'password123';
      const hash = await service.hash(password);
      const isMatch = await service.compare(password, hash);
      expect(isMatch).toBe(true);
    });

    it('should return false for a non-matching password and hash', async () => {
      const password = 'password123';
      const wrongPassword = 'wrongpassword';
      const hash = await service.hash(password);
      const isMatch = await service.compare(wrongPassword, hash);
      expect(isMatch).toBe(false);
    });
  });
});
