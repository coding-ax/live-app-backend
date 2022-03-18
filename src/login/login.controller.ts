import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';

import { LoginService } from './login.service';
import { RegisterRequest, UpdateProfileRequest } from './dto/login.dto';
import { BASE_RESPONSE, STATUS_CODE, CLIENT_PARAMS_ERROR, isEmail } from 'src/common';
import { Response } from 'express'
import { GetHeader } from 'src/user-decoration/user.decoration';

@Controller('login')
export class LoginController {
    constructor(private readonly loginService: LoginService,) { }
    @Post()
    async login(@Body() { email, password }: RegisterRequest, @Res({ passthrough: true }) response: Response): Promise<BASE_RESPONSE> {
        if (!email || !password || !isEmail(email)) {
            return CLIENT_PARAMS_ERROR
        }
        const userAuth = await this.loginService.findOne({ email });
        const { password: verifiedPassword, email: verifiedEmail } = userAuth || {}
        if (!verifiedEmail) {
            return {
                code: STATUS_CODE.ERROR,
                message: '该邮箱未被注册'
            }
        }

        if (!verifiedPassword || password !== verifiedPassword) {
            return {
                code: STATUS_CODE.ERROR,
                message: '密码错误，请检查密码或邮箱是否正确'
            }
        }

        // 获取用户资料并存储到redis
        const data = await this.loginService.authUserLogin(userAuth);
        response.cookie('open_id', userAuth.open_id, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 20,
        })
        return {
            code: STATUS_CODE.SUCCESS,
            message: '',
            data
        }
    }

    @Post('update_profile')
    async updateProfile(@Body() currentProfile: UpdateProfileRequest, @GetHeader('open_id') openId, @GetHeader('user-info') userInfo) {
        console.log('open_id is ', openId, userInfo);
        const result = await this.loginService.editProfile(openId, currentProfile);
        if (!result) {
            return CLIENT_PARAMS_ERROR;
        }
        return {
            code: STATUS_CODE.SUCCESS,
            message: '',
            data: result
        }
    }


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
