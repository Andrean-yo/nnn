
import { useState, useEffect } from 'react';
import { Manhwa } from '@/types';
import { supabase } from '@/lib/supabase';

// Keep Mock Data as Fallback/Initial State
const MOCK_DATA: Manhwa[] = [
    {
        id: '1',
        title: 'Solo Leveling',
        thumbnail: 'https://via.placeholder.com/300x400?text=Solo+Leveling',
        description: 'The weakest hunter of all mankind discovers a way to level up.',
        type: 'Manhwa',
        status: 'Completed',
        last_chapter: 179,
        genres: ['Action', 'Fantasy', 'Adventure'],
        updated_at: new Date().toISOString(),
        artist: 'Dubu',
        author: 'Chugong',
        chapters: []
    },
    // ... (Your other mock items can stay here or be reduced)
];

export function useManhwaData() {
    const [data, setData] = useState<Manhwa[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        fetchManhwas();
    }, []);

    const fetchManhwas = async () => {
        setIsLoading(true);
        try {
            // 1. Try to fetch from Supabase
            const { data: dbManhwas, error } = await supabase
                .from('manhwas')
                .select(`
                    *,
                    chapters (
                        id, number, title, released_at, content_url, file_name
                    )
                `)
                .order('updated_at', { ascending: false });

            if (error) throw error;

            if (dbManhwas && dbManhwas.length > 0) {
                // Map DB structure to App Interface if needed (snake_case to camelCase)
                const formattedData: Manhwa[] = dbManhwas.map(m => ({
                    ...m,
                    chapters: m.chapters ? m.chapters.map((c: any) => ({
                        id: c.id,
                        number: c.number,
                        title: c.title,
                        releasedAt: c.released_at,
                        contentUrl: c.content_url,
                        fileName: c.file_name
                    })).sort((a: any, b: any) => b.number - a.number) : []
                }));
                setData(formattedData);
            } else {
                // Fallback to Mock Data if DB is empty
                console.log('Database empty, loading mock data...');
                setData(MOCK_DATA);
            }
        } catch (err) {
            console.warn('Supabase connection failed (expected if not setup), using Mock Data:', err);
            setData(MOCK_DATA);
        } finally {
            setIsLoading(false);
        }
    };

    const updateManhwa = async (updated: Manhwa) => {
        // Optimistic Update
        setData(prev => prev.map(item => item.id === updated.id ? updated : item));

        try {
            // 1. Update Manhwa Metadata
            const { error: manhwaError } = await supabase
                .from('manhwas')
                .update({
                    title: updated.title,
                    description: updated.description,
                    status: updated.status,
                    type: updated.type,
                    thumbnail_url: updated.thumbnail,
                    genres: updated.genres,
                    updated_at: new Date().toISOString()
                })
                .eq('id', updated.id);

            if (manhwaError) throw manhwaError;

            // 2. Sync Chapters (Simple approach: delete all and re-insert)
            // Note: In a real app, you'd use a more sophisticated diff/upsert
            if (updated.chapters) {
                // Delete existing chapters
                const { error: delError } = await supabase
                    .from('chapters')
                    .delete()
                    .eq('manhwa_id', updated.id);

                if (delError) throw delError;

                // Insert new chapters
                if (updated.chapters.length > 0) {
                    const chaptersToInsert = updated.chapters.map(c => ({
                        manhwa_id: updated.id,
                        number: c.number,
                        title: c.title,
                        released_at: c.releasedAt,
                        content_url: c.contentUrl,
                        file_name: c.fileName
                    }));

                    const { error: insertError } = await supabase
                        .from('chapters')
                        .insert(chaptersToInsert);

                    if (insertError) throw insertError;
                }
            }
        } catch (err) {
            console.error('Failed to update in DB:', err);
        }
    };

    const addManhwa = async (newItem: Omit<Manhwa, 'id' | 'updated_at' | 'chapters'> & { chapters?: any[] }) => {
        const tempId = Math.random().toString(36).substr(2, 9);
        const newManhwa: Manhwa = {
            ...newItem,
            id: tempId,
            updated_at: new Date().toISOString(),
            chapters: newItem.chapters || []
        };

        // Optimistic Update
        setData(prev => [newManhwa, ...prev]);

        try {
            // 1. Insert Manhwa
            const { data: inserted, error } = await supabase
                .from('manhwas')
                .insert([{
                    title: newItem.title,
                    description: newItem.description,
                    status: newItem.status,
                    type: newItem.type,
                    thumbnail_url: newItem.thumbnail,
                    genres: newItem.genres
                }])
                .select()
                .single();

            if (error) throw error;

            // 2. Insert Chapters if any
            if (inserted && newItem.chapters && newItem.chapters.length > 0) {
                const chaptersToInsert = newItem.chapters.map(c => ({
                    manhwa_id: inserted.id,
                    number: c.number,
                    title: c.title,
                    released_at: c.releasedAt,
                    content_url: c.contentUrl,
                    file_name: c.fileName
                }));

                const { error: chapterError } = await supabase
                    .from('chapters')
                    .insert(chaptersToInsert);

                if (chapterError) throw chapterError;
            }

            // Replace optimistic item with real DB item
            if (inserted) {
                setData(prev => prev.map(item => item.id === tempId ? {
                    ...item,
                    id: inserted.id,
                    chapters: newItem.chapters || []
                } : item));
            }
        } catch (err) {
            console.error('Failed to insert into DB:', err);
        }
    };

    const deleteManhwa = async (id: string) => {
        // Optimistic Delete
        setData(prev => prev.filter(item => item.id !== id));

        try {
            const { error } = await supabase.from('manhwas').delete().eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.error('Failed to delete from DB:', err);
        }
    };

    return {
        data,
        isLoading,
        updateManhwa,
        addManhwa,
        deleteManhwa,
        refresh: fetchManhwas // Expose refresh function
    };
}
