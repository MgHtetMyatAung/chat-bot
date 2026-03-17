import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const data = await req.json();

    // Verify ownership
    const existing = await prisma.chatbot.findUnique({
      where: { id, userId: session.user.id }
    });
    if (!existing) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    const updated = await prisma.chatbot.update({
      where: { id },
      data: {
        name: data.name,
        siteUrl: data.siteUrl,
        systemPrompt: data.systemPrompt,
        modelId: data.modelId,
        theme: data.theme,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Chatbot PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.chatbot.findUnique({
      where: { id, userId: session.user.id }
    });
    if (!existing) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

    await prisma.chatbot.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chatbot DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
