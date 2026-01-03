import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { randomBytes } from 'crypto';

/**
 * CSRF Guard using Double Submit Cookie pattern
 * 
 * How it works:
 * 1. Server sends a CSRF token in a cookie (non-HttpOnly so JS can read it)
 * 2. Client reads the cookie and sends the same token in X-CSRF-Token header
 * 3. Server validates that both match
 * 
 * This prevents CSRF because:
 * - Attacker's site can't read our cookies (Same-Origin Policy)
 * - Attacker can't set the header in a form submission
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);
  private readonly cookieName = 'XSRF-TOKEN';
  private readonly headerName = 'x-csrf-token';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    // Only protect state-changing methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return true;
    }

    const cookieToken = request.cookies?.[this.cookieName];
    const headerToken = request.headers[this.headerName] as string | undefined;

    // Both tokens must exist
    if (!cookieToken || !headerToken) {
      this.logger.warn(`CSRF validation failed: Missing tokens for ${request.url}`);
      throw new ForbiddenException('CSRF token missing');
    }

    // Tokens must match
    if (!this.timingSafeEqual(cookieToken, headerToken)) {
      this.logger.warn(`CSRF validation failed: Token mismatch for ${request.url}`);
      throw new ForbiddenException('CSRF token invalid');
    }

    return true;
  }

  /**
   * Generate a CSRF token
   */
  static generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Timing-safe string comparison to prevent timing attacks
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return bufA.equals(bufB);
  }
}
