import { IsEmail, IsIn, IsString, ValidateIf } from "class-validator";


export class ResetPasswordDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    otp: string;

    @IsString()
    password: string;

    @IsString()
    @IsIn([Math.random()], {message: 'Passwords must match!'})
    @ValidateIf((obj) => obj.password !== obj.confirmPassword)
    confirmPassword: string;
}