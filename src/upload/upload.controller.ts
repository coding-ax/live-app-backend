import { Controller, Post } from '@nestjs/common';
import { CLIENT_ACCESS_ERROR, STATUS_CODE } from 'src/common';
import { GetHeader } from 'src/user-decoration/user.decoration';
import qiniu from 'qiniu';

const userDir = 'user/';

@Controller('upload')
export class UploadController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  @Post()
  async getUploadToken(@GetHeader('user-info') userInfo) {
    if (!userInfo) {
      return CLIENT_ACCESS_ERROR;
    }
    const accessKey = process.env.QINIU_ACCESS_KEY;
    const secretKey = process.env.QINIU_SECRET_KEY;
    const scope = process.env.QINIU_SCOPE;
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
    // scope仓库名称
    const options = {
      scope,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const token = putPolicy.uploadToken(mac);
    const key = `${userDir}${new Date().toString()}${Math.random()
      .toString(16)
      .slice(2)}`.replace(/\s+/g, '');
    const data = {
      token,
      key,
    };
    return {
      code: STATUS_CODE.SUCCESS,
      data,
      message: '',
    };
  }
}
