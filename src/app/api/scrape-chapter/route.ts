
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Referer': new URL(url).origin
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch chapter page: ${response.statusText}`);

        const html = await response.text();
        const $ = cheerio.load(html);

        const images: string[] = [];

        // Common selectors for chapter images
        const selectors = [
            '.reading-content img',
            '.page-break img',
            '#chapter-video-frame img',
            '.entry-content img',
            '.vung-doc img',
            '.wp-manga-chapter-img'
        ];

        selectors.forEach(selector => {
            $(selector).each((_, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
                if (src) {
                    const cleanSrc = src.trim();
                    // Filter out small icons/placeholders
                    if (cleanSrc.startsWith('http') && !images.includes(cleanSrc)) {
                        // Route through proxy to fix hotlinking
                        images.push(`/api/proxy?url=${encodeURIComponent(cleanSrc)}`);
                    }
                }
            });
        });

        return NextResponse.json({ images });

    } catch (error: any) {
        console.error('Chapter Scrape Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
