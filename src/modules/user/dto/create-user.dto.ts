import { IsEmail, IsIn, IsNotEmpty, IsString, max, maxLength, min, minLength, validate, ValidateIf } from "class-validator";
import { Roles } from "src/DB/enums/user.enum";




export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @IsIn([Math.random()], {message: "Password does not match!"})
    @ValidateIf(o => o.password !== o.confirmPassword)
    confirmPassword: string;


    @IsIn(Object.values(Roles))
    role: Roles;

    @IsString()
    @IsNotEmpty()
    otp: string;
}