import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ apiKey: string }> }) {
  try {
    const resolvedParams = await params;
    const { apiKey } = resolvedParams;

    const chatbot = await prisma.chatbot.findUnique({
      where: { apiKey }
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
    }

    // Return the safe configuration for the widget
    const response = NextResponse.json({
      name: chatbot.name,
      theme: chatbot.theme,
      apiKey: chatbot.apiKey
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    return response;

  } catch (error) {
    console.error('Widget API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
