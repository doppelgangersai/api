export interface EmailOptions {
  to: string;
  templateName: string;

  subject?: string;
  userName?: string;
  code?: string;
}

export interface EmailService {
  sendEmail(options: EmailOptions): Promise<any>;
}
