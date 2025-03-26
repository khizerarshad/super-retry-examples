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
      maxAttempts: 3,  // Increased to 3 attempts
      initialDelayMs: 500
    });
  
    // Add failure simulation
    let attemptCount = 0;
    
    retry.use(async (task, context, next) => {
      const start = Date.now();
      try {
        // Simulate 50% failure rate
        if (Math.random() < 0.5) {
          throw new Error('Random failure');
        }
        
        const result = await next();
        const duration = Date.now() - start;
        
        return {
          data: result,
          metadata: {
            duration,
            attempts: context.attempt + 1
          }
        } as ResultWithMetadata<typeof result>;
      } catch (error) {
        const duration = Date.now() - start;
        console.log(`Attempt ${context.attempt + 1} failed after ${duration}ms`);
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
      const result = await retry.execute(async () => ({
        id: Date.now(),
        message: 'Middleware test'
      }));
  
      console.log('✅ Final result:', result);
    } catch (error) {
      console.error('❌ Execution failed:', error);
    }
  }

main();