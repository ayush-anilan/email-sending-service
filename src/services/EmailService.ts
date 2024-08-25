import { EmailProvider, MockEmailProvider1, MockEmailProvider2 } from './EmailProvider';
import { exponentialBackoff } from '../utils/ExponentialBackoff';

class EmailService {
  private providers: EmailProvider[];
  private retryLimit: number;

  constructor(providers: EmailProvider[], retryLimit: number = 3) {
    this.providers = providers;
    this.retryLimit = retryLimit;
  }

  async sendEmail(recipient: string, subject: string, body: string): Promise<boolean> {
    for (const provider of this.providers) {
      let attempt = 0;
      while (attempt < this.retryLimit) {
        try {
          const success = await provider.sendEmail(recipient, subject, body);
          if (success) {
            console.log(`Email sent successfully by ${provider.constructor.name}`);
            return true;
          }
        } catch (error) {
          console.error(`Error from ${provider.constructor.name}: ${error}`);
        }

        attempt++;
        await exponentialBackoff(attempt); // Use exponential backoff before retrying
      }

      console.log(`Failed to send email with ${provider.constructor.name} after ${this.retryLimit} attempts.`);
    }

    return false; // All providers failed
  }
}

export default EmailService;