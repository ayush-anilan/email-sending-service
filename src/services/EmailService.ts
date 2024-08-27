import { EmailProvider, MockEmailProvider1, MockEmailProvider2 } from './EmailProvider';
import { exponentialBackoff } from '../utils/ExponentialBackoff';
import { EmailStatus } from '../types/EmailStatus';

interface RateLimitRecord {
  count: number;
  startTime: number;
}

/**
 * EmailService class to send emails using multiple providers with retries, fallbacks, rate limiting, and status tracking.
 */

class EmailService {
  private providers: EmailProvider[];
  private retryLimit: number;
  private sentEmails: Set<string>;
  private rateLimitCount: number;
  private rateLimitWindowMs: number;
  private rateLimitStore: Map<string, RateLimitRecord>;
  private emailStatuses: EmailStatus[];  // Store email statuses

    /**
   * Creates an instance of EmailService.
   * @param {IEmailProvider[]} providers - Array of email providers.
   * @param {number} retryLimit - Number of retry attempts.
   */

  constructor(
    providers: EmailProvider[],
    retryLimit: number = 3,
    rateLimitCount: number = 5,
    rateLimitWindowMs: number = 60000
  ) {
    this.providers = providers;
    this.retryLimit = retryLimit;
    this.sentEmails = new Set();
    this.rateLimitCount = rateLimitCount;
    this.rateLimitWindowMs = rateLimitWindowMs;
    this.rateLimitStore = new Map();
    this.emailStatuses = [];  // Initialize email statuses list
  }

  private generateIdempotencyKey(recipient: string, subject: string, body: string): string {
    return `${recipient}-${subject}-${body}`;
  }

  private isRateLimited(recipient: string): boolean {
    const currentTime = Date.now();
    const rateLimitRecord = this.rateLimitStore.get(recipient);

    if (!rateLimitRecord) {
      this.rateLimitStore.set(recipient, { count: 1, startTime: currentTime });
      return false;
    }

    const { count, startTime } = rateLimitRecord;

    if (currentTime - startTime < this.rateLimitWindowMs) {
      if (count >= this.rateLimitCount) {
        return true; // Rate limit exceeded
      }
      rateLimitRecord.count++;
    } else {
      // Reset the window
      this.rateLimitStore.set(recipient, { count: 1, startTime: currentTime });
    }

    return false;
  }

    /**
   * Sends an email using the available providers with retry and fallback mechanisms.
   * @param {string} recipient - The email address of the recipient.
   * @param {string} subject - The subject of the email.
   * @param {string} body - The body content of the email.
   * @returns {Promise<boolean>} - Promise resolving to true if email is sent successfully, false otherwise.
   */

  async sendEmail(recipient: string, subject: string, body: string): Promise<boolean> {
    const idempotencyKey = this.generateIdempotencyKey(recipient, subject, body);

    if (this.isRateLimited(recipient)) {
      console.log(`Rate limit exceeded for ${recipient}. Try again later.`);
      this.trackStatus(idempotencyKey, recipient, subject, body, false, 'Rate Limit Exceeded');
      return false;
    }

    if (this.sentEmails.has(idempotencyKey)) {
      console.log('Email has already been sent. Skipping.');
      this.trackStatus(idempotencyKey, recipient, subject, body, true, 'Already Sent');
      return true;
    }

    for (const provider of this.providers) {
      let attempt = 0;
      while (attempt < this.retryLimit) {
        try {
          console.log(`Attempt ${attempt + 1} using ${provider.constructor.name}`);
          const success = await provider.sendEmail(recipient, subject, body);
          if (success) {
            console.log(`Email sent successfully by ${provider.constructor.name}`);
            this.trackStatus(idempotencyKey, recipient, subject, body, true, provider.constructor.name);
            this.sentEmails.add(idempotencyKey);
            return true;
          }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error from ${provider.constructor.name}: ${error}`);
          this.trackStatus(idempotencyKey, recipient, subject, body, false, provider.constructor.name, errorMessage);
        }

        attempt++;
        await exponentialBackoff(attempt);
      }

      console.log(`Failed to send email with ${provider.constructor.name} after ${this.retryLimit} attempts. Switching to next provider.`);
    }

    console.log('All providers failed to send the email.');
    this.trackStatus(idempotencyKey, recipient, subject, body, false, 'All Providers Failed');
    return false;
  }

  private trackStatus(idempotencyKey: string, recipient: string, subject: string, body: string, success: boolean, provider: string, error?: string): void {
    const status: EmailStatus = {
      idempotencyKey,
      recipient,
      subject,
      body,
      attempts: this.retryLimit,
      success,
      provider,
      error,
      timestamp: Date.now(),
    };

    this.emailStatuses.push(status);
  }

  getEmailStatuses(): EmailStatus[] {
    return this.emailStatuses;
  }
}

export default EmailService;