import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from 'src/DB/repository/user.repository';
import { UserModel } from 'src/DB/models/user.model';
import { OtpRepository } from 'src/DB/repository/otp.repository';
import { OtpModel } from 'src/DB/models/otp.model';
import { UserController } from './user.controller';
import { JwtService } from '@nestjs/jwt';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { TokenModel } from 'src/DB/models/token.model';

@Module({
  imports: [UserModel, OtpModel, TokenModel],
  providers: [UserService, UserRepository, OtpRepository, JwtService, TokenRepository],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
