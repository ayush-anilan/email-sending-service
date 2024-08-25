import EmailService from '../services/EmailService';
import { MockEmailProvider1, MockEmailProvider2 } from '../services/EmailProvider';
import { EmailStatus } from '../types/EmailStatus';

describe('EmailService with Status Tracking', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService([new MockEmailProvider1(), new MockEmailProvider2()], 3);
  });

  test('should track email status', async () => {
    const recipient = 'test@example.com';
    const subject = 'Test Subject';
    const body = 'Test Body';

    await emailService.sendEmail(recipient, subject, body);

    const statuses: EmailStatus[] = emailService.getEmailStatuses();
    expect(statuses.length).toBe(1);

    const status = statuses[0];
    expect(status.recipient).toBe(recipient);
    expect(status.subject).toBe(subject);
    expect(status.body).toBe(body);
    expect(status.success).toBe(true);
    expect(status.attempts).toBeGreaterThanOrEqual(1);
  });

  test('should track failed email status with retries', async () => {
    const recipient = 'fail@example.com';
    const subject = 'Fail Subject';
    const body = 'Fail Body';

    await emailService.sendEmail(recipient, subject, body);

    const statuses: EmailStatus[] = emailService.getEmailStatuses();
    expect(statuses.length).toBe(1);

    const status = statuses[0];
    expect(status.recipient).toBe(recipient);
    expect(status.subject).toBe(subject);
    expect(status.body).toBe(body);
    expect(status.success).toBe(false);
    expect(status.attempts).toBe(3);
  });
});