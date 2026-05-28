import * as React from 'react';
import { Menu, Bell, Sun, Moon, User, LogOut, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export interface TopbarProps {
    customTitle?: string;
}

export function Topbar({ customTitle }: TopbarProps) {
    const [isDark, setIsDark] = React.useState(false);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [isNotifOpen, setIsNotifOpen] = React.useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Initial load of theme
    React.useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);
        if (newIsDark) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Close dropdowns when clicking outside (simple approach for now)
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('#profile-menu-container')) setIsProfileOpen(false);
            if (!target.closest('#notif-menu-container')) setIsNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-20 transition-colors relative">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="font-semibold text-lg hidden md:block text-slate-800 dark:text-slate-100">
                    <span className="text-emerald-600 dark:text-emerald-500">CFC</span> {customTitle || 'Dashboard'}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {isDark ? <Sun className="h-5 w-5 hover:text-amber-400 transition-colors" /> : <Moon className="h-5 w-5 hover:text-indigo-400 transition-colors" />}
                </Button>

                {/* Notifications Dropdown Container */}
                <div className="relative" id="notif-menu-container">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                        className={`relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 ${isNotifOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                    </Button>

                    {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-lg subtle-shadow border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">Notifications</h3>
                                <button className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">Tout marquer comme lu</button>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <div className="p-3 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer opacity-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Nouvelle formation M2</span>
                                        <span className="text-xs text-slate-400">il y a 2m</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Les inscriptions au Master "Ingénierie du Logiciel" sont ouvertes pour le semestre de printemps.</p>
                                </div>
                                <div className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer opacity-70">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Candidature à réviser</span>
                                        <span className="text-xs text-slate-400">il y a 1h</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">Veuillez compléter votre dossier d'inscription avec la copie de votre CIN.</p>
                                </div>
                            </div>
                            <div className="p-2 border-t border-slate-100 dark:border-slate-700 text-center bg-slate-50 dark:bg-slate-800/50">
                                <button className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Voir toutes les notifications</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Dropdown Container */}
                <div className="relative ml-2" id="profile-menu-container">
                    <button
                        onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                        className={`h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold cursor-pointer border hover:border-primary-300 dark:hover:border-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${isProfileOpen ? 'border-primary-400 dark:border-primary-600 ring-2 ring-primary-500/20' : 'border-primary-200 dark:border-primary-800'}`}
                    >
                        {user?.email ? user.email.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg subtle-shadow border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                            <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.email || "Utilisateur"}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Rôle: {user?.role || "Candidat"}</p>
                            </div>
                            <div className="p-1">
                                <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center">
                                    <User className="h-4 w-4 mr-2 text-slate-400" /> Mon Profil
                                </button>
                                <button className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center">
                                    <Settings className="h-4 w-4 mr-2 text-slate-400" /> Paramètres
                                </button>
                                <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex items-center"
                                >
                                    <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
