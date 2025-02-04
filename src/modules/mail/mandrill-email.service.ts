import { Injectable } from '@nestjs/common';
import { EmailOptions, EmailService } from './email-service.interface';
import axios from 'axios';
import { ConfigService } from '../config';
import { MANDRILL_API_KEY } from '../../core/constants/environment.constants';

const DEFAULT_TEMPLATE_ID = 'sign_in';

@Injectable()
export class MandrillEmailService implements EmailService {
  constructor(private readonly configService: ConfigService) {}
  private readonly apiUrl =
    'https://mandrillapp.com/api/1.0/messages/send-template.json';

  async sendEmail(options: EmailOptions): Promise<any> {
    const key = this.configService.get(MANDRILL_API_KEY);

    const payload = {
      key,
      template_name: options.templateName ?? DEFAULT_TEMPLATE_ID,
      template_content: [],
      message: {
        to: [{ email: options.to, type: 'to' }],
        subject: options.subject,
        global_merge_vars: [
          { name: 'code', content: options.code },
        ],
      },
    };

    try {
      const response = await axios.post(this.apiUrl, payload);
      return response.data;
    } catch (error) {
      console.error(
        'Error sending email:',
        error.response ? error.response.data : error.message,
      );
      throw error;
    }
  }
}
