import { Manhwa } from '@/types';
import { cn } from '@/lib/utils';
import { Star, Clock } from 'lucide-react';
import Image from 'next/image';

interface ManhwaCardProps {
    data: Manhwa;
    className?: string;
    onClick?: () => void;
}

export function ManhwaCard({ data, className, onClick }: ManhwaCardProps) {
    // Simple time ago formatter
    const formatTimeAgo = (dateString: string) => {
        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
        const diff = (new Date(dateString).getTime() - new Date().getTime()) / 1000;
        if (diff > -60) return 'Just now';
        if (diff > -3600) return rtf.format(Math.ceil(diff / 60), 'minute');
        if (diff > -86400) return rtf.format(Math.ceil(diff / 3600), 'hour');
        return rtf.format(Math.ceil(diff / 86400), 'day');
    };

    return (
        <div
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl bg-surface border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)] cursor-pointer select-none",
                className
            )}
            onClick={onClick}
        >
            {/* Image Container with Aspect Ratio 3:4 */}
            <div className="relative aspect-[3/4] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />

                {/* Status Badge */}
                <div className={cn(
                    "absolute top-2 right-2 z-20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm",
                    data.status === 'Ongoing' ? 'bg-primary text-black' : 'bg-blue-500 text-white'
                )}>
                    {data.status}
                </div>

                {/* Simulated Image (using background for simple placeholder if needed, or Next Image) */}
                <Image
                    src={data.thumbnail}
                    alt={data.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Chapter Badge */}
                <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5">
                    <span className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded text-xs font-medium text-white border border-white/10">
                        Ch. {data.last_chapter}
                    </span>
                    <span suppressHydrationWarning className="flex items-center gap-1 text-[10px] text-gray-300 font-medium bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(data.updated_at)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-3 flex flex-col gap-1.5">
                <h3 className="font-bold text-sm text-balance leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {data.title}
                </h3>

                <div className="flex flex-wrap gap-1">
                    {data.genres.slice(0, 3).map(genre => (
                        <span key={genre} className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors">
                            {genre}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-1 border-t border-white/5 pt-2">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-xs font-bold text-gray-200">4.9</span>
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wide">
                        {data.type}
                    </span>
                </div>
            </div>
        </div>
    );
}
