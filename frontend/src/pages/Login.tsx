import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login: React.FC = () => {
    const [email, setEmail] = useState(''); // DRF token uses username by default, but we might want email
    const [password, setPassword] = useState('');
    const [isLoginView, setIsLoginView] = useState(true); // Toggle Login/Register
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLoginView) {
                // LOGIN
                const response = await api.post('/token/', {
                    email: email,
                    password: password
                });

                // Decode token or fetch user profile needed? 
                // For now, assume username is enough or returned (custom token serializer needed for more)
                // Let's manually reconstruct basic user data or fetch /me later
                const userData = { username: email, email: email };

                login(response.data.access, response.data.refresh, userData);
                navigate('/');
            } else {
                // REGISTER (Not implemented fully on backend yet?)
                setError("L'inscription n'est pas encore activée.");
            }
        } catch (err: any) {
            console.error("Auth error", err);
            setError("Identifiants incorrects ou erreur serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <span className="text-3xl font-bold text-blue-900 tracking-tight">CFC</span>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">
                        {isLoginView ? 'Content de vous revoir' : 'Créer un compte'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {isLoginView ? 'Accédez à vos candidatures en cours' : 'Rejoignez-nous pour postuler'}
                    </p>
                </div>

                {/* Toggle */}
                <div className="border border-gray-200 rounded-lg p-1 flex bg-gray-50">
                    <button
                        onClick={() => setIsLoginView(true)}
                        className={`w-1/2 text-sm font-medium py-2 rounded-md transition-all ${isLoginView ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Se connecter
                    </button>
                    <button
                        onClick={() => setIsLoginView(false)}
                        className={`w-1/2 text-sm font-medium py-2 rounded-md transition-all ${!isLoginView ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        S'inscrire
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Nom d'utilisateur / Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Nom d'utilisateur (ex: admin)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mot de passe</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                Se souvenir de moi
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                Mot de passe oublié ?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out`}
                        >
                            {loading ? 'Traitement...' : (isLoginView ? 'Se connecter' : "S'inscrire")}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        {isLoginView ? "Pas encore de compte ?" : "Déjà un compte ?"}
                        <button
                            onClick={() => setIsLoginView(!isLoginView)}
                            className="font-medium text-blue-600 hover:text-blue-500 ml-1 focus:outline-none"
                        >
                            {isLoginView ? "Inscrivez-vous" : "Connectez-vous"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
