import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard to protect internal API endpoints that should only be called
 * by trusted services (like Cloudflare Workers).
 *
 * Validates the X-Internal-API-Key header against WORKER_INTERNAL_API_KEY env var.
 */
@Injectable()
export class InternalApiGuard implements CanActivate {
  private readonly apiKey: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>('WORKER_INTERNAL_API_KEY') || '';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedKey = request.headers['x-internal-api-key'];

    if (!this.apiKey) {
      throw new UnauthorizedException('Internal API not configured');
    }

    if (!providedKey || providedKey !== this.apiKey) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}
