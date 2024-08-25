export interface EmailStatus {
    idempotencyKey: string;
    recipient: string;
    subject: string;
    body: string;
    attempts: number;
    success: boolean;
    provider: string;
    error?: string;
    timestamp: number;
  }