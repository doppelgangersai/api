export interface EmailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface EmailService {
  sendEmail(options: EmailOptions): Promise<any>;
}
