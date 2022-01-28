import { LoginService } from './login.service';
import { Controller, Get, Query } from '@nestjs/common';
import { RegisterRequest } from './dto/login.dto';
import { BASE_RESPONSE, STATUS_CODE, CLIENT_PARAMS_ERROR } from 'src/common/base';



@Controller('login')
export class LoginController {
    constructor(private readonly loginService: LoginService) { }

    @Get('register')
    async registerUser(@Query() { email }: RegisterRequest): Promise<BASE_RESPONSE> {
        if (!email) {
            return CLIENT_PARAMS_ERROR
        }

        const data = await this.loginService.registerUser(email)
        return {
            data,
            message: '',
            code: STATUS_CODE.SUCCESS
        }
    }
}
