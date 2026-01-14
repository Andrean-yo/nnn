
import { useState, useEffect } from 'react';
import { Manhwa, Chapter } from '@/types';
import { X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChapterReaderProps {
    manhwa: Manhwa;
    chapter: Chapter;
    onClose: () => void;
    onNextChapter?: () => void;
    onPrevChapter?: () => void;
}

export function ChapterReader({ manhwa, chapter, onClose, onNextChapter, onPrevChapter }: ChapterReaderProps) {
    const [showHeader, setShowHeader] = useState(true);
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Hide header on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowHeader(false);
            } else {
                setShowHeader(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        if (chapter.contentUrl && chapter.contentUrl.startsWith('http')) {
            // Check if it's a website page (Madara, etc) or a direct image link
            if (chapter.contentUrl.includes('chapter-') || chapter.contentUrl.includes('/manga/')) {
                fetchChapterImages();
            } else {
                setImages([chapter.contentUrl]);
            }
        } else {
            setImages([]);
        }
        // Reset scroll when chapter changes
        window.scrollTo(0, 0);
    }, [chapter]);

    const fetchChapterImages = async () => {
        setIsLoading(true);
        setImages([]);
        try {
            const res = await fetch(`/api/scrape-chapter?url=${encodeURIComponent(chapter.contentUrl || '')}`);
            const data = await res.json();
            if (data.images && data.images.length > 0) {
                setImages(data.images);
            }
        } catch (err) {
            console.error('Failed to load chapter images:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-[#0b0d10] flex flex-col overflow-y-auto custom-scrollbar">

            {/* Sticky Header */}
            <div className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 bg-[#0b0d10]/95 backdrop-blur-md border-b border-white/10 shadow-lg",
                showHeader ? "translate-y-0" : "-translate-y-full"
            )}>
                <div className="max-w-5xl mx-auto w-full px-4 py-3 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{manhwa.title}</h1>
                        <span className="text-xs text-gray-600">Reading <span className="text-primary font-bold">{chapter.title}</span></span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <button
                                onClick={onPrevChapter}
                                disabled={!onPrevChapter}
                                className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 disabled:opacity-10 rounded-lg transition-colors"
                                title="Previous Chapter"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onNextChapter}
                                disabled={!onNextChapter}
                                className="p-1.5 sm:p-2 bg-white/5 hover:bg-white/10 disabled:opacity-10 rounded-lg transition-colors"
                                title="Next Chapter"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full pt-20">
                <div className="max-w-3xl mx-auto w-full shadow-2xl bg-black min-h-screen">
                    <div className="flex flex-col items-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-60 gap-4">
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <span className="text-primary font-bold animate-pulse">Fetching Pages...</span>
                            </div>
                        ) : images.length > 0 ? (
                            images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Page ${idx + 1}`}
                                    className="w-full h-auto select-none"
                                    loading="lazy"
                                />
                            ))
                        ) : chapter.contentUrl ? (
                            <div className="w-full min-h-[50vh] flex items-center justify-center">
                                {chapter.contentUrl.endsWith('.pdf') ? (
                                    <iframe src={chapter.contentUrl} className="w-full h-screen border-none" />
                                ) : (
                                    <img src={chapter.contentUrl} alt={chapter.title} className="w-full h-auto object-contain" />
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-60 space-y-4">
                                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto" />
                                <h3 className="text-xl font-bold text-gray-500">No Pages Available</h3>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="py-20 flex flex-col items-center gap-6 border-t border-white/5 mt-10">
                        <div className="text-center">
                            <h3 className="text-2xl font-black italic text-gray-800 uppercase tracking-widest">IndraScans</h3>
                            <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Premium Manhwa Experience</p>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={onPrevChapter}
                                disabled={!onPrevChapter}
                                className="px-8 py-3 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-20 rounded-full font-bold text-sm transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={onNextChapter}
                                disabled={!onNextChapter}
                                className="px-10 py-3 bg-primary text-black hover:bg-emerald-400 disabled:opacity-20 rounded-full font-bold text-sm transition-all shadow-lg shadow-primary/20"
                            >
                                Next Chapter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
