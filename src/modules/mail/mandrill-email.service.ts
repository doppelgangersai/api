import { Injectable } from '@nestjs/common';
import { EmailOptions, EmailService } from './email-service.interface';
import axios from 'axios';
import { ConfigService } from '../config';
import { MANDRILL_API_KEY } from '../../core/constants/environment.constants';

const DEFAULT_TEMPLATE_ID = 'template-with-button';

@Injectable()
export class MandrillEmailService implements EmailService {
  constructor(private readonly configService: ConfigService) {}
  private readonly apiUrl =
    'https://mandrillapp.com/api/1.0/messages/send-template.json';

  async sendEmail(options: EmailOptions): Promise<any> {
    const key = this.configService.get(MANDRILL_API_KEY);
    const payload = {
      key,
      template_name: DEFAULT_TEMPLATE_ID,
      template_content: [],
      message: {
        from_email: options.from || 'tmp@vvm.space',
        to: [{ email: options.to, type: 'to' }],
        subject: options.subject,
        global_merge_vars: this.generateMergeVars({
          button:
            options.buttonText && options.buttonUrl
              ? `<a class="button mceButtonLink" href="${options.buttonUrl}">${options.buttonText}</a>`
              : '',
          ...options,
        }),
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

  private generateMergeVars(options: Record<string, string>) {
    let mergeVars = [{ name: 'text', content: options.text || '' }];

    if (options.buttonText && options.buttonUrl) {
      mergeVars.push({ name: 'button', content: options.button });
    }

    return mergeVars;
  }
}
