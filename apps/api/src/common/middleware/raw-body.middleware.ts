import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as rawBody from 'raw-body';

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.url.includes('/webhooks/stripe')) {
      try {
        const raw = await rawBody(req);
        req.body = raw;
      } catch (error) {
        return res.status(400).send('Bad Request');
      }
    }
    next();
  }
}
