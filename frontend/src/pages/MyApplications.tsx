import * as React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { BookOpen, Calendar, Clock, Download, FileText, CheckCircle2, XCircle, Activity, Check } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface Enrollment {
    id: string;
    course_details: {
        title: string;
        etablissement_details: {
            name: string;
        };
        domaine: string;
        niveau: string;
    };
    status: string;
    application_date: string;
    rejection_reason?: string;
    cv_file?: string;
}

export function MyApplications() {
    useAuth(); // Keeping the hook call if it verifies auth, otherwise no need for user variable
    const [applications, setApplications] = React.useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await api.get('/enrollments/');
                setApplications(response.data);
            } catch (err) {
                console.error(err);
                setError('Impossible de charger vos candidatures.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
            case 'FINALIZED':
                return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800/60';
            case 'SUBMITTED':
            case 'UNDER_REVIEW':
            default:
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return "Accepté";
            case 'FINALIZED': return "Inscription Finalisée";
            case 'REJECTED': return "Refusé";
            case 'SUBMITTED': return "En attente";
            case 'UNDER_REVIEW': return "En cours d'étude";
            default: return "Soumis";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
            case 'FINALIZED':
                return <CheckCircle2 className="mr-1.5 h-4 w-4" />;
            case 'REJECTED':
                return <XCircle className="mr-1.5 h-4 w-4" />;
            case 'SUBMITTED':
            case 'UNDER_REVIEW':
            default:
                return <Clock className="mr-1.5 h-4 w-4" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64 animate-in fade-in">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl subtle-shadow border border-slate-100 dark:border-slate-800">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <Activity className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
                        Mes candidatures
                    </h1>
                    <p className="text-slate-500 mt-2">Suivez l'état d'avancement de vos dossiers d'admission.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 dark:bg-red-900/10 dark:border-red-800/30 dark:text-red-400">
                    {error}
                </div>
            )}

            {applications.length === 0 && !error ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 subtle-shadow">
                    <BookOpen className="h-16 w-16 mx-auto text-slate-200 dark:text-slate-700 mb-6" />
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Aucune candidature</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                        Vous n'avez pas encore postulé à une formation. Découvrez notre catalogue pour commencer.
                    </p>
                    <Link
                        to="/dashboard/formations"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-white hover:bg-emerald-700 h-10 px-8 py-2"
                    >
                        Parcourir les formations
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {applications.map((app) => (
                        <Card key={app.id} className="overflow-hidden bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 subtle-shadow transition-all hover:shadow-md">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Info Section */}
                                    <div className="p-6 md:w-3/4 flex flex-col justify-center">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${getStatusStyle(app.status)}`}>
                                                {getStatusIcon(app.status)}
                                                {getStatusText(app.status)}
                                            </span>
                                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                                Candidature #{app.id.substring(0, 8)}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                            {app.course_details?.title || 'Formation Introuvable'}
                                        </h3>

                                        <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600 dark:text-slate-400 mb-6">
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-4 w-4 text-emerald-500" />
                                                Soumis le : {new Date(app.application_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            {app.course_details?.etablissement_details?.name && (
                                                <div className="flex items-center">
                                                    <BookOpen className="mr-2 h-4 w-4 text-emerald-500" />
                                                    {app.course_details.etablissement_details.name}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tracking Stepper */}
                                        <div className="mt-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative max-w-2xl">
                                                <div className="hidden sm:block absolute left-0 top-4 lg:w-[calc(100%-4rem)] w-[calc(100%-3rem)] h-1 bg-slate-100 dark:bg-slate-800 z-0 ml-6"></div>

                                                {/* Étape 1: Soumis */}
                                                <div className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2 mb-4 sm:mb-0">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-600 border border-emerald-600 text-white flex items-center justify-center shadow-sm">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 text-center">Soumis</span>
                                                </div>

                                                {/* Étape 2: En Étude */}
                                                <div className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2 mb-4 sm:mb-0">
                                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-sm z-10 
                                                        ${['UNDER_REVIEW', 'ACCEPTED', 'FINALIZED', 'REJECTED'].includes(app.status)
                                                            ? 'bg-emerald-600 border-emerald-600 text-white'
                                                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'}`}>
                                                        {['UNDER_REVIEW', 'ACCEPTED', 'FINALIZED', 'REJECTED'].includes(app.status)
                                                            ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                                    </div>
                                                    <span className={`text-xs font-semibold text-center ${['UNDER_REVIEW', 'ACCEPTED', 'FINALIZED', 'REJECTED'].includes(app.status) ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>En étude</span>
                                                </div>

                                                {/* Étape 3: Décision */}
                                                <div className="relative z-10 flex sm:flex-col items-center gap-3 sm:gap-2">
                                                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-sm z-10
                                                        ${['ACCEPTED', 'FINALIZED'].includes(app.status) ? 'bg-emerald-600 border-emerald-600 text-white' :
                                                            app.status === 'REJECTED' ? 'bg-red-500 border-red-500 text-white' :
                                                                'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'}`}>
                                                        {['ACCEPTED', 'FINALIZED'].includes(app.status) ? <Check className="h-4 w-4" /> :
                                                            app.status === 'REJECTED' ? <XCircle className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                                                    </div>
                                                    <span className={`text-xs font-semibold text-center ${['ACCEPTED', 'FINALIZED'].includes(app.status) ? 'text-emerald-700 dark:text-emerald-400' : app.status === 'REJECTED' ? 'text-red-500' : 'text-slate-500'}`}>
                                                        {app.status === 'REJECTED' ? 'Refusé' : 'Décision'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action/Status Section */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 md:w-1/4 flex flex-col items-start justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
                                        {app.cv_file && (
                                            <a
                                                href={app.cv_file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors mb-3"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    Mon Dossier
                                                </span>
                                                <Download className="h-4 w-4 opacity-50" />
                                            </a>
                                        )}

                                        {app.status === 'REJECTED' && app.rejection_reason && (
                                            <p className="text-sm text-red-600 dark:text-red-400 mt-2 italic border-l-2 border-red-500 pl-2">
                                                Motif : {app.rejection_reason}
                                            </p>
                                        )}
                                        {app.status === 'ACCEPTED' && (
                                            <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                                                Félicitations ! Votre candidature est retenue.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
