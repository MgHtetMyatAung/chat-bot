import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const apiKey = process.env.OPENROUTER_API_KEY || 'dummy_key';
console.log(`[OpenRouter] API Key loaded (starting with ${apiKey.substring(0, 5)}...)`);

export const openrouter = createOpenRouter({
    apiKey: apiKey,
});
