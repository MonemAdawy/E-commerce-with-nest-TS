import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { OtpRepository } from 'src/DB/repository/otp.repository';
import * as randomstring from 'randomstring';
import { compareHash } from 'src/common/security/hash.util';
import { TokenRepository } from 'src/DB/repository/token.repository';
import { Types } from 'mongoose';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CartRepository } from 'src/DB/repository/cart.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly _UserService: UserService, 
    private readonly _MailerService: MailerService,
    private readonly _ConfigService: ConfigService,
    private readonly _JwtService: JwtService,
    private readonly _OtpRepository: OtpRepository,
    private readonly _TokenRepository: TokenRepository,
    private readonly _CartRepository: CartRepository
  ) {}

  async register(data: CreateUserDto) {
    const { email, otp } = data;

    const otpDoc = await this._OtpRepository.findOne({filter: {email}});

    if (!otpDoc || !compareHash(otp, otpDoc.otp)) throw new InternalServerErrorException('Invalid OTP');


    await otpDoc.deleteOne({email});
      
    const user = await this._UserService.create({...data, accountActivated: true});

    await this._CartRepository.create({user: user._id as Types.ObjectId});

    return {success: true, message: 'User created successfully'};
  }

  async login(data: LoginDto) {
    const user = await this._UserService.validateUser(data);
    
    const access_token = this._JwtService.sign(
      {id: user._id}, 
      {
        secret: this._ConfigService.get('JWT_SECRET'), 
        expiresIn: this._ConfigService.get('ACCESS_TOKEN_EXPIRATION'),
      }
    );

    await this._TokenRepository.create({token: access_token, user: user._id as Types.ObjectId})

    const refresh_token = this._JwtService.sign(
      {id: user._id},
      {
        secret: this._ConfigService.get('JWT_SECRET'),
        expiresIn: this._ConfigService.get('REFRESH_TOKEN_EXPIRATION'),
      }
    );

    await this._TokenRepository.create({token: refresh_token, user: user._id as Types.ObjectId})

    return {success: true, data: {access_token, refresh_token}};
  }


  async sendOtp(data: {email: string}) {
      const { email } = data;
      // const user = await this._UserService.userExistByEmail(email);

      const Otp = await this._OtpRepository.findOne({filter: {email}});

      if (Otp) await this._OtpRepository.delete({email});

      const newOtp = randomstring.generate({length: 6, charset: 'numeric'});

      await this._MailerService.sendMail({
        from: this._ConfigService.get('EMAIL'),
        to: email,
        subject: 'OTP',
        text: `Your OTP is ${newOtp}`,
      });

      await this._OtpRepository.create({email, otp: newOtp});

      return {success: true, message: 'OTP sent successfully'};

  }


  async forgetPassword(data: {email: string}) {

      const {email} = data
      const user = await this._UserService.userExistByEmail(email);
  
      if (!user.accountActivated) throw new BadRequestException('Account not acctivated yet');
  
  
      const Otp = await this._OtpRepository.findOne({filter: {email}});
  
      if (Otp) await this._OtpRepository.delete({email});
      const newOtp = randomstring.generate({length: 6, charset: 'numeric'});
  
      await this._MailerService.sendMail({
        from: this._ConfigService.get('EMAIL'),
        to: email,
        subject: 'OTP',
        text: `Your OTP is ${newOtp}`,
      });
  
      await this._OtpRepository.create({email, otp: newOtp});
  
      return {success: true, message: 'OTP sent successfully'};
  }


  async resetPassword(data: ResetPasswordDto) {
      const {email, password, otp} = data;
      const user = await this._UserService.userExistByEmail(email);

      if (!user.accountActivated) throw new BadRequestException('Account not acctivated yet');

      const otpDoc = await this._OtpRepository.findOne({filter: {email}});

      if (!otpDoc || !await compareHash(otp, otpDoc.otp)) throw new BadRequestException('Invalid OTP');

      user.password = password;
      await user.save();

      const tokens = await this._TokenRepository.findAll({filter: {user: user._id}});

      if (tokens.data.length) {
        for (const token of tokens.data) {
          token.isValid = false;
          await token.save();
        }
      } 

      return {success: true, message: 'Try to login now'}
  }
}
