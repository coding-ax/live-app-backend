import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetHeader = createParamDecorator(
  (key: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const result = key ? request.headers?.[key] : request.headers;
    try {
      const JSONResult = JSON.parse(result);
      return JSONResult;
    } catch (error) {
      // parse 失败说明不是 json 字符串
      return result;
    }
  },
);
