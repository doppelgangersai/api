export interface EmailOptions {
  to: string;
  subject?: string;

  from?: string;
  text?: string;
  html?: string;
  buttonText?: string;
  buttonUrl?: string;
  templateName?: string;
  code?: string;
}

export interface EmailService {
  sendEmail(options: EmailOptions): Promise<any>;
}
