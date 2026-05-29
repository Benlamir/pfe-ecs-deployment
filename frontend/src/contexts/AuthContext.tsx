import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
    id?: number;
    email: string;
    role?: string;
    first_name?: string;
    last_name?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (access: string, refresh: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for token on mount
        const checkAuth = () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const decoded: any = jwtDecode(token);
                    // Check if token is expired (exp is in seconds)
                    if (decoded.exp * 1000 < Date.now()) {
                        throw new Error('Token expired');
                    }

                    setUser({
                        id: decoded.user_id,
                        email: decoded.email || 'Utilisateur',
                        role: decoded.role || 'CANDIDATE',
                        first_name: decoded.first_name || '',
                        last_name: decoded.last_name || ''
                    });
                } catch (error) {
                    console.error("Erreur de session:", error);
                    logout();
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = (access: string, refresh: string) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);

        try {
            const decoded: any = jwtDecode(access);
            setUser({
                id: decoded.user_id,
                email: decoded.email || 'Utilisateur connecté',
                role: decoded.role || 'CANDIDATE',
                first_name: decoded.first_name || '',
                last_name: decoded.last_name || ''
            });
        } catch (err) {
            console.error("Invalid token format on login:", err);
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
