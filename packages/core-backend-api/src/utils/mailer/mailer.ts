export type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export interface Mailer {
  sendEmail(params: SendEmailParams): Promise<void>;
}

export class MailerError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MailerError";
  }
}
