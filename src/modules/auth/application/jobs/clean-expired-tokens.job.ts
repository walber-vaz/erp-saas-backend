import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';

@Injectable()
export class CleanExpiredTokensJob {
  private readonly logger = new Logger(CleanExpiredTokensJob.name);

  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async execute(): Promise<void> {
    this.logger.log('Iniciando job de limpeza de tokens expirados...');
    try {
      await this.refreshTokenRepository.deleteExpired();
      this.logger.log('Tokens expirados limpos com sucesso.');
    } catch (error) {
      this.logger.error('Erro ao limpar tokens expirados:', error.message);
    }
  }
}
