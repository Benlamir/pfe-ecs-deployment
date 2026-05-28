import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/" className="text-2xl font-bold text-blue-900 tracking-tight">CFC</Link>
                </div>
                <nav className="flex items-center space-x-8">
                    <Link to="/" className="text-blue-900 font-medium hover:text-blue-700">Formations</Link>
                    <a href="#" className="text-gray-600 hover:text-blue-900 transition">À propos</a>

                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-700 font-medium">
                                {user?.email || 'Utilisateur'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-red-600 hover:text-red-800 text-sm font-medium transition"
                            >
                                Déconnexion
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition shadow-sm"
                        >
                            Connexion
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
