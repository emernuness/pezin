import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rawBody from 'raw-body';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    if (req.originalUrl === '/webhooks/stripe' || req.url.includes('/webhooks/stripe')) {
      try {
        const raw = await rawBody(req);
        req.body = raw;
        next();
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  }
}
