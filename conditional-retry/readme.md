# Conditional Retry Example

This example demonstrates error-specific retry logic using Super-Retry's `retryIf` predicate.

## Features Demonstrated
- Error type discrimination
- Conditional retry logic
- Custom error classes
- Exponential backoff strategy
- Error-specific termination

## Setup

1. Navigate to the example directory:
```bash
cd examples/conditional-retry
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

// Custom error classes
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
      
      // Error simulation
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
```

## Expected Output

### Failed Execution (Non-Retryable Error)
```
❌ Final error: Invalid input
```

### Successful Execution (All Retryable Errors)
```typescript
// Modified execute callback for success scenario:
if (attempt <= 2) throw new NetworkError(`Attempt ${attempt} failed`);
return 'Operation succeeded';
```

Output:
```
✅ Result: Operation succeeded
```

## Key Features
- **Error Discrimination**: Differentiates between retryable (NetworkError) and non-retryable (ValidationError) errors
- **Conditional Logic**: Uses `retryIf` predicate to control retry behavior
- **Exponential Backoff**: 500ms → 1000ms → 2000ms delays between attempts
- **Clean Termination**: Stops immediately on non-retryable errors

## Behavior Notes
- The `retryIf` predicate only retries for NetworkError instances
- ValidationError immediately terminates the retry process
- Max attempts includes both initial attempt and retries
- Exponential delays double with each attempt (500ms, 1000ms, 2000ms)

## Usage Patterns
1. **Transient Errors**: Retry network/timeout issues
2. **Permanent Errors**: Fail fast on validation/business logic errors
3. **Mixed Scenarios**: Combine retryable and non-retryable errors

> **Note**: Run multiple times to see different failure scenarios