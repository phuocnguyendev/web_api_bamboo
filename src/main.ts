import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Reflector } from '@nestjs/core/services/reflector.service';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalValidationPipe } from './core';
import { TransformInterceptor } from './core/transform.interceptor';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  const reflector = app.get(Reflector);
  const configService = app.get(ConfigService);
  const port =
    process.env.NODE_ENV === 'production'
      ? parseInt(process.env.PORT || '3000', 10)
      : (configService.get<number>('PORT') ?? 5176);

  app.use(cookieParser());
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // config api version
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.setGlobalPrefix('api');

  // validation config for class-validator
  app.useGlobalPipes(new GlobalValidationPipe());

  // config swagger
  const config = new DocumentBuilder()
    .setTitle('Ionic API')
    .setDescription('API documentation for the Ionic')
    .setVersion('1.0')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      persistAuthorization: true,
    },
  });

  await app.listen(port, '0.0.0.0');
  console.log(
    `Application is running on: http://localhost:${port} successfully.`,
  );
}
bootstrap();
