import { useState } from 'react';
// import { useManhwaData } from '@/hooks/useManhwaData';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { SwipeStack } from '@/components/swipe/SwipeStack';
import { FavoritesList } from './FavoritesList';
import { motion } from 'framer-motion';
import { Heart, Compass, LogOut, User, ArrowLeft } from 'lucide-react';

type Tab = 'discover' | 'favorites';

import { Manhwa } from '@/types';

interface UserViewProps {
    onBack?: () => void;
    data: Manhwa[];
}

export function UserView({ onBack, data }: UserViewProps) {
    const [activeTab, setActiveTab] = useState<Tab>('discover');
    // const { data } = useManhwaData(); // Removed internal hook call
    const { favorites, addFavorite, removeFavorite } = useFavorites();
    const { user, logout } = useAuth();

    const favoriteManhwa = data.filter(m => favorites.includes(m.id));

    const handleLike = (manhwa: any) => {
        addFavorite(manhwa.id);
    };

    const handleSkip = (manhwa: any) => {
        // Just skip, don't do anything
    };

    return (
        <div className="min-h-screen bg-[#0b0d10] text-white flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0b0d10]/80 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-400 hover:text-white" />
                            </button>
                        )}
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-primary to-emerald-400 bg-clip-text text-transparent">
                            IndraScans
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg">
                            <User className="w-4 h-4 text-primary" />
                            <span className="text-sm text-gray-300">{user?.email}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('discover')}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'discover'
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            <Compass className="w-4 h-4" />
                            <span>Discover</span>
                            {activeTab === 'discover' && (
                                <motion.div
                                    layoutId="activeUserTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('favorites')}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${activeTab === 'favorites'
                                ? 'text-primary'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            <Heart className="w-4 h-4" />
                            <span>Favorites</span>
                            {favorites.length > 0 && (
                                <span className="px-2 py-0.5 text-xs bg-primary text-black rounded-full font-bold">
                                    {favorites.length}
                                </span>
                            )}
                            {activeTab === 'favorites' && (
                                <motion.div
                                    layoutId="activeUserTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-hidden">
                {activeTab === 'discover' ? (
                    <div className="h-full flex items-center justify-center p-6">
                        <div className="w-full max-w-md h-[600px]">
                            <SwipeStack
                                data={data}
                                onLike={handleLike}
                                onSkip={handleSkip}
                                excludeIds={favorites}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        <FavoritesList
                            favorites={favoriteManhwa}
                            onRemove={removeFavorite}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}
