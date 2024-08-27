import express from 'express';
import bodyParser from 'body-parser';
import EmailService from './src/services/EmailService';
import { MockEmailProvider1, MockEmailProvider2 } from './src/services/EmailProvider';

const app = express();
const emailService = new EmailService([new MockEmailProvider1(), new MockEmailProvider2()], 3);

// Middleware
app.use(bodyParser.json());

// Route to send emails
app.post('/send-email', async (req, res) => {
  const { recipient, subject, body } = req.body;

  try {
    const result = await emailService.sendEmail(recipient, subject, body);
    res.status(200).json({ message: 'Email sent successfully', result });
  } catch (error) {
    const msg = (error as Error).message
    res.status(500).json({ message: 'Failed to send email', error: msg });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});