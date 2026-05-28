import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Mail, Lock, BookOpen, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export function Authentication() {
    const [isLogin, setIsLogin] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState(''); // Used for register
    const [error, setError] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (isLogin) {
            // 1. Appel du backend Django (similaire jwt setup)
            try {
                const response = await api.post('/token/', {
                    email,
                    password
                });

                // 2. Connexion dans notre context si 200 OK
                if (response.data.access) {
                    login(response.data.access, response.data.refresh);

                    try {
                        const decoded: any = jwtDecode(response.data.access);
                        const role = decoded.role || 'CANDIDATE';

                        if (role === 'SUPER_ADMIN') {
                            navigate('/dashboard/superadmin');
                        } else if (role === 'COORDINATOR') {
                            navigate('/dashboard/admin');
                        } else if (role === 'ETABLISSEMENT_ADMIN') {
                            navigate('/dashboard/etablissement');
                        } else {
                            navigate('/dashboard');
                        }
                    } catch (e) {
                        navigate('/dashboard');
                    }
                }
            } catch (err: any) {
                if (err.response && err.response.status === 401) {
                    setError('Email ou mot de passe incorrect.');
                } else {
                    setError('Erreur de connexion serveur.');
                }
            } finally {
                setIsLoading(false);
            }
        } else {
            // Enregistrement
            try {
                await api.post('/users/register/', {
                    name,
                    email,
                    password
                });

                // Inscription réussie : on le connecte ou on bascule vers login
                setIsLogin(true);
                setError('');
                // Optionnel : on pourrait afficher un message flash "Compte créé, veuillez vous connecter"
            } catch (err: any) {
                if (err.response && err.response.data) {
                    const data = err.response.data;
                    // Extract specific validation messages if available (like django password validators)
                    if (data.email) {
                        setError(Array.isArray(data.email) ? data.email[0] : "Cet email est déjà utilisé.");
                    } else if (data.password) {
                        setError(Array.isArray(data.password) ? data.password[0] : "Mot de passe invalide.");
                    } else if (typeof data === 'object' && Object.values(data).length > 0) {
                        const firstError: any = Object.values(data)[0];
                        setError(Array.isArray(firstError) ? firstError[0] : "Erreur de validation.");
                    } else {
                        setError("Erreur lors de l'inscription.");
                    }
                } else {
                    setError('Erreur de connexion serveur.');
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="absolute inset-0 z-0 bg-emerald-900/5 dark:bg-emerald-900/10" style={{ backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(6, 95, 70, 0.1), transparent 70%)' }} />

            <div className="z-10 w-full max-w-md">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="h-16 w-16 bg-primary text-white rounded-[12px] flex items-center justify-center shadow-lg shadow-emerald-600/20 mb-4">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">CFC<span className="text-primary">.</span>edu</h1>
                    <p className="text-slate-500 mt-2">Centre de Formation Continue</p>
                </div>

                <Card className="border-0 shadow-lg subtle-shadow">
                    <CardHeader className="space-y-1 text-center pb-6">
                        <CardTitle className="text-2xl font-semibold tracking-tight">
                            {isLogin ? 'Bon retour' : 'Créer un compte'}
                        </CardTitle>
                        <CardDescription>
                            {isLogin
                                ? 'Entrez vos identifiants pour accéder à votre espace'
                                : 'Remplissez ce formulaire pour postuler à nos formations'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Nom complet"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="flex h-11 w-full rounded-[8px] border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Adresse e-mail"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex h-11 w-full rounded-[8px] border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Mot de passe"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex h-11 w-full rounded-[8px] border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-10"
                                    />
                                </div>
                                {isLogin && (
                                    <div className="text-right">
                                        <a href="#" className="text-sm font-medium text-primary hover:underline">Mot de passe oublié ?</a>
                                    </div>
                                )}
                            </div>

                            <Button type="submit" isLoading={isLoading} fullWidth className="mt-6 bg-emerald-700 hover:bg-emerald-800 text-white shadow-md">
                                {isLogin ? 'Se connecter' : "S'inscrire"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-slate-500">
                            {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}
                            <button
                                type="button"
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="ml-1 text-primary font-medium hover:underline focus:outline-none"
                            >
                                {isLogin ? "S'inscrire" : 'Se connecter'}
                            </button>
                        </div>

                        <div className="mt-8 text-center text-xs text-slate-400">
                            <Link to="/dashboard" className="hover:text-primary transition-colors hover:underline">
                                Continuer vers l'accueil (Bypass Demo)
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
