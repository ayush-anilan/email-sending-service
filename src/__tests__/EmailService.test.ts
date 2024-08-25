import EmailService from '../services/EmailService';
import { MockEmailProvider1, MockEmailProvider2 } from '../services/EmailProvider';

describe('EmailService with Exponential Backoff', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService([new MockEmailProvider1(), new MockEmailProvider2()]);
  });

  test('should retry sending email with exponential backoff', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    const result = await emailService.sendEmail('test@example.com', 'Test Subject', 'Test Body');
    
    expect(result).toBeTruthy();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/Retrying after \d+ms/));
    
    consoleSpy.mockRestore();
  });
});