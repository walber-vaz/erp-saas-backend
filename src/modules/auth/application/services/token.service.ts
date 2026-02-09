import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

export interface AccessTokenPayload {
  userId: string;
  organizationId: string;
}

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: AccessTokenPayload): string {
    return this.jwtService.sign({
      sub: payload.userId,
      organizationId: payload.organizationId,
    });
  }

  generateRefreshToken(): string {
    return randomBytes(64).toString('hex');
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    const payload = this.jwtService.verify<{
      sub: string;
      organizationId: string;
    }>(token);

    return {
      userId: payload.sub,
      organizationId: payload.organizationId,
    };
  }
}
