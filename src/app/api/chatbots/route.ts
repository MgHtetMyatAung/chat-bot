import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const chatbots = await prisma.chatbot.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(chatbots);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    
    // Validate core fields
    if (!data.name || !data.siteUrl || !data.systemPrompt) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const chatbot = await prisma.chatbot.create({
      data: {
        name: data.name,
        siteUrl: data.siteUrl,
        systemPrompt: data.systemPrompt,
        modelId: data.modelId || 'openai/gpt-4o-mini',
        theme: data.theme || '#3b82f6',
        userId: session.user.id
      }
    });

    return NextResponse.json(chatbot);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
