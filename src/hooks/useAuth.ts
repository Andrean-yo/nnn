import { useState, useEffect } from 'react';
import { User, UserRole, AuthState } from '@/types';

const STORAGE_KEYS = {
    AUTH: 'indra_auth',
    USERS: 'indra_users',
};

// Mock developer account
const DEVELOPER_ACCOUNT: User = {
    id: 'dev-001',
    email: 'dev@indra.com',
    password: 'dev123',
    role: 'developer',
    favorites: [],
    createdAt: new Date().toISOString(),
};

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
    });

    // Initialize - check for existing session
    useEffect(() => {
        const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
        if (storedAuth) {
            try {
                const auth: AuthState = JSON.parse(storedAuth);
                setAuthState(auth);
            } catch (error) {
                console.error('Failed to parse auth state:', error);
                localStorage.removeItem(STORAGE_KEYS.AUTH);
            }
        }
    }, []);

    // Get all users from storage
    const getUsers = (): User[] => {
        const usersJson = localStorage.getItem(STORAGE_KEYS.USERS);
        if (!usersJson) return [];
        try {
            return JSON.parse(usersJson);
        } catch {
            return [];
        }
    };

    // Save users to storage
    const saveUsers = (users: User[]) => {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    };

    // Login function
    const login = (email: string, password: string): boolean => {
        // Check developer account
        if (email === DEVELOPER_ACCOUNT.email && password === DEVELOPER_ACCOUNT.password) {
            const newAuthState: AuthState = {
                isAuthenticated: true,
                user: DEVELOPER_ACCOUNT,
                token: DEVELOPER_ACCOUNT.id,
            };
            setAuthState(newAuthState);
            localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(newAuthState));
            return true;
        }

        // Check regular users
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            const newAuthState: AuthState = {
                isAuthenticated: true,
                user,
                token: user.id,
            };
            setAuthState(newAuthState);
            localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(newAuthState));
            return true;
        }

        return false;
    };

    // Register function (user only)
    const register = (email: string, password: string): { success: boolean; error?: string } => {
        const users = getUsers();

        // Check if email already exists
        if (users.some(u => u.email === email) || email === DEVELOPER_ACCOUNT.email) {
            return { success: false, error: 'Email already exists' };
        }

        // Validate email
        if (!email.includes('@')) {
            return { success: false, error: 'Invalid email format' };
        }

        // Validate password
        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Create new user
        const newUser: User = {
            id: `user-${Date.now()}`,
            email,
            password,
            role: 'user',
            favorites: [],
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        saveUsers(users);

        // Auto-login after registration
        const newAuthState: AuthState = {
            isAuthenticated: true,
            user: newUser,
            token: newUser.id,
        };
        setAuthState(newAuthState);
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(newAuthState));

        return { success: true };
    };

    // Logout function
    const logout = () => {
        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
        });
        localStorage.removeItem(STORAGE_KEYS.AUTH);
    };

    // Update user (for favorites, etc.)
    const updateUser = (updatedUser: User) => {
        if (updatedUser.role === 'developer') {
            // Developer account doesn't persist changes
            const newAuthState: AuthState = {
                ...authState,
                user: updatedUser,
            };
            setAuthState(newAuthState);
            localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(newAuthState));
        } else {
            // Update regular user in storage
            const users = getUsers();
            const userIndex = users.findIndex(u => u.id === updatedUser.id);
            if (userIndex !== -1) {
                users[userIndex] = updatedUser;
                saveUsers(users);

                const newAuthState: AuthState = {
                    ...authState,
                    user: updatedUser,
                };
                setAuthState(newAuthState);
                localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(newAuthState));
            }
        }
    };

    return {
        ...authState,
        login,
        register,
        logout,
        updateUser,
    };
}
