import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Manhwa } from '@/types';
import { Heart, X as XIcon, Star, Clock } from 'lucide-react';
import Image from 'next/image';

interface SwipeCardProps {
    manhwa: Manhwa;
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
    isTop: boolean;
}

export function SwipeCard({ manhwa, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    // Overlay opacity based on swipe direction
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 150;

        if (info.offset.x > threshold) {
            // Swipe right - Like
            onSwipeRight();
        } else if (info.offset.x < -threshold) {
            // Swipe left - Nope
            onSwipeLeft();
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const diff = (new Date(dateString).getTime() - new Date().getTime()) / 1000;
        if (diff > -60) return 'Just now';
        if (diff > -3600) return rtf.format(Math.ceil(diff / 60), 'minute');
        if (diff > -86400) return rtf.format(Math.ceil(diff / 3600), 'hour');
        return rtf.format(Math.ceil(diff / 86400), 'day');
    };

    return (
        <motion.div
            className="absolute w-full h-full"
            style={{
                x,
                rotate,
                opacity,
                cursor: isTop ? 'grab' : 'default',
            }}
            drag={isTop ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            whileDrag={{ cursor: 'grabbing' }}
        >
            <div className="relative w-full h-full bg-surface rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Image */}
                <div className="relative w-full h-full">
                    <Image
                        src={manhwa.thumbnail}
                        alt={manhwa.title}
                        fill
                        className="object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Like Overlay */}
                    <motion.div
                        style={{ opacity: likeOpacity }}
                        className="absolute inset-0 border-8 border-green-500 rounded-2xl flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-green-500 text-white px-8 py-4 rounded-xl rotate-[-20deg]">
                            <Heart className="w-16 h-16" fill="currentColor" />
                        </div>
                    </motion.div>

                    {/* Nope Overlay */}
                    <motion.div
                        style={{ opacity: nopeOpacity }}
                        className="absolute inset-0 border-8 border-red-500 rounded-2xl flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-red-500 text-white px-8 py-4 rounded-xl rotate-[20deg]">
                            <XIcon className="w-16 h-16" />
                        </div>
                    </motion.div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 z-10">
                        <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${manhwa.status === 'Ongoing'
                                ? 'bg-primary text-black'
                                : 'bg-blue-500 text-white'
                            }`}>
                            {manhwa.status}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                        <h2 className="text-3xl font-bold text-white mb-2 text-balance">
                            {manhwa.title}
                        </h2>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                <span className="text-sm font-bold text-white">4.9</span>
                            </div>
                            <span className="text-sm text-gray-300">•</span>
                            <span className="text-sm text-gray-300">Ch. {manhwa.last_chapter}</span>
                            <span className="text-sm text-gray-300">•</span>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-400">{formatTimeAgo(manhwa.updated_at)}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {manhwa.genres.slice(0, 4).map(genre => (
                                <span
                                    key={genre}
                                    className="px-2 py-1 text-xs bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20"
                                >
                                    {genre}
                                </span>
                            ))}
                        </div>

                        <p className="text-sm text-gray-300 line-clamp-2">
                            {manhwa.description}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
