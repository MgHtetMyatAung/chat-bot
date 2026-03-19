import { streamText } from 'ai';
import { openrouter } from '@/lib/openrouter';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Conversation-Id',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { messages, apiKey, conversationId: existingConvId, visitorId } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized: Missing API Key' }, { status: 401 });
    }

    const chatbot = await prisma.chatbot.findUnique({
      where: { apiKey }
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    // Fetch all knowledge base items for this chatbot
    const knowledgeBase = await prisma.knowledgeBase.findMany({
      where: { chatbotId: chatbot.id }
    });

    console.log(`[Chat API] Found ${knowledgeBase.length} knowledge entries for chatbot ${chatbot.id}`);

    // Build a structured knowledge context block
    let knowledgeContext = '';
    if (knowledgeBase.length > 0) {
      const entries = knowledgeBase.map((kb: any, index: number) => {
        return `DOCUMENT ${index + 1}: ${kb.title} (Type: ${kb.type})\n---\n${kb.content}\n---`;
      });
      
      knowledgeContext = `
# KNOWLEDGE BASE CONTEXT
Use the following documentation to help answer user questions. 
If the information is in the context, use it to provide a helpful answer.
If the context doesn't explicitly answer the question, try to provide a general helpful answer but state that you don't have the specific details if necessary.

---
${entries.join('\n\n')}
---
`;
    }

    const basePrompt = chatbot.systemPrompt || 'You are a helpful customer support assistant.';
    const finalSystemPrompt = `${basePrompt}\n${knowledgeContext}`;

    console.log('[Chat API] Final System Prompt Length:', finalSystemPrompt.length);

    // Get or create conversation
    let conversationId = existingConvId;
    const vid = visitorId || 'preview-' + Date.now();

    if (!conversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          chatbotId: chatbot.id,
          visitorId: vid,
        }
      });
      conversationId = conversation.id;
    }

    // Save user message to DB
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg && lastUserMsg.role === 'user') {
      await prisma.message.create({
        data: {
          conversationId,
          role: 'user',
          content: lastUserMsg.content,
        }
      });
    }

    // Call OpenRouter
    const result = streamText({
      model: openrouter(chatbot.modelId),
      system: finalSystemPrompt,
      messages,
      onFinish: async ({ text }) => {
        try {
          await prisma.message.create({
            data: {
              conversationId,
              role: 'assistant',
              content: text,
            }
          });
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
          });
        } catch (err) {
          console.error('[Chat API] Failed to save assistant message:', err);
        }
      }
    });

    const response = result.toTextStreamResponse();
    response.headers.set('X-Conversation-Id', conversationId);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Expose-Headers', 'X-Conversation-Id');
    return response;
  } catch (error) {
    console.error('[Chat API] Critical Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
