# Basic API Retry Example

This example demonstrates retrying failed API requests using Super-Retry with:
- Exponential backoff strategy
- 3 maximum attempts
- 1 second initial delay

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the example:
```bash
npm start
```

## Expected Output

Successful run:
```
Attempt 1 failed: Simulated API failure
Retrying in 1000ms...
Title: delectus aut autem
Completed: false
```

Failed run (after 3 attempts):
```
Attempt 1 failed: Simulated API failure
Retrying in 1000ms...
Attempt 2 failed: Simulated API failure
Retrying in 2000ms...
Attempt 3 failed: Simulated API failure
All attempts failed: Simulated API failure
```

## Key Features Demonstrated
- Automatic retry on failure
- Configurable backoff strategy
- Retry attempt tracking
- Error handling for exhausted retries