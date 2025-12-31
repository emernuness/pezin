import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  // Create app without default body parser for webhook route handling
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false, // Disable default body parser
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  app.useLogger(logger);
  app.use(cookieParser());

  // Apply JSON body parser only to non-webhook routes
  // The RawBodyMiddleware in AppModule handles /webhooks/stripe
  app.use((req: any, res: any, next: any) => {
    if (req.originalUrl?.startsWith('/webhooks/stripe')) {
      // Skip JSON parsing for webhook routes - RawBodyMiddleware handles this
      next();
    } else {
      json({ limit: '10mb' })(req, res, next);
    }
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // CORS configuration
  const webUrl = configService.get<string>('WEB_URL', 'http://localhost:3000');
  app.enableCors({
    origin: webUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);

  logger.log(`🚀 API running on http://localhost:${port}`, 'Bootstrap');
}

bootstrap();
