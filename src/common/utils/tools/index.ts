import dayjs from 'dayjs'
/**
 * 用于转换字符串编码
 * const encoder = new Encoder('utf-8', 'base64')
 * base64Str = encoder.translate('test str')
 * rawStr = encoder.decode(base64Str)
 * 默认编码为 utf-8 到 base64
 */
export class Encoder {
    private baseEncode: BufferEncoding = 'utf-8'
    private translateEncode: BufferEncoding = 'base64'
    /**
     * 调用buffer.from 转换编码
     * @param baseEncode 基本的编码，默认为utf-8
     * @param translateEncode 要转换的编码, 默认为base64
     */
    constructor(baseEncode: BufferEncoding = 'utf-8', translateEncode: BufferEncoding = 'base64') {
        this.baseEncode = baseEncode;
        this.translateEncode = translateEncode;
    }

    private static bufferCoder(str: string, encoding: BufferEncoding, rawEncoding: BufferEncoding = 'utf-8') {
        return Buffer.from(str, rawEncoding).toString(encoding);
    }

    public translate(str: string): string {
        return Encoder.bufferCoder(str, this.translateEncode, this.baseEncode)
    }
    public decode(str: string): string {
        return Encoder.bufferCoder(str, this.baseEncode, this.translateEncode)
    }
}

export const encoderInstance = new Encoder();
const openIdSep = '#'
export function generateOpenId(str: string, needTimestamp = true, sep = openIdSep): string {
    const rawText = `${needTimestamp ? dayjs().unix() : ''}${sep}${str}`
    return encoderInstance.translate(rawText);
}

export function decodeOpenId(str: string, sep = openIdSep): { unixTime: string, email: string, } {
    const text = encoderInstance.decode(str);
    const [unixTime, email] = text.split(openIdSep)
    return {
        unixTime,
        email
    }
}

export const app_prefix = 'live_app'

export function getPrefixKey(str: string): string {
    return `${app_prefix}_${str}`
}

export const emailReg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/;

export const isEmail = (email: string): boolean => {
    return emailReg.test(email);
}
