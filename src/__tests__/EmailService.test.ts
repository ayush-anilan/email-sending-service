import EmailService from '../services/EmailService';
import { MockEmailProvider1, MockEmailProvider2 } from '../services/EmailProvider';
import { EmailStatus } from '../types/EmailStatus';

describe('EmailService with Status Tracking', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService([new MockEmailProvider1(), new MockEmailProvider2()], 3);
  });

  test('should track successful email status', async () => {
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
    expect(status.attempts).toBe(1); // Should be 1 since it was successful on the first try
    expect(status.provider).toBe('MockEmailProvider1');
  });

  test('should track failed email status with retries', async () => {
    // This test assumes that the MockEmailProvider1 will fail for 'fail@example.com'
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
    expect(status.attempts).toBe(3); // Expecting 3 attempts due to retries
    expect(status.provider).toBe('MockEmailProvider1');
  });

  test('should track fallback to second provider when first provider fails', async () => {
    const recipient = 'fallback@example.com';
    const subject = 'Fallback Subject';
    const body = 'Fallback Body';

    // Mock the first provider to fail
    jest.spyOn(MockEmailProvider1.prototype, 'sendEmail').mockRejectedValueOnce(new Error('Mock failure'));

    await emailService.sendEmail(recipient, subject, body);

    const statuses: EmailStatus[] = emailService.getEmailStatuses();
    expect(statuses.length).toBe(1);

    const status = statuses[0];
    expect(status.recipient).toBe(recipient);
    expect(status.subject).toBe(subject);
    expect(status.body).toBe(body);
    expect(status.success).toBe(true);
    expect(status.attempts).toBe(2); // One failure on the first provider and one success on the second
    expect(status.provider).toBe('MockEmailProvider2'); // Should indicate the second provider
  });

  test('should handle multiple emails and track each status separately', async () => {
    const emails = [
      { recipient: 'email1@example.com', subject: 'Subject 1', body: 'Body 1' },
      { recipient: 'email2@example.com', subject: 'Subject 2', body: 'Body 2' },
      { recipient: 'fail@example.com', subject: 'Fail Subject', body: 'Fail Body' }, // Should trigger retries and fail
    ];

    for (const email of emails) {
      await emailService.sendEmail(email.recipient, email.subject, email.body);
    }

    const statuses: EmailStatus[] = emailService.getEmailStatuses();
    expect(statuses.length).toBe(emails.length);

    statuses.forEach((status, index) => {
      const expectedEmail = emails[index];
      expect(status.recipient).toBe(expectedEmail.recipient);
      expect(status.subject).toBe(expectedEmail.subject);
      expect(status.body).toBe(expectedEmail.body);
      
      if (expectedEmail.recipient === 'fail@example.com') {
        expect(status.success).toBe(false);
        expect(status.attempts).toBe(3);
      } else {
        expect(status.success).toBe(true);
        expect(status.attempts).toBe(1);
      }
    });
  });

  test('should not send email if rate limited', async () => {
    const recipient = 'limited@example.com';
    const subject = 'Limited Subject';
    const body = 'Limited Body';

    // Simulate rate limiting
    jest.spyOn(emailService as any, 'isRateLimited').mockReturnValue(true);

    const result = await emailService.sendEmail(recipient, subject, body);
    expect(result).toBe(false);

    const statuses: EmailStatus[] = emailService.getEmailStatuses();
    expect(statuses.length).toBe(0); // Should not have any email status because it was rate limited
  });
});