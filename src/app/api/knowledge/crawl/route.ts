import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let baseUrl: string;
    try {
      const parsed = new URL(url);
      baseUrl = parsed.origin;
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    console.log(`[Crawler] Discovering links via Jina for: ${url}`);
    const { data } = await axios.get(`https://r.jina.ai/${url}`, {
      headers: {
        'X-Return-Format': 'markdown',
      },
      timeout: 20000,
    });

    const links: string[] = [];
    
    // Simple regex to find links in markdown [text](url)
    const linkRegex = /\[.*?\]\((https?:\/\/.*?)\)/g;
    let match;
    
    while ((match = linkRegex.exec(data)) !== null) {
      const absolute = match[1].split('#')[0];
      
      try {
        if (absolute.startsWith(baseUrl) && !links.includes(absolute)) {
           if (!absolute.match(/\.(jpg|jpeg|png|gif|pdf|zip|gz|tar|exe|dmg|iso)$/i)) {
             links.push(absolute);
           }
        }
      } catch {
        // Ignored
      }
    }

    // fallback to original URL if no links found
    if (links.length === 0) links.push(url);

    return NextResponse.json({ links: Array.from(new Set(links)) });
  } catch (err: any) {
    console.error('Crawl link discovery error:', err);
    return NextResponse.json({ error: 'Failed to discover links: ' + err.message }, { status: 500 });
  }
}
