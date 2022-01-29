import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { LoginService } from './login.service';
import { RegisterRequest } from './dto/login.dto';
import { BASE_RESPONSE, STATUS_CODE, CLIENT_PARAMS_ERROR, isEmail } from 'src/common';


@Controller('login')
export class LoginController {
    constructor(private readonly loginService: LoginService) { }

    @Post('register')
    async registerUser(@Body() { email, password }: RegisterRequest): Promise<BASE_RESPONSE> {
        if (!email || !isEmail(email)) {
            return CLIENT_PARAMS_ERROR
        }

        const data = await this.loginService.registerUser(email, password)

        if (data.isRegistered) {
            return {
                code: STATUS_CODE.ERROR,
                message: '该邮箱已经被注册'
            }
        }

        if (data.isInRegisterProcess) {
            return {
                code: STATUS_CODE.ERROR,
                message: '该邮箱已经进入验证环节，请点击链接验证'
            }
        }

        return {
            data,
            message: '',
            code: STATUS_CODE.SUCCESS
        }
    }

    @Get('register/:id')
    async verifyRegister(@Param('id') id: string, @Query() { email }): Promise<BASE_RESPONSE> {
        const { isVerified, email: verifyEmail, temp_passwd, isRegistered } = await this.loginService.verifyRegister(id);
        if (isRegistered) {
            return {
                message: '该邮箱已经注册，无需验证',
                code: STATUS_CODE.ERROR
            }
        }

        if (!isVerified) {
            return {
                message: '验证失败，可能是链接已经过期',
                code: STATUS_CODE.ERROR
            }
        }

        if (email !== verifyEmail) {
            return {
                message: '验证失败，email未注册过',
                code: STATUS_CODE.ERROR
            }
        }

        await this.loginService.addUser(email, temp_passwd)

        return {
            data: {
                id,
                isVerified,
                verifyEmail
            },
            code: STATUS_CODE.SUCCESS,
            message: ''
        }
    }
}
