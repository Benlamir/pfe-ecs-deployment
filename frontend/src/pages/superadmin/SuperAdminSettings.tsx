import { useState, useEffect } from 'react';
import {
    Settings,
    Calendar,
    Power,
    ShieldAlert,
    Save,
    History
} from 'lucide-react';
import api from '../../services/api';

export function SuperAdminSettings() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [config, setConfig] = useState({
        academic_year: '2025-2026',
        is_maintenance_mode: false
    });

    // Mock logs for demonstration
    const mockLogs = [
        { id: 1, action: "Connexion réussie", user: "admin@cfc.local", time: "Il y a 2 minutes" },
        { id: 2, action: "Établissement créé", user: "admin@cfc.local", time: "Il y a 15 minutes" },
        { id: 3, action: "Tentative échouée", user: "inconnu", time: "Il y a 1 heure" }
    ];

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/superadmin/config/system/');
            setConfig(res.data);
        } catch (error) {
            console.error("Erreur chargement config", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await api.patch('/superadmin/config/system/', config);
            alert("Configuration mise à jour avec succès.");
        } catch (error) {
            console.error("Erreur sauvegarde config", error);
            alert("Erreur lors de la mise à jour de la configuration.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#f9fafb] dark:bg-slate-950 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 -m-4 md:-m-6 lg:-m-8 relative">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                        <Settings className="h-6 w-6 text-emerald-600" />
                        Configuration Système
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les paramètres globaux de la plateforme CFC.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Column 1 & 2: Main Settings */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Academic Year Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 subtle-shadow">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Année Universitaire Active</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    Définit l'année académique par défaut pour toutes les nouvelles formations et candidatures.
                                </p>
                            </div>
                        </div>
                        <div className="pl-16">
                            <div className="max-w-xs">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Format: YYYY-YYYY
                                </label>
                                <input
                                    type="text"
                                    value={config.academic_year}
                                    onChange={(e) => setConfig({ ...config, academic_year: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                                    placeholder="Ex: 2025-2026"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Maintenance Mode Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/50 p-6 shadow-sm">
                        <div className="flex items-start gap-4 mb-4">
                            <div className={`p-3 rounded-lg ${config.is_maintenance_mode ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                <Power className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Mode Maintenance</h2>

                                    {/* Toggle Switch */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={config.is_maintenance_mode}
                                            onChange={(e) => setConfig({ ...config, is_maintenance_mode: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-rose-600"></div>
                                    </label>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 pr-12">
                                    Activer ce mode bloquera l'accès à la plateforme pour les candidats et les coordinateurs. Seuls les Super Admins pourront se connecter.
                                </p>
                            </div>
                        </div>

                        {config.is_maintenance_mode && (
                            <div className="ml-16 mt-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg flex items-start gap-2 text-rose-700 dark:text-rose-400">
                                <ShieldAlert className="h-5 w-5 shrink-0" />
                                <span className="text-sm font-medium">Attention : Le site affichera une page de maintenance pour tous les utilisateurs non-administrateurs dès l'enregistrement.</span>
                            </div>
                        )}
                    </div>

                </div>

                {/* Column 3: Logs Overview */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 subtle-shadow h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <History className="h-5 w-5 text-slate-400" />
                                Logs Rapides
                            </h2>
                            <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                                Voir tout
                            </button>
                        </div>

                        <div className="space-y-4">
                            {mockLogs.map(log => (
                                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`font-medium ${log.action.includes('échouée') ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {log.action}
                                        </span>
                                        <span className="text-xs text-slate-500">{log.time}</span>
                                    </div>
                                    <div className="text-slate-500 dark:text-slate-400 text-xs">
                                        Utilisateur: {log.user}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                            <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 mb-1">Mises à jour système</h4>
                            <p className="text-xs text-emerald-600 dark:text-emerald-500">
                                La dernière mise à jour de sécurité a été appliquée avec succès. Le système est à jour.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
