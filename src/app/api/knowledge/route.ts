import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// GET /api/knowledge?chatbotId=xxx
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatbotId = searchParams.get('chatbotId');

    if (!chatbotId) {
      return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 });
    }

    const items = await prisma.knowledgeBase.findMany({
      where: { chatbotId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Knowledge GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/knowledge
export async function POST(req: Request) {
  try {
    // Polyfill for pdf-parse (v1.1.1 assumes some globals in certain builds)
    if (typeof global.DOMMatrix === 'undefined') {
      // @ts-ignore
      global.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
      };
    }
    if (typeof global.DOMPoint === 'undefined') {
      // @ts-ignore
      global.DOMPoint = class DOMPoint {
        x = 0; y = 0; z = 0; w = 1;
        constructor(x = 0, y = 0, z = 0, w = 1) {
          this.x = x; this.y = y; this.z = z; this.w = w;
        }
      };
    }

    const contentType = req.headers.get('content-type') || '';
    
    let chatbotId: string;
    let title: string;
    let type: 'TEXT' | 'LINK' | 'PDF' | 'CRAWL';
    let content: string = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      chatbotId = formData.get('chatbotId') as string;
      title = formData.get('title') as string;
      type = formData.get('type') as 'TEXT' | 'LINK' | 'PDF' | 'CRAWL';
      
      const file = formData.get('file') as File;
      if (file && type === 'PDF') {
        const buffer = Buffer.from(await file.arrayBuffer());
        // Use v2 API: { PDFParse } = require('pdf-parse')
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: buffer });
        try {
            const data = await parser.getText();
            content = data.text;
        } catch (pdfErr: any) {
            console.error('PDF Parse inner error:', pdfErr);
            throw new Error(`Failed to parse PDF: ${pdfErr.message}`);
        } finally {
            // Always destroy to free memory
            if (parser && typeof parser.destroy === 'function') {
                await parser.destroy();
            }
        }
      } else {
        content = formData.get('content') as string || '';
      }
    } else {
      const json = await req.json();
      chatbotId = json.chatbotId;
      title = json.title;
      type = json.type;
      content = json.content || '';
    }

    if (type === 'LINK' || type === 'CRAWL') {
      const axios = (await import('axios')).default;
      
      try {
        console.log(`[Scraper] Using Jina Reader for: ${content}`);
        const { data } = await axios.get(`https://r.jina.ai/${content}`, {
          headers: {
            'X-Return-Format': 'markdown', // markdown is very AI-friendly
          },
          timeout: 30000,
        });

        if (typeof data === 'string') {
          content = data.trim().slice(0, 50000);
        } else {
          content = JSON.stringify(data).slice(0, 50000);
        }
        
        console.log(`[Scraper] Extracted ${content.length} characters.`);
      } catch (scrapErr: any) {
        console.error('Jina Scraping error:', scrapErr);
        throw new Error('Failed to scrape content from URL: ' + (scrapErr.response?.data?.error || scrapErr.message));
      }
    }

    if (!chatbotId || !title || !type) {
      return NextResponse.json({ error: 'chatbotId, title, and type are required' }, { status: 400 });
    }

    if (!content || content.trim().length === 0) {
        return NextResponse.json({ error: 'No content extracted or provided. Knowledge base item cannot be empty.' }, { status: 400 });
    }

    const item = await prisma.knowledgeBase.create({
      data: {
        chatbotId,
        title,
        content: content || '',
        type: type as any,
      }
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Knowledge POST error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/knowledge
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.knowledgeBase.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Knowledge DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


