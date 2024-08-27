# Email Sending Service

This is an Email Sending Service implemented in TypeScript. It features:

- Multiple email providers
- Retry logic with exponential backoff
- Provider fallback on failure
- Idempotency to prevent duplicate sends
- Basic rate limiting
- Status tracking for email sending attempts

## Features

- **Retry Mechanism**: Automatically retries email sending with exponential backoff.
- **Fallback Between Providers**: Switches to a different provider if the current one fails.
- **Idempotency**: Ensures the same email isn't sent multiple times.
- **Rate Limiting**: Limits the number of emails sent to the same recipient within a certain timeframe.
- **Status Tracking**: Tracks the status of each email attempt.

### Bonus Features

- **Circuit Breaker Pattern**: Prevents system overload by stopping attempts after continuous failures.
- **Simple Logging**: Logs the sending process and errors for debugging.
- **Basic Queue System**: Implements a simple queue to manage email sending tasks.

## Installation

To install the dependencies, run:

```bash
npm install
```

To run the code:

1. Compile TypeScript to JavaScript

```bash
npx tsc
```

2. Run the compiled code

```bash
node src/index.js
```

## Running Tests

To run the tests, use:

```bash
npm test
```
