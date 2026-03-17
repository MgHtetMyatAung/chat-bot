import { openrouter } from "./src/lib/openrouter";
import { generateText } from "ai";
import * as dotenv from "dotenv";

dotenv.config();

async function test() {
    try {
        console.log('Testing OpenRouter...');
        const { text } = await generateText({
            model: openrouter('openai/gpt-4o-mini'),
            prompt: 'Explain what a knowledge base is in 10 words.',
        });
        console.log('Response:', text);
    } catch (err) {
        console.error('Error:', err);
    }
}

test();
