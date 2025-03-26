"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const super_retry_1 = require("super-retry");
const axios_1 = __importDefault(require("axios"));
// Configure retry with exponential backoff
const retry = new super_retry_1.Retry({
    strategy: 'exponential',
    maxAttempts: 3,
    initialDelayMs: 1000
});
function fetchTodo(todoId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://jsonplaceholder.typicode.com/todos/${todoId}`;
        // Random failure simulation (30% chance)
        if (Math.random() < 0.3) {
            throw new Error('Simulated API failure');
        }
        try {
            const response = yield axios_1.default.get(url);
            return response.data;
        }
        catch (error) {
            const axiosError = error;
            throw new Error(`API request failed: ${axiosError.message}`);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const todoId = 1;
        try {
            const result = yield retry.execute(() => fetchTodo(todoId), {
                onRetry: (attempt, delay, error) => {
                    console.log(`Attempt ${attempt} failed: ${error.message}`);
                    console.log(`Retrying in ${delay}ms...\n`);
                }
            });
            console.log('✅ Successfully fetched:');
            console.log(`📌 Title: ${result.title}`);
            console.log(`✔️ Completed: ${result.completed}`);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`❌ All attempts failed: ${error.message}`);
            }
            else {
                console.error('❌ Unknown error occurred:', error);
            }
        }
    });
}
main();
