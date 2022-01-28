export enum STATUS_CODE {
    SUCCESS = 0,
    ERROR = 1
}

export type BASE_RESPONSE = {
    data?: any | any[];
    message: string;
    code: STATUS_CODE
}

export const CLIENT_PARAMS_ERROR: BASE_RESPONSE = {
    message: '参数出错',
    code: STATUS_CODE.ERROR
}