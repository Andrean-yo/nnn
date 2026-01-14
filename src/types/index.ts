export type ManhwaStatus = 'Ongoing' | 'Completed';
export type ManhwaType = 'Manhwa' | 'Manhua' | 'Manga';

export interface Chapter {
    id: string;
    number: number;
    title: string;
    releasedAt: string; // ISO string
    contentUrl?: string;
    fileName?: string;
}

export interface Manhwa {
    id: string;
    title: string;
    thumbnail: string;
    description: string;
    type: ManhwaType;
    status: ManhwaStatus;
    last_chapter: number;
    genres: string[];
    updated_at: string; // ISO string
    artist?: string;
    author?: string;
    chapters: Chapter[];
}

// Authentication Types
export type UserRole = 'developer' | 'user';

export interface User {
    id: string;
    email: string;
    password: string;
    role: UserRole;
    favorites: string[]; // Array of Manhwa IDs
    createdAt: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
}

