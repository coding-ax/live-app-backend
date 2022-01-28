import { LoginService } from './login.service';
import { Controller, Get, Query } from '@nestjs/common';

@Controller('login')
export class LoginController {
    constructor(private readonly loginService: LoginService) { }

    @Get('register')
    registerUser(@Query() query) {
        console.log(query)

        this.loginService.registerUser('email')
        return query
    }
}
