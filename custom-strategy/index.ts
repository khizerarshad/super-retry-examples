import { Retry, registerStrategy } from 'super-retry'; // Import from main module

// 1. Register the custom strategy
registerStrategy('quadratic', (attempt: number, baseDelay: number) => 
  Math.pow(attempt, 2) * baseDelay
);

// 2. Create retry instance with registered strategy
const retry = new Retry({
  strategy: 'quadratic', // Use registered strategy name
  maxAttempts: 4,
  initialDelayMs: 100
});

async function main() {
  retry.on('retry', (event) => {
    if (event.type === 'attempt') {
      console.log(`Attempt ${event.attempt} delay: ${event.delayMs}ms`);
    }
  });

  let attempts = 0;
  
  try {
    const result = await retry.execute(async () => {
      attempts++;
      if (attempts < 3) throw new Error(`Simulated failure (attempt ${attempts})`);
      return 'Success!';
    });
    console.log('✅ Result:', result);
  } catch (error) {
    console.error('❌ Final error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

main();