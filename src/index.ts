import EmailService from './services/EmailService';
import { MockEmailProvider1, MockEmailProvider2 } from './services/EmailProvider';

(async () => {
  const emailService = new EmailService([new MockEmailProvider1(), new MockEmailProvider2()]);
  
  const recipient = 'test@example.com';
  const subject = 'Test Email';
  const body = 'This is a test email.';

  const result = await emailService.sendEmail(recipient, subject, body);
  if (result) {
    console.log('Email sent successfully!');
  } else {
    console.log('Failed to send email.');
  }
})();