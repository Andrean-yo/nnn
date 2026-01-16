'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function AnalyticsTracker() {
    useEffect(() => {
        const trackView = async () => {
            // Check session to avoid double counting on re-renders (simple check)
            const visited = sessionStorage.getItem('visited_session');
            if (visited) return;

            try {
                // 1. Local Storage Count (for user personally)
                const currentViews = parseInt(localStorage.getItem('page_views') || '0');
                localStorage.setItem('page_views', (currentViews + 1).toString());
                sessionStorage.setItem('visited_session', 'true');

                // 2. Global Count (Supabase)
                // Try to increment a global counter. 
                // We assume a table 'site_stats' with a row key='total_views'
                const { data, error } = await supabase
                    .rpc('increment_visitor_count'); // Ideal way if RPC exists

                if (error) {
                    // Fallback: simple update if RPC not exists
                    // READ first
                    const { data: currentData } = await supabase
                        .from('site_stats')
                        .select('value')
                        .eq('key', 'total_views')
                        .single();

                    if (currentData) {
                        await supabase
                            .from('site_stats')
                            .update({ value: currentData.value + 1 })
                            .eq('key', 'total_views');
                    } else {
                        // Create row if not exists (might fail if RLS)
                        await supabase
                            .from('site_stats')
                            .insert([{ key: 'total_views', value: 1 }]);
                    }
                }
            } catch (err) {
                console.error('Analytics error:', err);
            }
        };

        trackView();
    }, []);

    return null; // Invisible component
}
