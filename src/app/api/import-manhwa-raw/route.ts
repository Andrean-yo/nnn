import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const { limit } = await req.json();
        const maxManhwas = limit || 50; // Default to 50 manhwa to avoid overwhelming

        // Step 1: Fetch manhwa list from homepage
        const listResponse = await fetch(`${req.nextUrl.origin}/api/scrape-manhwa-raw`);
        const { manhwas } = await listResponse.json();

        if (!manhwas || manhwas.length === 0) {
            return NextResponse.json({ error: 'No manhwa found on homepage' }, { status: 404 });
        }

        const results = {
            total: manhwas.length,
            processed: 0,
            imported: 0,
            failed: 0,
            errors: [] as string[]
        };

        // Limit the number of manhwa to process
        const manhwasToProcess = manhwas.slice(0, maxManhwas);

        // Step 2: Process each manhwa
        for (const manhwa of manhwasToProcess) {
            try {
                results.processed++;

                // Fetch detailed information
                const detailResponse = await fetch(
                    `${req.nextUrl.origin}/api/scrape-manhwa-detail?slug=${manhwa.slug}`
                );

                if (!detailResponse.ok) {
                    throw new Error(`Failed to fetch details for ${manhwa.slug}`);
                }

                const details = await detailResponse.json();

                // Check if manhwa already exists
                const { data: existing } = await supabase
                    .from('manhwas')
                    .select('id')
                    .eq('title', details.title)
                    .single();

                if (existing) {
                    // Skip if already exists
                    continue;
                }

                // Insert manhwa into database
                const { data: insertedManhwa, error: manhwaError } = await supabase
                    .from('manhwas')
                    .insert([{
                        title: details.title,
                        description: details.description,
                        status: details.status,
                        type: details.type,
                        thumbnail_url: details.thumbnail,
                        genres: details.genres,
                        last_chapter: details.last_chapter
                    }])
                    .select()
                    .single();

                if (manhwaError) throw manhwaError;

                // Insert chapters if any
                if (insertedManhwa && details.chapters && details.chapters.length > 0) {
                    const chaptersToInsert = details.chapters.map((c: any) => ({
                        manhwa_id: insertedManhwa.id,
                        number: c.number,
                        title: c.title,
                        released_at: c.releasedAt,
                        content_url: c.contentUrl
                    }));

                    const { error: chapterError } = await supabase
                        .from('chapters')
                        .insert(chaptersToInsert);

                    if (chapterError) {
                        console.error(`Failed to insert chapters for ${details.title}:`, chapterError);
                    }
                }

                results.imported++;

                // Add a small delay to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error: any) {
                results.failed++;
                results.errors.push(`${manhwa.slug}: ${error.message}`);
                console.error(`Failed to import ${manhwa.slug}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            results
        });

    } catch (error: any) {
        console.error('Import Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
