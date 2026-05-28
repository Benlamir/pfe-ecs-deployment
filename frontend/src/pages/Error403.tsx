import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Error403() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="p-4 bg-red-100 dark:bg-red-500/10 rounded-full">
                        <ShieldAlert className="h-16 w-16 text-red-600 dark:text-red-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                    Accès Refusé
                </h1>

                <p className="text-slate-600 dark:text-slate-400">
                    Désolé, vous n'avez pas les permissions nécessaires pour accéder à cet espace.
                </p>

                <div className="pt-8">
                    <Button
                        onClick={() => navigate(-1)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retourner à la page précédente
                    </Button>
                </div>
            </div>
        </div>
    );
}
