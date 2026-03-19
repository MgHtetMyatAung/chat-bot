import { streamText } from 'ai';
import { openrouter } from '@/lib/openrouter';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Simple in-memory rate limiter for serverless environment (use Redis for production)
const rateLimitMap = new Map<string, { count: number, lastTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per IP

function isRateLimited(ip: string) {
  const now = Date.now();
  const userData = rateLimitMap.get(ip);
  
  if (!userData) {
    rateLimitMap.set(ip, { count: 1, lastTime: now });
    return false;
  }
  
  if (now - userData.lastTime > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastTime: now });
    return false;
  }
  
  if (userData.count >= MAX_REQUESTS) {
    return true;
  }
  
  userData.count += 1;
  return false;
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin') || '*';
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Conversation-Id',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const origin = req.headers.get('origin') || '';
  
  // 1. Rate Limiting check
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  try {
    const { messages, apiKey, conversationId: existingConvId, visitorId } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized: Missing API Key' }, { status: 401 });
    }

    // 2. Fetch chatbot and verify API key
    const chatbot = await prisma.chatbot.findUnique({
      where: { apiKey }
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    // 3. Security: Origin check (Domain Pinning)
    // In production, we strictly match. For localhost/dev we allow.
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        const cleanOrigin = origin.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const cleanSiteUrl = (chatbot.siteUrl || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        if (cleanSiteUrl && !cleanOrigin.endsWith(cleanSiteUrl)) {
            console.warn(`[Security] Blocked unauthorized origin: ${origin} for chatbot ${chatbot.name}`);
            return NextResponse.json({ error: 'Forbidden: Unauthorized Domain' }, { status: 403 });
        }
    }

    // 4. Input Sanitization/Limiting
    if (!messages || !Array.isArray(messages) || messages.length > 50) {
        return NextResponse.json({ error: 'Invalid message history' }, { status: 400 });
    }

    // Fetch knowledge base entries
    const knowledgeBase = await prisma.knowledgeBase.findMany({
      where: { chatbotId: chatbot.id }
    });

    console.log(`[Chat API] Processing request for ${chatbot.name} (${origin || 'direct'})`);

    const isStrict = (chatbot as any).responseMode === 'STRICT';
    let knowledgeContext = '';

    if (knowledgeBase.length > 0) {
      const entries = knowledgeBase.map((kb: any, index: number) => {
        return `DOCUMENT ${index + 1}: ${kb.title}\n---\n${kb.content}\n---`;
      });
      
      knowledgeContext = isStrict 
        ? `\n# STRICT MODE RULES\n1. ONLY use the provided documentation to answer factual questions.\n2. Greetings and polite small talk are allowed.\n3. If answer not in docs, politely refuse.\n---\n${entries.join('\n\n')}\n---`
        : `\n# CONTEXT\nUse this to help:\n---\n${entries.join('\n\n')}\n---`;
    }

    const basePrompt = chatbot.systemPrompt || 'You are a helpful customer support assistant.';
    const finalSystemPrompt = `${basePrompt}\n${knowledgeContext}`;

    // Get or create conversation
    let conversationId = existingConvId;
    const vid = visitorId || 'v-' + Math.random().toString(36).substring(7);

    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: { chatbotId: chatbot.id, visitorId: vid }
      });
      conversationId = conversation.id;
    }

    // Save user message to DB
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg && lastUserMsg.role === 'user') {
      await prisma.message.create({
        data: { conversationId, role: 'user', content: lastUserMsg.content.slice(0, 5000) }
      });
    }

    // Call OpenRouter
    const result = streamText({
      model: openrouter(chatbot.modelId),
      system: finalSystemPrompt.slice(0, 100000), // Safety cap for context
      messages,
      onFinish: async ({ text }) => {
        try {
          await prisma.message.create({
            data: { conversationId, role: 'assistant', content: text }
          });
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
          });
        } catch (err) {
          console.error('[Chat API] Failed to log response:', err);
        }
      }
    });

    const response = result.toTextStreamResponse();
    response.headers.set('X-Conversation-Id', conversationId);
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set('Access-Control-Expose-Headers', 'X-Conversation-Id');
    return response;

  } catch (error) {
    console.error('[Chat API] Critical Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
