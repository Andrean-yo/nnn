
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

        // Add Image Proxy to thumbnail
        const proxyThumbnail = image ? `/api/proxy?url=${encodeURIComponent(image)}` : '';

        // --- CHAPTER EXTRACTION LOGIC ---
        let chapters: any[] = [];

        // 1. Try to find Manga ID for AJAX sites (Madara Theme like manhwa-raw.net)
        // Check multiple possible locations for the ID
        const mangaId = $('.rating-post-id').val() ||
            $('.rating-post-id').attr('value') ||
            $('.rating-post-id').attr('data-id') ||
            $('input[name="manga-id"]').val() ||
            $('[data-id]').attr('data-id');

        console.log(`Detected Manga ID: ${mangaId} for URL: ${url}`);

        if (mangaId && (url.includes('manhwa-raw.net') || url.includes('manhwaraw'))) {
            try {
                // Determine AJAX URL (usually same domain + /wp-admin/admin-ajax.php)
                const baseUrl = new URL(url).origin;
                const ajaxUrl = `${baseUrl}/wp-admin/admin-ajax.php`;

                const body = new URLSearchParams();
                body.append('action', 'manga_get_chapters');
                body.append('manga', mangaId.toString());

                const ajaxRes = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Referer': url
                    },
                    body: body.toString()
                });

                if (ajaxRes.ok) {
                    const ajaxHtml = await ajaxRes.text();
                    const $c = cheerio.load(ajaxHtml);

                    // Madara theme typically uses li.wp-manga-chapter or .main.version-chap li
                    const items = $c('.main.version-chap li, li.wp-manga-chapter, .wp-manga-chapter');

                    items.each((i, el) => {
                        const a = $c(el).find('a').first();
                        const title = a.text().trim();
                        const chapterUrl = a.attr('href');

                        if (chapterUrl) {
                            // Extract chapter number
                            const numMatch = title.match(/Chapter\s+(\d+(?:\.\d+)?)/i) ||
                                chapterUrl.match(/chapter-(\d+(?:\.\d+)?)/i) ||
                                title.match(/(\d+(?:\.\d+)?)$/);

                            const number = numMatch ? parseFloat(numMatch[1]) : (items.length - i);

                            chapters.push({
                                id: `scraped-${Date.now()}-${i}`,
                                number,
                                title: title || `Chapter ${number}`,
                                releasedAt: new Date().toISOString(),
                                contentUrl: chapterUrl,
                                fileName: 'Scraped Link'
                            });
                        }
                    });
                }
            } catch (err) {
                console.error('AJAX Chapter Scrape Failed:', err);
            }
        }

        // 2. Fallback: Static Extraction (For non-AJAX sites like Asura or if AJAX fails)
        if (chapters.length === 0) {
            $('.main.version-chap li, li.wp-manga-chapter, .chp-release-list li, .eplister li, #chapterlist li').each((i, el) => {
                const a = $(el).find('a').first();
                const title = a.text().trim();
                const chapterUrl = a.attr('href');

                if (chapterUrl) {
                    const numMatch = title.match(/Chapter\s+(\d+(?:\.\d+)?)/i) ||
                        chapterUrl.match(/chapter-(\d+(?:\.\d+)?)/i);
                    const number = numMatch ? parseFloat(numMatch[1]) : 0;

                    chapters.push({
                        id: `static-${Date.now()}-${i}`,
                        number,
                        title: title || `Chapter ${number}`,
                        releasedAt: new Date().toISOString(),
                        contentUrl: chapterUrl,
                        fileName: 'Scraped Link'
                    });
                }
            });
        }

        // Clean up title
        const cleanTitle = title.replace(/ - Asura Scans$/, '')
            .replace(/ \| Asura Scans$/, '')
            .replace(/ [-\|] Manhwa-Raw$/i, '')
            .replace(/ [-\|] Manhwaraw$/i, '')
            .trim();

        return NextResponse.json({
            title: cleanTitle,
            description: description.trim(),
            thumbnail: proxyThumbnail || image,
            chapters: chapters.sort((a, b) => b.number - a.number),
            sourceUrl: url
        });

    } catch (error: any) {
        console.error('Scrape error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
