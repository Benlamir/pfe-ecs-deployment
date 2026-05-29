import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export function CandidateLayout() {
    const [isDark, setIsDark] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.theme = newDark ? 'dark' : 'light';
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-20">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">
                    <div className="bg-emerald-600 text-white p-1 rounded-lg">CFC</div>
                    <span className="hidden sm:inline">Espace Candidat</span>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" className="hidden sm:flex" onClick={() => navigate('/dashboard/mes-candidatures')}>
                        Mon Dossier
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-500">
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
                    <div className="flex flex-col items-end mr-2 hidden sm:flex">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{user?.first_name}</span>
                        <span className="text-xs text-slate-500">{user?.role}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut className="h-5 w-5" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <Outlet />
            </main>
        </div>
    );
}
