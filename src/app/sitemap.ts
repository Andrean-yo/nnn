import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://indrascans.vercel.app';

    // Fetch all manhwa from Supabase to include them in the sitemap
    const { data: manhwas } = await supabase
        .from('manhwa')
        .select('id, updated_at');

    const manhwaEntries: MetadataRoute.Sitemap = (manhwas || []).map((manhwa) => ({
        url: `${baseUrl}/manhwa/${manhwa.id}`,
        lastModified: new Date(manhwa.updated_at),
        changeFrequency: 'daily',
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        ...manhwaEntries,
    ];
}
