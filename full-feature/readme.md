# Full Feature Showcase

This example demonstrates the full capabilities of Super-Retry with multiple advanced features working in concert.

## Features Demonstrated
- Custom Fibonacci backoff strategy
- Middleware pipeline implementation
- Error wrapping and transformation
- Event-driven monitoring
- Conditional retry logic
- Type-safe error handling
- Request timing metrics

## Setup

1. Navigate to the example directory:
```bash
cd examples/full-feature
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

// 1. Custom Fibonacci strategy registration
registerStrategy('fibonacci', (attempt: number, base: number) => 
  [0, 1, 1, 2, 3, 5, 8][attempt] * base
);

async function main() {
  // 2. Retry instance configuration
  const retry = new Retry({
    strategy: 'fibonacci',
    maxAttempts: 5,
    initialDelayMs: 100,
    retryIf: (error: unknown) => 
      error instanceof Error && 
      !error.message.includes('PERMANENT')
  });

  // 3. Timing middleware
  retry.use(async (task, ctx, next) => {
    const start = Date.now();
    try {
      const result = await next();
      console.log(`Attempt ${ctx.attempt + 1} succeeded in ${Date.now() - start}ms`);
      return result;
    } catch (error) {
      console.log(`Attempt ${ctx.attempt + 1} failed in ${Date.now() - start}ms`);
      throw error;
    }
  });

  // 4. Error wrapping middleware
  retry.use(async (task, ctx, next) => {
    try {
      return await next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`WRAPPED: ${message}`);
    }
  });

  // 5. Event listeners
  retry.on('retry', (event) => {
    if (event.type === 'attempt') {
      console.log(`Retry scheduled (delay: ${event.delayMs}ms)`);
    }
  });

  let attempt = 0;
  
  try {
    const result = await retry.execute(async () => {
      attempt++;
      if (attempt < 3) throw new Error('Temporary failure');
      if (attempt === 4) throw new Error('PERMANENT failure');
      return 'Final success';
    });

    console.log('✅ Final result:', result);
  } catch (error) {
    console.error('❌ Critical failure:', 
      error instanceof Error ? error.message : 'Unknown error');
  }
}

main();
```

## Expected Output

### Successful Execution
```
Attempt 1 failed in 1ms
Retry scheduled (delay: 100ms)
Attempt 2 failed in 1ms
Retry scheduled (delay: 100ms)
Attempt 3 succeeded in 0ms
✅ Final result: Final success
```

### Failed Execution
```
Attempt 1 failed in 1ms
Retry scheduled (delay: 100ms)
Attempt 2 failed in 1ms
Retry scheduled (delay: 100ms)
Attempt 3 failed in 0ms
Retry scheduled (delay: 200ms)
❌ Critical failure: WRAPPED: PERMANENT failure
```

## Key Features

| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| Fibonacci Strategy     | Custom delay sequence: [0, 1, 1, 2, 3, 5, 8] * base delay                  |
| Middleware Pipeline    | Two-layer middleware for timing and error handling                         |
| Smart Retries          | Continue on temporary errors, stop on PERMANENT errors                     |
| Event Monitoring       | Real-time retry attempt tracking                                           |
| Error Transformation   | Wrapped errors with contextual information                                 |
| Type Safety            | Full TypeScript support with proper error type checking                    |

## Behavior Notes
1. **Fibonacci Sequence**: Delays follow 100ms * Fibonacci numbers (100, 100, 200, etc.)
2. **Middleware Execution**:
   - Timing middleware tracks duration of each attempt
   - Error wrapper adds context to all thrown errors
3. **Retry Logic**:
   - First 2 attempts fail with retryable errors
   - Third attempt succeeds in success scenario
   - Permanent error triggers immediate failure
4. **Event Flow**: Retry events show calculated delay times

> **Pro Tip**: Run multiple times to see different outcomes based on the attempt logic