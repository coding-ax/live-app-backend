import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { initEnv } from '../../../env';

class Mailer {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  constructor() {
    initEnv();
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'qq',
      host: process.env.EMAIL_HOST || 'smtp.qq.com',
      port: Number.parseInt(process.env.EMAIL_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASSWORD,
      },
    });
  }
  public getInstance() {
    return this.transporter;
  }
}

const instance = new Mailer().getInstance();

// 封装邮箱操作
export const sendMail = async (
  to: string,
  subject: string,
  html: string,
): Promise<SMTPTransport.SentMessageInfo> => {
  const result = await instance.sendMail({
    from: process.env.EMAIL_AUTH_USER,
    to,
    subject,
    html,
  });
  return result;
};

export default instance;
