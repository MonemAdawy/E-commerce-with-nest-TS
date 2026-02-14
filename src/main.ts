import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ErrorHandlingInterceptor } from './common/interceptor/error-handler.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true}));

  app.useGlobalInterceptors(
    new ErrorHandlingInterceptor()
  );

  const configService = app.get<ConfigService>(ConfigService);

  const port = configService.get<number>('PORT', 5000);
  console.log(`Server running on http://localhost:${port}`);
  await app.listen(port);
}
bootstrap();
