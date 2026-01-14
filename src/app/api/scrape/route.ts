
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
                'Accept-Encoding': 'gzip, deflate, br',
                'Referer': 'https://www.google.com/',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'none',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1'
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

        // Add Image Proxy to thumbnail if it's an external URL
        const proxyThumbnail = image ? `/api/proxy?url=${encodeURIComponent(image)}` : '';

        // Extract Chapters (Targeting common structures like Madara/WP-Manga)
        const chapters: any[] = [];
        $('.main.version-chap li, li.wp-manga-chapter').each((i, el) => {
            const a = $(el).find('a').first();
            const date = $(el).find('.chapter-release-date').text().trim();
            const title = a.text().trim();
            const url = a.attr('href');

            if (url) {
                // Try to extract chapter number from title or URL
                const numMatch = title.match(/Chapter\s+(\d+)/i) || url.match(/chapter-(\d+)/i);
                const number = numMatch ? parseFloat(numMatch[1]) : 0;

                chapters.push({
                    id: `scraped-${Date.now()}-${i}`,
                    number,
                    title: title || `Chapter ${number}`,
                    releasedAt: new Date().toISOString(), // Mocking date for now as parsing varied formats is tricky
                    contentUrl: url,
                    fileName: 'Scraped Link'
                });
            }
        });

        // Clean up title
        const cleanTitle = title.replace(/ - Asura Scans$/, '')
            .replace(/ \| Asura Scans$/, '')
            .replace(/ - Manhwa-Raw$/, '')
            .replace(/ – Manhwa-Raw$/, '')
            .trim();

        return NextResponse.json({
            title: cleanTitle,
            description: description.trim(),
            thumbnail: proxyThumbnail || image,
            chapters: chapters.sort((a, b) => b.number - a.number), // Newest first
            sourceUrl: url
        });

    } catch (error: any) {
        console.error('Scrape error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
