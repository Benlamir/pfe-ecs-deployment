import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Shield,
    Lock,
    UserX,
    Building2,
    X,
    RefreshCw
} from 'lucide-react';
import api from '../../services/api';

export function SuperAdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [etablissements, setEtablissements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // For password reset modal
    const [resetModalOpen, setResetModalOpen] = useState(false);
    const [selectedUserForReset, setSelectedUserForReset] = useState<any>(null);
    const [newPassword, setNewPassword] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        establishment_id: '',
        role: 'ETABLISSEMENT_ADMIN'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, etabRes] = await Promise.all([
                api.get('/superadmin/users/'),
                api.get('/superadmin/etablissements/')
            ]);
            setUsers(usersRes.data);
            setEtablissements(etabRes.data);
        } catch (error) {
            console.error("Erreur chargement données", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/superadmin/users/', formData);
            setUsers([res.data, ...users]);
            closeDrawer();
            fetchData(); // Refresh to update manager names globally
        } catch (error: any) {
            console.error("Erreur création utilisateur", error);
            if (error.response?.data?.email) {
                alert("Cet email est déjà utilisé.");
            } else {
                alert("Erreur lors de la création de l'utilisateur.");
            }
        }
    };

    const handleDeactivate = async (id: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir désactiver ce compte ? L'utilisateur ne pourra plus se connecter.")) {
            try {
                // To deactivate, we actually call DELETE, which our backend translates to a soft delete (is_active=False)
                await api.delete(`/superadmin/users/${id}/`);
                setUsers(users.map(u => u.id === id ? { ...u, is_active: false } : u));
            } catch (error) {
                console.error("Erreur désactivation", error);
                alert("Erreur lors de la désactivation du compte.");
            }
        }
    };

    const openResetModal = (user: any) => {
        setSelectedUserForReset(user);
        setNewPassword('');
        setResetModalOpen(true);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserForReset) return;

        try {
            await api.post(`/superadmin/users/${selectedUserForReset.id}/reset_password/`, {
                password: newPassword
            });
            alert("Mot de passe réinitialisé avec succès.");
            setResetModalOpen(false);
        } catch (error) {
            console.error("Erreur réinitialisation mdp", error);
            alert("Erreur lors de la réinitialisation du mot de passe.");
        }
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setFormData({
            name: '',
            email: '',
            password: '',
            establishment_id: '',
            role: 'ETABLISSEMENT_ADMIN'
        });
    };

    const filtered = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.first_name && u.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.last_name && u.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="bg-[#f9fafb] dark:bg-slate-950 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 -m-4 md:-m-6 lg:-m-8 relative">

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Comptes Utilisateurs</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les accès administratifs et les mots de passe.</p>
                </div>
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Nouvel Administrateur
                </button>
            </div>

            {/* Filter bar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 subtle-shadow mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par email ou nom..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                    />
                </div>
            </div>

            {/* List View */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
                    <p className="mt-4 text-slate-500">Chargement des utilisateurs...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                    <Shield className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Aucun utilisateur trouvé</h3>
                    <p className="text-slate-500">Essayez de modifier vos critères de recherche.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden subtle-shadow">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-800 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Utilisateur</th>
                                    <th className="px-6 py-4">Rôle</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {filtered.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                {user.first_name} {user.last_name}
                                            </div>
                                            <div className="text-slate-500 text-xs mt-0.5">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                                                    Actif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/50 dark:border-rose-500/20">
                                                    Désactivé
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openResetModal(user)}
                                                    className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 rounded-md transition-colors"
                                                    title="Réinitialiser le mot de passe"
                                                >
                                                    <RefreshCw className="h-4 w-4" />
                                                </button>
                                                {user.is_active && (
                                                    <button
                                                        onClick={() => handleDeactivate(user.id)}
                                                        className="p-1.5 text-slate-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 rounded-md transition-colors"
                                                        title="Désactiver le compte"
                                                    >
                                                        <UserX className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Slider / Drawer for User Creation */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />
                    <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
                        <div className="w-full h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform border-l border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-emerald-600" />
                                    Nouvel Administrateur
                                </h2>
                                <button
                                    onClick={closeDrawer}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                                <form id="user-form" onSubmit={handleCreate} className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Nom complet <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                                                placeholder="Ex: Jean Dupont"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Email professionnel <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                                                placeholder="jean.dupont@cfc.local"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Mot de passe <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="password"
                                                    required
                                                    value={formData.password}
                                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                                                    placeholder="Minimum 8 caractères"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Assignation</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Établissement rattaché
                                            </label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <select
                                                    value={formData.establishment_id}
                                                    onChange={e => setFormData({ ...formData, establishment_id: e.target.value })}
                                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all appearance-none"
                                                >
                                                    <option value="">-- Aucun rattachement (Libre) --</option>
                                                    {etablissements.map(e => (
                                                        <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500">Le rôle ETABLISSEMENT_ADMIN lui sera assigné.</p>
                                        </div>
                                    </div>

                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={closeDrawer}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    form="user-form"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm inline-flex items-center gap-2"
                                >
                                    Créer le compte
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Reset Modal */}
            {resetModalOpen && selectedUserForReset && (
                <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setResetModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Réinitialiser le mot de passe</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Pour <span className="font-medium">{selectedUserForReset.email}</span>
                            </p>

                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Nouveau mot de passe
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                                        placeholder="Saisissez un nouveau mot de passe"
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setResetModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                    >
                                        Confirmer
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
