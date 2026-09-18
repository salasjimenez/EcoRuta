import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('PORT') ?? 3000;

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  console.log(`EcoRuta API running at http://localhost:${port}/api`);
}

void bootstrap();
