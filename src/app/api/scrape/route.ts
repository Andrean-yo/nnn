
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.google.com/'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch: ${response.statusText}` }, { status: response.status });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Metadata extraction logic
        const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';

        // Handle broken [object Object] description from Asura Scans
        let description = $('meta[property="og:description"]').attr('content') || '';
        if (description.includes('[object Object]') || !description) {
            // Fallback to searching for summary in the body
            description = $('.series-synopsis, .summary__content, .entry-content p, #description-text').first().text() ||
                $('meta[name="description"]').attr('content') || '';
        }

        const image = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content') || '';

        // Clean up title
        const cleanTitle = title.replace(/ - Asura Scans$/, '').replace(/ \| Asura Scans$/, '').trim();

        return NextResponse.json({
            title: cleanTitle,
            description: description.trim(),
            thumbnail: image,
            sourceUrl: url
        });

    } catch (error: any) {
        console.error('Scrape error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
