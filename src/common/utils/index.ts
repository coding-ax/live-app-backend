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

    private static bufferCoder(str: string, encoding: BufferEncoding) {
        return Buffer.from(str).toString(encoding);
    }

    public translate(str: string): string {
        return Encoder.bufferCoder(str, this.translateEncode)
    }
    public decode(str: string): string {
        return Encoder.bufferCoder(str, this.baseEncode)
    }
}

const encoderInstance = new Encoder();

export function generateOpenId(str: string, needTimestamp = true): string {
    const rawText = `${needTimestamp ? dayjs().unix() : ''}${str}`
    return encoderInstance.translate(rawText);
}

const app_prefix = 'live_app'

export function getPrefixKey(str: string): string {
    return `${app_prefix}_${str}`
}