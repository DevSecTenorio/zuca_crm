import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { IncomingMessage, ServerResponse } from 'http';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/setup-app';

type RequestHandler = (req: IncomingMessage, res: ServerResponse) => void;

let cachedHandler: RequestHandler | null = null;

async function getHandler(): Promise<RequestHandler> {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule);
    configureApp(app);
    await app.init();
    cachedHandler = app.getHttpAdapter().getInstance();
  }
  return cachedHandler;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const instance = await getHandler();
  instance(req, res);
}
