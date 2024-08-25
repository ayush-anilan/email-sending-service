export interface EmailProvider {
    sendEmail(recipient: string, subject: string, body: string): Promise<boolean>;
  }
  
  export class MockEmailProvider1 implements EmailProvider {
    async sendEmail(recipient: string, subject: string, body: string): Promise<boolean> {
      console.log(`MockEmailProvider1 sending email to ${recipient}`);
      return false; // Force failure to test retry logic
    }
  }
  
  export class MockEmailProvider2 implements EmailProvider {
    async sendEmail(recipient: string, subject: string, body: string): Promise<boolean> {
      console.log(`MockEmailProvider2 sending email to ${recipient}`);
      return Math.random() > 0.5; // 50% success rate
    }
  }