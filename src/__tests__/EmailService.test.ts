import EmailService from '../services/EmailService';
import { MockEmailProvider1, MockEmailProvider2 } from '../services/EmailProvider';

describe('EmailService with Fallback Mechanism', () => {
  let emailService: EmailService;

  beforeEach(() => {
    emailService = new EmailService([new MockEmailProvider1(), new MockEmailProvider2()]);
  });

  test('should switch to the next provider on failure', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    const result = await emailService.sendEmail('test@example.com', 'Test Subject', 'Test Body');
    
    expect(result).toBeTruthy(); // The test expects the fallback to eventually succeed with MockEmailProvider2
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Switching to next provider.'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Email sent successfully by MockEmailProvider2'));
    
    consoleSpy.mockRestore();
  });
});