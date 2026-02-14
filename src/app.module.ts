// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { AuthModule } from './modules/auth/auth.module';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { MongooseModule } from '@nestjs/mongoose';
// import { UserModule } from './modules/user/user.module';
// import { MailerModule } from '@nestjs-modules/mailer';

// @Module({
//   imports: [
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }), 
//     AuthModule, 
//     MongooseModule.forRootAsync({
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         uri: configService.get('MONGO_URI'),
//       }),
//     }),
//     MailerModule.forRootAsync({
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => {
//         return {
//           transport: {
//             host: configService.get('HOST'),
//             // port: configService.get('MAIL_PORT'),
//             // secure: false, 
//             auth: {
//               user: configService.get('EMAIL'),
//               pass: configService.get('PASSWORD'),
//           },
//           defaults: {
//             from: '"No Reply" <${configService.get()} >'
//           },
//         }
//       }
//     }),
//     UserModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}



import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv, Keyv } from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { TestModule } from './modules/test/test.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ApolloDriver } from '@nestjs/apollo';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseMappingInterceptor } from './common/interceptor/response-map.interceptor';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }), 
    AuthModule, 
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI'),
      }),
    }),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get('HOST'),
            auth: {
              user: configService.get('EMAIL'),
              pass: configService.get('PASS'),
            },
          },
          from: configService.get('EMAIL'),
        };
      },
    }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory(),
            }),
            createKeyv(configService.get('REDIS_LOCAL'))
          ]
        }
      },
      inject: [ConfigService],
      isGlobal: true
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/modules/schema.gql'),
      context: ({req, res})=> ({req, res}),
    }),
    UserModule,
    CategoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    TestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseMappingInterceptor,
    },
  ],
})
export class AppModule {}