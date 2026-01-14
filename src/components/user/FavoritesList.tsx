import { Manhwa } from '@/types';
import { motion } from 'framer-motion';
import { Heart, Trash2, Star, Clock } from 'lucide-react';
import Image from 'next/image';

interface FavoritesListProps {
    favorites: Manhwa[];
    onRemove: (manhwaId: string) => void;
}

export function FavoritesList({ favorites, onRemove }: FavoritesListProps) {
    const formatTimeAgo = (dateString: string) => {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const diff = (new Date(dateString).getTime() - new Date().getTime()) / 1000;
        if (diff > -60) return 'Just now';
        if (diff > -3600) return rtf.format(Math.ceil(diff / 60), 'minute');
        if (diff > -86400) return rtf.format(Math.ceil(diff / 3600), 'hour');
        return rtf.format(Math.ceil(diff / 86400), 'day');
    };

    if (favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center"
                >
                    <Heart className="w-12 h-12 text-gray-600" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">No Favorites Yet</h3>
                <p className="text-gray-400">
                    Swipe right on manhwa you like to add them here!
                </p>
            </div>
        );
    }

    return (
        <div className="w-full p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">Your Favorites</h2>
                    <p className="text-gray-400">{favorites.length} manhwa saved</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {favorites.map((manhwa) => (
                        <motion.div
                            key={manhwa.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative flex flex-col overflow-hidden rounded-xl bg-surface border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]"
                        >
                            {/* Image */}
                            <div className="relative aspect-[3/4] w-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                                <Image
                                    src={manhwa.thumbnail}
                                    alt={manhwa.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Status Badge */}
                                <div className="absolute top-2 right-2 z-20">
                                    <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${manhwa.status === 'Ongoing'
                                            ? 'bg-primary text-black'
                                            : 'bg-blue-500 text-white'
                                        }`}>
                                        {manhwa.status}
                                    </div>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => onRemove(manhwa.id)}
                                    className="absolute top-2 left-2 z-20 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {/* Chapter Badge */}
                                <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5">
                                    <span className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-xs font-medium text-white border border-white/10">
                                        Ch. {manhwa.last_chapter}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-3 flex flex-col gap-1.5">
                                <h3 className="font-bold text-sm text-balance leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                    {manhwa.title}
                                </h3>

                                <div className="flex flex-wrap gap-1">
                                    {manhwa.genres.slice(0, 2).map(genre => (
                                        <span
                                            key={genre}
                                            className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between mt-1 border-t border-white/5 pt-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                        <span className="text-xs font-bold text-gray-200">4.9</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-gray-500" />
                                        <span className="text-[10px] text-gray-500">
                                            {formatTimeAgo(manhwa.updated_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
