import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req: NextRequest) {
    try {
        const url = 'https://manhwa-raw.net/';
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch homepage: ${response.statusText}`);

        const html = await response.text();
        const $ = cheerio.load(html);

        const manhwas: { slug: string; title: string; thumbnail: string }[] = [];

        // Extract manhwa from various sections
        $('.item-summary, .manga-item, .item, .post-title').each((_, el) => {
            const link = $(el).find('a').first();
            const href = link.attr('href');
            const title = link.text().trim() || link.attr('title') || '';
            const img = $(el).find('img').first();
            const thumbnail = img.attr('src') || img.attr('data-src') || '';

            if (href && title) {
                // Extract slug from URL
                const slugMatch = href.match(/\/manga\/([^\/]+)\/?/);
                if (slugMatch) {
                    const slug = slugMatch[1];

                    // Avoid duplicates
                    if (!manhwas.find(m => m.slug === slug)) {
                        manhwas.push({
                            slug,
                            title,
                            thumbnail
                        });
                    }
                }
            }
        });

        // Also try to extract from links directly
        $('a[href*="/manga/"]').each((_, el) => {
            const href = $(el).attr('href');
            const title = $(el).text().trim() || $(el).attr('title') || '';

            if (href && title && !title.toLowerCase().includes('chapter')) {
                const slugMatch = href.match(/\/manga\/([^\/]+)\/?/);
                if (slugMatch) {
                    const slug = slugMatch[1];

                    // Avoid duplicates and filter out chapter links
                    if (!manhwas.find(m => m.slug === slug) && !slug.includes('chapter')) {
                        manhwas.push({
                            slug,
                            title,
                            thumbnail: ''
                        });
                    }
                }
            }
        });

        // Remove duplicates and filter invalid entries
        const uniqueManhwas = manhwas.filter((m, index, self) =>
            index === self.findIndex(t => t.slug === m.slug) &&
            m.slug &&
            m.title &&
            !m.slug.includes('chapter')
        );

        return NextResponse.json({
            manhwas: uniqueManhwas,
            total: uniqueManhwas.length
        });

    } catch (error: any) {
        console.error('Homepage Scrape Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
