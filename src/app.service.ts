import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '<h1 style="color:green;text-align:center;">该应用正在运行</h1>';
  }
}
