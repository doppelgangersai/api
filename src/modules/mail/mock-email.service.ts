import { EmailOptions, EmailService } from './email-service.interface';

export class MockEmailService implements EmailService {
  async sendEmail(options: EmailOptions): Promise<any> {
    console.log(
      'Sending email to',
      options.to,
      'with subject',
      options.subject,
      'and text',
      options.text,
    );
  }
}
