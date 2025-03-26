import { Retry, registerStrategy } from 'super-retry';

// Custom Fibonacci backoff strategy with explicit types
registerStrategy('fibonacci', (attempt: number, base: number) => 
  [0, 1, 1, 2, 3, 5, 8][attempt] * base
);

async function main() {
  const retry = new Retry({
    strategy: 'fibonacci',
    maxAttempts: 5,
    initialDelayMs: 100,
    retryIf: (error: unknown) => 
      error instanceof Error && 
      !error.message.includes('PERMANENT')
  });

  // Middleware 1: Request timing
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

  // Middleware 2: Error wrapping with type safety
  retry.use(async (task, ctx, next) => {
    try {
      return await next();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`WRAPPED: ${message}`);
    }
  });

  // Event listeners
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