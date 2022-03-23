import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

class Mailer {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'qq',
      host: 'smtp.qq.com',
      port: 465,
      secure: true,
      auth: {
        user: 'codingax@foxmail.com',
        pass: 'qhznluwugrntfffi',
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
    from: 'codingax@qq.com',
    to,
    subject,
    html,
  });
  return result;
};

export default instance;
