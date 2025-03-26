# Middleware Integration Example

This example demonstrates using Super-Retry middleware to:
- Add request timing metrics
- Transform response format
- Handle errors in middleware
- Track retry attempts

## Features Demonstrated
- Custom middleware implementation
- Retry event handling
- Type-safe result transformation
- Error tracking in middleware
- Context-aware attempt counting

## Setup

1. Navigate to example directory:
```bash
cd examples/middleware
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
import { Retry } from 'super-retry';

interface ResultWithMetadata<T> {
  data: T;
  metadata: {
    duration: number;
    attempts: number;
  };
}

async function main() {
  const retry = new Retry({
    strategy: 'fixed',
    maxAttempts: 3,
    initialDelayMs: 500
  });

  // Add middleware with 50% failure rate
  retry.use(async (task, context, next) => {
    const start = Date.now();
    try {
      if (Math.random() < 0.5) {
        throw new Error('Random middleware failure');
      }
      
      const result = await next();
      return {
        data: result,
        metadata: {
          duration: Date.now() - start,
          attempts: context.attempt + 1
        }
      } as ResultWithMetadata<typeof result>;
    } catch (error) {
      console.log(`Attempt ${context.attempt + 1} failed`);
      throw error;
    }
  });

  // Add retry event listener
  retry.on('retry', (event) => {
    if (event.type === 'attempt') {
      console.log(`Scheduling retry #${event.attempt} in ${event.delayMs}ms`);
    }
  });

  try {
    const result = await retry.execute(() => ({
      id: Date.now(),
      message: 'Middleware test'
    }));
    
    console.log('✅ Final result:', result);
  } catch (error) {
    console.error('❌ All attempts failed:', error.message);
  }
}

main();
```

## Expected Outputs

### Successful Execution (No Retries)
```
✅ Final result: {
  data: { id: 1742934054609, message: 'Middleware test' },
  metadata: { duration: 1, attempts: 1 }
}
```

### Successful Execution (With Retries)
```
Attempt 1 failed
Scheduling retry #1 in 500ms
Attempt 2 failed
Scheduling retry #2 in 500ms
✅ Final result: {
  data: { id: 1742934054612, message: 'Middleware test' },
  metadata: { duration: 502, attempts: 3 }
}
```

### Failed Execution
```
Attempt 1 failed
Scheduling retry #1 in 500ms
Attempt 2 failed
Scheduling retry #2 in 500ms
Attempt 3 failed
❌ All attempts failed: Task failed after 3 attempts
```

## Behavior Notes
- 50% random failure rate in middleware
- Fixed 500ms delay between attempts
- Metadata includes timing and attempt count
- Final result wrapped in type-safe container
- Run multiple times to see different outcomes
