import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export function useFavorites() {
    const { user, updateUser } = useAuth();
    const [favorites, setFavorites] = useState<string[]>([]);

    // Load favorites when user changes
    useEffect(() => {
        if (user) {
            setFavorites(user.favorites || []);
        } else {
            setFavorites([]);
        }
    }, [user]);

    // Add to favorites
    const addFavorite = (manhwaId: string) => {
        if (!user) return;

        if (!favorites.includes(manhwaId)) {
            const newFavorites = [...favorites, manhwaId];
            setFavorites(newFavorites);
            updateUser({ ...user, favorites: newFavorites });
        }
    };

    // Remove from favorites
    const removeFavorite = (manhwaId: string) => {
        if (!user) return;

        const newFavorites = favorites.filter(id => id !== manhwaId);
        setFavorites(newFavorites);
        updateUser({ ...user, favorites: newFavorites });
    };

    // Toggle favorite
    const toggleFavorite = (manhwaId: string) => {
        if (isFavorite(manhwaId)) {
            removeFavorite(manhwaId);
        } else {
            addFavorite(manhwaId);
        }
    };

    // Check if favorited
    const isFavorite = (manhwaId: string): boolean => {
        return favorites.includes(manhwaId);
    };

    return {
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
    };
}
