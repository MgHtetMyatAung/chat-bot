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
      const entries = knowledgeBase.map((kb: any) => {
        return `[DOCUMENT: ${kb.title}]\nType: ${kb.type}\nContent: ${kb.content}\n`;
      });
      
      knowledgeContext = `
=== SYSTEM INSTRUCTIONS: KNOWLEDGE BASE INTEGRATION ===
You have access to a specific Knowledge Base provided below. 
Rules:
1. Always prioritize information from the Knowledge Base over your general training data.
2. If the user's question relates to the Knowledge Base, use that information to answer.
3. If the Knowledge Base contains the answer, try to be specific and helpful.
4. If the question CANNOT be answered using the Knowledge Base (and it's a customer support context), politely inform the user that you don't have that specific information and offer general assistance or suggest they contact support.
5. Do not mention "The Knowledge Base" to the user; just answer naturally as if you know this information.

=== START KNOWLEDGE BASE ===
${entries.join('\n\n')}
=== END KNOWLEDGE BASE ===
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
