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
                'Referer': 'https://www.google.com/',
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch: ${response.statusText}` }, { status: response.status });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract base URL for building chapter URLs
        const baseUrl = url.replace(/\/$/, ''); // Remove trailing slash

        // Try to find chapters via AJAX first (Madara theme)
        let chapters: number[] = [];

        const mangaId = $('.rating-post-id').val() ||
            $('.rating-post-id').attr('value') ||
            $('input[name="manga-id"]').val() ||
            $('[data-id]').attr('data-id');

        if (mangaId) {
            try {
                const origin = new URL(url).origin;
                const ajaxUrl = `${origin}/wp-admin/admin-ajax.php`;

                const body = new URLSearchParams();
                body.append('action', 'manga_get_chapters');
                body.append('manga', mangaId.toString());

                const ajaxRes = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': url
                    },
                    body: body.toString()
                });

                if (ajaxRes.ok) {
                    const ajaxHtml = await ajaxRes.text();
                    const $c = cheerio.load(ajaxHtml);

                    $c('a[href*="chapter"]').each((_, el) => {
                        const href = $c(el).attr('href') || '';
                        const text = $c(el).text();

                        // Extract chapter number from URL or text
                        const match = href.match(/chapter-(\d+)/i) ||
                            text.match(/chapter\s*(\d+)/i) ||
                            href.match(/(\d+)\/?$/);

                        if (match) {
                            chapters.push(parseInt(match[1]));
                        }
                    });
                }
            } catch (err) {
                console.error('AJAX chapter detection failed:', err);
            }
        }

        // Fallback: Static extraction from page
        if (chapters.length === 0) {
            $('a[href*="chapter"]').each((_, el) => {
                const href = $(el).attr('href') || '';
                const text = $(el).text();

                // Extract chapter number
                const match = href.match(/chapter-(\d+)/i) ||
                    text.match(/chapter\s*(\d+)/i);

                if (match) {
                    chapters.push(parseInt(match[1]));
                }
            });
        }

        // Get unique chapters and find the max
        const uniqueChapters = Array.from(new Set(chapters));
        const lastChapter = uniqueChapters.length > 0 ? Math.max(...uniqueChapters) : 0;
        const firstChapter = uniqueChapters.length > 0 ? Math.min(...uniqueChapters) : 1;

        // Build chapter URL pattern
        const chapterUrlPattern = `${baseUrl}/chapter-1/`;
        const chapterPattern = 'chapter-1';

        return NextResponse.json({
            success: true,
            baseUrl,
            lastChapter,
            firstChapter,
            totalChapters: uniqueChapters.length,
            chapterUrlPattern,
            chapterPattern,
            detectedChapters: uniqueChapters.sort((a, b) => a - b)
        });

    } catch (error: any) {
        console.error('Detect chapters error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
