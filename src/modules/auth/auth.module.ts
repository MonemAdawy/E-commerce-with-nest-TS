import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';
import { OtpRepository } from 'src/DB/repository/otp.repository';
import { OtpModel } from 'src/DB/models/otp.model';
import { TokenModel } from 'src/DB/models/token.model';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { APP_GUARD } from '@nestjs/core';
import { UserRepository } from 'src/DB/repository/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { CartRepository } from 'src/DB/repository/cart.repository';
import { CartModel } from 'src/DB/models/cart.model';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtService, 
    OtpRepository, 
    UserRepository, 
    TokenRepository, 
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    CartRepository,
  ],
  imports: [UserModule, OtpModel, TokenModel, UserModel, CartModel], // 👈 Import includes the modules and DB Models
})
export class AuthModule {}
