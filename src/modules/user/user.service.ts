import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/DB/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { compareHash } from 'src/common/security/hash.util';
import { OtpRepository } from 'src/DB/repository/otp.repository';
import { UserDocument } from 'src/DB/models/user.model';

@Injectable()
export class UserService {
    constructor(private readonly _UserRepository: UserRepository, private readonly _OtpRepository: OtpRepository) { }

    async create(data: Partial<UserDocument>) {
        return await this._UserRepository.create({...data});
    }

    async validateUser(data: LoginDto) {
        const {email, password} = data;
        const user = await this._UserRepository.findOne({filter: {email}});
        


        if (!user || !await compareHash(password, user.password)) throw new UnauthorizedException('Invalid credentials');

        return user;
    }

    async userExistByEmail(email: string) {
        const user = await this._UserRepository.findOne({filter: {email}});
        if (!user) throw new UnauthorizedException('User does not exist');
        return user;
    }
}
