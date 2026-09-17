import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { IncomingMessage, ServerResponse } from 'http';
import * as express from 'express';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/setup-app';

let cachedApp: express.Express | null = null;

async function getApp(): Promise<express.Express> {
  if (!cachedApp) {
    const expressInstance = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressInstance),
    );
    configureApp(app);
    await app.init();
    cachedApp = expressInstance;
  }
  return cachedApp;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const app = await getApp();
  app(req, res);
}
