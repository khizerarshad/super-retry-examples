import { Retry } from 'super-retry';
import axios, { AxiosError } from 'axios';

// Define TypeScript interface for Todo response
interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

async function fetchTodo(todoId: number): Promise<Todo> {
  const url = `https://jsonplaceholder.typicode.com/todos/${todoId}`;
  
  // Random failure simulation (50% chance)
  if (Math.random() < 0.3) {
    throw new Error('Simulated API failure');
  }

  try {
    const response = await axios.get<Todo>(url);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(`API request failed: ${axiosError.message}`);
  }
}

async function main() {
  const todoId = 1;
  
  // Configure retry with exponential backoff
  const retry = new Retry({
    strategy: 'exponential',
    maxAttempts: 3,
    initialDelayMs: 1000
  });

  // Correct event listener with type checking
  /*retry.on('retry', (event) => {
    // First check if it's an attempt event
    if (event.type === 'attempt') {
      console.log(`Attempt ${event.attempt} failed: ${event.error}`);
      console.log(`Retrying in ${event.delayMs}ms...\n`);
    }
  });*/

  retry.on('retry', (event) => {
    if (event.type === 'attempt') {
      console.log(`[DEBUG] Retry attempt ${event.attempt}:`);
      console.log(`[DEBUG] Error: ${event.error}`);
      console.log(`[DEBUG] Next delay: ${event.delayMs}ms\n`);
    }
  });

  try {
    const result = await retry.execute(() => fetchTodo(todoId));
    
    console.log('✅ Successfully fetched:');
    console.log(`📌 Title: ${result.title}`);
    console.log(`✔️ Completed: ${result.completed}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ All attempts failed: ${error.message}`);
    } else {
      console.error('❌ Unknown error occurred:', error);
    }
  }
}

main();