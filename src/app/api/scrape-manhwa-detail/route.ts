import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
    const slug = req.nextUrl.searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    try {
        const url = `https://manhwa-raw.net/manga/${slug}/`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch manhwa page: ${response.statusText}`);

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract manhwa details
        const title = $('.post-title h1').first().text().trim() || $('h1').first().text().trim();
        const thumbnail = $('.summary_image img').first().attr('src') || $('.summary_image img').first().attr('data-src') || '';
        const description = $('.summary__content p').text().trim() || $('.description-summary p').text().trim() || 'No description available';

        // Extract genres
        const genres: string[] = [];
        $('.post-content_item.genres .summary-content a, .genres-content a').each((_, el) => {
            const genre = $(el).text().trim();
            if (genre) genres.push(genre);
        });

        // Extract status
        let status: 'Ongoing' | 'Completed' = 'Ongoing';
        $('.post-status .summary-content').each((_, el) => {
            const text = $(el).text().trim().toLowerCase();
            if (text.includes('completed') || text.includes('complete')) {
                status = 'Completed';
            }
        });

        // Extract chapters
        const chapters: any[] = [];
        $('li.wp-manga-chapter, .wp-manga-chapter, .version-chap li').each((_, el) => {
            const chapterLink = $(el).find('a').first();
            const chapterUrl = chapterLink.attr('href');
            const chapterText = chapterLink.text().trim();

            // Extract chapter number from text or URL
            const chapterMatch = chapterText.match(/chapter[\\s-]*(\\d+(?:\\.\\d+)?)/i) ||
                chapterUrl?.match(/chapter[\\s-]*(\\d+(?:\\.\\d+)?)/i);

            if (chapterMatch && chapterUrl) {
                const chapterNumber = parseFloat(chapterMatch[1]);

                // Get release date if available
                const releaseDate = $(el).find('.chapter-release-date').text().trim() ||
                    $(el).find('.post-on').text().trim() ||
                    new Date().toISOString();

                chapters.push({
                    number: chapterNumber,
                    title: chapterText || `Chapter ${chapterNumber}`,
                    contentUrl: chapterUrl,
                    releasedAt: releaseDate
                });
            }
        });

        // Sort chapters by number (descending)
        chapters.sort((a, b) => b.number - a.number);

        const lastChapter = chapters.length > 0 ? Math.max(...chapters.map(c => c.number)) : 0;

        return NextResponse.json({
            slug,
            title,
            thumbnail,
            description,
            genres,
            status,
            type: 'Manhwa',
            last_chapter: lastChapter,
            chapters
        });

    } catch (error: any) {
        console.error('Manhwa Detail Scrape Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
