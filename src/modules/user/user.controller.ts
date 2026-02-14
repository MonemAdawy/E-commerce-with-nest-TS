import { Controller, Get } from '@nestjs/common';
import { Role } from 'src/common/decorators/roles.decorator';
import { Roles } from 'src/DB/enums/user.enum';


@Controller('user')
export class UserController {
    @Get("/profile")
    @Role(Roles.user)
    profie(){
        return "done"
    }
}
