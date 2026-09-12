import { Resend } from "resend";

import type { Mailer, SendEmailParams } from "./mailer";
import { MailerError } from "./mailer";

export class ResendMailer implements Mailer {
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string
  ) {
    this.client = new Resend(apiKey);
  }

  async sendEmail(params: SendEmailParams): Promise<void> {
    const { error } = await this.client.emails.send({
      from: this.from,
      ...params,
    });

    if (error) {
      throw new MailerError("The email provider rejected the request", {
        cause: error,
      });
    }
  }
}
