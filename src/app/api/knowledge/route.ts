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
    let type: 'TEXT' | 'LINK' | 'PDF';
    let content: string = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      chatbotId = formData.get('chatbotId') as string;
      title = formData.get('title') as string;
      type = formData.get('type') as 'TEXT' | 'LINK' | 'PDF';
      
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

      if (type === 'LINK') {
        // Dynamic imports for scraping utilities
        const axios = (await import('axios')).default;
        const cheerio = await import('cheerio');
        
        try {
          const { data } = await axios.get(content, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            },
            timeout: 15000
          });
          const $ = cheerio.load(data);
          
          // Remove noise
          $('script, style, nav, footer, iframe, aside, .cookie-banner, #footer').remove();
          
          // Focus on main content if possible
          const mainContent = $('main, article, #content, .content').length > 0 
            ? $('main, article, #content, .content').first().text()
            : $('body').text();
            
          content = mainContent.replace(/\s+/g, ' ').trim().slice(0, 30000);
        } catch (scrapErr: any) {
          console.error('Scraping error:', scrapErr);
          throw new Error('Failed to scrape content from URL: ' + scrapErr.message);
        }
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
        type,
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


