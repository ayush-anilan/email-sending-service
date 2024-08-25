export async function exponentialBackoff(attempt: number, maxDelay: number = 10000): Promise<void> {
    const delay = Math.min(Math.pow(2, attempt) * 100, maxDelay); // Delay increases exponentially and caps at maxDelay
    console.log(`Retrying after ${delay}ms...`);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }