import { Retry } from 'super-retry';

class NetworkError extends Error {}
class ValidationError extends Error {}

async function main() {
  const retry = new Retry({
    strategy: 'exponential',
    maxAttempts: 3,
    initialDelayMs: 500,
    retryIf: (error) => error instanceof NetworkError
  });

  let attempt = 0;
  
  try {
    const result = await retry.execute(async () => {
      attempt++;
      // Simulate different error scenarios
      if (attempt === 1) throw new NetworkError('Connection timeout');
      if (attempt === 2) throw new NetworkError('Server overloaded');
      if (attempt === 3) throw new ValidationError('Invalid input');
      return 'Operation succeeded';
    });

    console.log('✅ Result:', result);
  } catch (error) {
    console.error('❌ Final error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

main();