# Custom Strategy Example

This example demonstrates how to create and use custom backoff strategies with Super-Retry.

## Features Demonstrated
- Custom strategy registration
- Strategy usage by name
- Retry event monitoring
- Exponential delay calculation
- Error handling with retry tracking

## Setup

1. Navigate to the example directory:
```bash
cd examples/custom-strategy
```

2. Install dependencies:
```bash
npm install
```

## Run the Example
```bash
npm start
```

## Code Implementation
```typescript
import { Retry, registerStrategy } from 'super-retry';

// Register custom quadratic strategy: delay = attempt² * base
registerStrategy('quadratic', (attempt: number, baseDelay: number) => 
  Math.pow(attempt, 2) * baseDelay
);

async function main() {
  // Create retry instance with custom strategy
  const retry = new Retry({
    strategy: 'quadratic',
    maxAttempts: 4,
    initialDelayMs: 100
  });

  // Listen to retry events
  retry.on('retry', (event) => {
    if (event.type === 'attempt') {
      console.log(`Attempt ${event.attempt} failed: ${event.error.message}`);
      console.log(`Next retry in ${event.delayMs}ms\n`);
    }
  });

  let attempts = 0;
  
  try {
    const result = await retry.execute(async () => {
      attempts++;
      // Simulate 30% failure rate
      if (Math.random() < 0.3) {
        throw new Error(`Temporary failure (attempt ${attempts})`);
      }
      return '✅ Operation succeeded';
    });
    
    console.log('Final result:', result);
  } catch (error) {
    console.error('❌ All attempts failed:', 
      error instanceof Error ? error.message : 'Unknown error');
  }
}

main();
```

## Expected Output

### Successful Execution
```
Attempt 1 failed: Temporary failure (attempt 1)
Next retry in 100ms

Attempt 2 failed: Temporary failure (attempt 2)
Next retry in 400ms

Final result: ✅ Operation succeeded
```

### Failed Execution
```
Attempt 1 failed: Temporary failure (attempt 1)
Next retry in 100ms

Attempt 2 failed: Temporary failure (attempt 2)
Next retry in 400ms

Attempt 3 failed: Temporary failure (attempt 3)
Next retry in 900ms

❌ All attempts failed: Temporary failure (attempt 4)
```

## Key Features
- **Custom Strategy Registration**: Create and register new backoff algorithms
- **Transparent Retry Tracking**: Monitor retry attempts in real-time
- **Flexible Configuration**: Combine strategies with custom retry logic
- **Type Safety**: Full TypeScript support for strategy definitions

## Behavior Notes
- Quadratic delay formula: `attempt² * baseDelay`
- 30% random failure rate for demonstration
- Delay doubles each attempt (100ms, 400ms, 900ms, etc.)
- Final error shows aggregated failure reason

> **Note**: Run multiple times to see both success and failure scenarios