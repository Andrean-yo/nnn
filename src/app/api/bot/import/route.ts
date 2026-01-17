import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, mode = 'import', range } = body;
        // mode: 'preview' | 'import'
        // range: { from: number, to: number } (optional)

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`[Bot] Request: ${url}, Mode: ${mode}`);

        // 1. Fetch Page Content & Scrape
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        if (!response.ok) {
            console.error(`[Bot Error] Fetch failed: ${response.status} ${response.statusText}`);
            return NextResponse.json({
                error: `Gagal akses website (${response.status} ${response.statusText}). Kemungkinan diblokir atau domain salah.`
            }, { status: 400 });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Metadata
        const title = $('.post-title h1').first().text().trim() || $('h1').first().text().trim() || 'Unknown Title';
        const thumbnail = $('.summary_image img').first().attr('src') || $('.summary_image img').first().attr('data-src') || '';
        const description = $('.summary__content p').text().trim() || 'No description';

        // Detect Chapters
        const baseUrl = url.replace(/\/$/, '');
        let chapters: number[] = [];

        // AJAX method check
        const mangaId = $('.rating-post-id').val() || $('input[name="manga-id"]').val() || $('[data-id]').attr('data-id');
        if (mangaId) {
            try {
                const origin = new URL(url).origin;
                const ajaxUrl = `${origin}/wp-admin/admin-ajax.php`;
                const bodyParams = new URLSearchParams();
                bodyParams.append('action', 'manga_get_chapters');
                bodyParams.append('manga', mangaId.toString());

                const ajaxRes = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: bodyParams.toString()
                });

                if (ajaxRes.ok) {
                    const ajaxHtml = await ajaxRes.text();
                    const $c = cheerio.load(ajaxHtml);
                    $c('a[href*="chapter"]').each((_, el) => {
                        const href = $c(el).attr('href') || '';
                        // More flexible regex for chapter numbers
                        const match = href.match(/chapter-(\d+(?:\.\d+)?)/i) ||
                            href.replace(/\/$/, '').match(/-(\d+(?:\.\d+)?)$/) ||
                            href.match(/\/(\d+)\/$/);
                        if (match) chapters.push(parseFloat(match[1]));
                    });
                }
            } catch (e) { console.error('AJAX detect failed', e); }
        }

        if (chapters.length === 0) {
            // Broader static detection
            $('a[href*="chapter"], .wp-manga-chapter a').each((_, el) => {
                const href = $(el).attr('href') || '';
                const match = href.match(/chapter-(\d+(?:\.\d+)?)/i) ||
                    href.replace(/\/$/, '').match(/-(\d+(?:\.\d+)?)$/);
                if (match) chapters.push(parseFloat(match[1]));
            });
        }

        const uniqueChapters = Array.from(new Set(chapters)).sort((a, b) => a - b);
        const totalDetected = uniqueChapters.length;
        const minChapter = totalDetected > 0 ? Math.min(...uniqueChapters) : 1;
        const maxChapter = totalDetected > 0 ? Math.max(...uniqueChapters) : 1;

        // --- PREVIEW MODE ---
        if (mode === 'preview') {
            return NextResponse.json({
                success: true,
                mode: 'preview',
                data: {
                    title,
                    thumbnail,
                    description: description.substring(0, 200) + '...',
                    total_chapters: totalDetected,
                    range_start: minChapter,
                    range_end: maxChapter
                }
            });
        }

        // --- IMPORT MODE ---

        // Determine range
        const start = range?.from || minChapter;
        const end = range?.to || maxChapter;

        // Authenticate (Try bypass)
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: 'dev@indra.com',
            password: 'dev123'
        });
        if (authError) console.warn('[Bot] Auth warn:', authError.message);

        // Insert Manhwa
        const { data: insertedManhwa, error: manhwaError } = await supabase
            .from('manhwas')
            .insert([{
                title: title,
                description: description,
                thumbnail_url: thumbnail,
                status: 'Ongoing',
                type: 'Manhwa',
                genres: []
            }])
            .select()
            .single();

        if (manhwaError) throw new Error(`DB Insert Manhwa Error: ${manhwaError.message}`);
        if (!insertedManhwa) throw new Error(`Gagal membuat data Manhwa di database (RLS mungkin aktif).`);

        // Insert Chapters
        const records = [];
        for (let i = start; i <= end; i++) {
            records.push({
                manhwa_id: insertedManhwa.id,
                number: i,
                title: `Chapter ${i}`,
                released_at: new Date().toISOString(),
                content_url: `${baseUrl}/chapter-${i}/`
            });
        }

        const { error: chapterError } = await supabase
            .from('chapters')
            .insert(records);

        if (chapterError) throw new Error(`DB Insert Chapters Error: ${chapterError.message}`);

        return NextResponse.json({
            success: true,
            mode: 'import',
            title,
            imported_count: records.length,
            range: `${start}-${end}`,
            message: `Successfully imported "${title}" (${records.length} chapters).`
        });

    } catch (error: any) {
        console.error('[Bot Import Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
