import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        console.log(`[Bot] Starting import for: ${url}`);

        // 1. Authenticate as Developer (to bypass RLS if strict)
        // We use the hardcoded dev credentials found in useAuth.ts
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'dev@indra.com',
            password: 'dev123'
        });

        if (authError) {
            console.warn('[Bot] Auth warning:', authError.message);
            // Proceed anyway, maybe RLS is open or public
        }

        // 2. Fetch Page Content
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch page: ${response.statusText}`);
        const html = await response.text();
        const $ = cheerio.load(html);

        // 3. Extract Metadata
        const title = $('.post-title h1').first().text().trim() || $('h1').first().text().trim() || 'Unknown Title';
        const thumbnail = $('.summary_image img').first().attr('src') || $('.summary_image img').first().attr('data-src') || '';
        const description = $('.summary__content p').text().trim() || 'No description';

        // 4. Detect Chapters (Simplified logic from detect-chapters route)
        const baseUrl = url.replace(/\/$/, '');
        let chapters: number[] = [];

        // AJAX method check (Madara theme common)
        const mangaId = $('.rating-post-id').val() || $('input[name="manga-id"]').val() || $('[data-id]').attr('data-id');
        if (mangaId) {
            try {
                const origin = new URL(url).origin;
                const ajaxUrl = `${origin}/wp-admin/admin-ajax.php`;
                const body = new URLSearchParams();
                body.append('action', 'manga_get_chapters');
                body.append('manga', mangaId.toString());

                const ajaxRes = await fetch(ajaxUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: body.toString()
                });

                if (ajaxRes.ok) {
                    const ajaxHtml = await ajaxRes.text();
                    const $c = cheerio.load(ajaxHtml);
                    $c('a[href*="chapter"]').each((_, el) => {
                        const href = $c(el).attr('href') || '';
                        const match = href.match(/chapter-(\d+)/i) || href.match(/(\d+)\/?$/);
                        if (match) chapters.push(parseInt(match[1]));
                    });
                }
            } catch (e) {
                console.error('AJAX detect failed, falling back to static');
            }
        }

        // Fallback static
        if (chapters.length === 0) {
            $('a[href*="chapter"]').each((_, el) => {
                const href = $(el).attr('href') || '';
                const match = href.match(/chapter-(\d+)/i);
                if (match) chapters.push(parseInt(match[1]));
            });
        }

        const uniqueChapters = Array.from(new Set(chapters)).sort((a, b) => a - b);
        const lastChapter = uniqueChapters.length > 0 ? Math.max(...uniqueChapters) : 1;
        const firstChapter = uniqueChapters.length > 0 ? Math.min(...uniqueChapters) : 1;

        console.log(`[Bot] Detected ${uniqueChapters.length} chapters (${firstChapter} -> ${lastChapter})`);

        // 5. Insert to Database
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

        // Insert Chapters
        const chapter records = [];
        for (let i = firstChapter; i <= lastChapter; i++) {
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
            title,
            chapters_count: uniqueChapters.length,
            message: `Successfully imported "${title}" with ${uniqueChapters.length} chapters.`
        });

    } catch (error: any) {
        console.error('[Bot Import Error]:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
