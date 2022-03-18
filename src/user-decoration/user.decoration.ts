import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const parseData = data => JSON.parse(JSON.stringify(data));

export const GetHeader = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return data ? parseData(request.headers?.[data]) : request.headers;
    },
);