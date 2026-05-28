import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Building2,
    MapPin,
    Globe,
    Users,
    X,
    CheckCircle2,
    Image as ImageIcon
} from 'lucide-react';
import api from '../../services/api';

export function SuperAdminEtablissements() {
    const [etablissements, setEtablissements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // File state
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        address: '',
        website: ''
    });

    useEffect(() => {
        fetchEtablissements();
    }, []);

    const fetchEtablissements = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/superadmin/etablissements/');
            setEtablissements(res.data);
        } catch (error) {
            console.error("Erreur chargement établissements", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOrEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('code', formData.code);
            submitData.append('description', formData.description);
            submitData.append('address', formData.address);
            submitData.append('website', formData.website);

            if (logoFile) {
                submitData.append('logo', logoFile);
            }

            if (editingId) {
                // Edit Mode
                const res = await api.patch(`/superadmin/etablissements/${editingId}/`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setEtablissements(etablissements.map(c => c.id === editingId ? res.data : c));
            } else {
                // Create Mode
                const res = await api.post('/superadmin/etablissements/', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                setEtablissements([res.data, ...etablissements]);
            }
            closeDrawer();
        } catch (error) {
            console.error("Erreur sauvegarde", error);
            alert("Erreur lors de l'enregistrement de l'établissement.");
        }
    };

    const handleEditClick = (etab: any) => {
        setEditingId(etab.id);
        setFormData({
            name: etab.name,
            code: etab.code,
            description: etab.description || '',
            address: etab.address || '',
            website: etab.website || ''
        });
        setLogoFile(null);
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setEditingId(null);
        setLogoFile(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            address: '',
            website: ''
        });
    }

    const handleDelete = async (id: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cet établissement ? Cette action est irréversible.")) {
            try {
                await api.delete(`/superadmin/etablissements/${id}/`);
                setEtablissements(etablissements.filter(c => c.id !== id));
            } catch (error) {
                console.error("Erreur suppression", error);
                alert("Erreur lors de la suppression de l'établissement.");
            }
        }
    };

    const filtered = etablissements.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-[#f9fafb] dark:bg-slate-950 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 -m-4 md:-m-6 lg:-m-8 relative">

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Gestion des Établissements</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les entités et composantes universitaires.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setLogoFile(null);
                        setFormData({
                            name: '',
                            code: '',
                            description: '',
                            address: '',
                            website: ''
                        });
                        setIsDrawerOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Nouvel Établissement
                </button>
            </div>

            {/* Filter bar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 subtle-shadow mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
                    />
                </div>
            </div>

            {/* Grid View */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div>
                    <p className="mt-4 text-slate-500">Chargement des établissements...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed">
                    <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Aucun établissement trouvé</h3>
                    <p className="text-slate-500">Essayez de modifier vos critères de recherche ou ajoutez un nouvel établissement.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map(etab => (
                        <div key={etab.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden subtle-shadow group flex flex-col">
                            <div className="h-32 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-4 border-b border-slate-100 dark:border-slate-800 relative">
                                {etab.logo ? (
                                    <img src={etab.logo} alt={`Logo ${etab.name}`} className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                )}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button
                                        onClick={() => handleEditClick(etab)}
                                        className="p-1.5 bg-white dark:bg-slate-800 rounded-md text-slate-600 hover:text-emerald-600 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
                                        title="Modifier"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(etab.id)}
                                        className="p-1.5 bg-white dark:bg-slate-800 rounded-md text-slate-600 hover:text-red-600 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{etab.name}</h3>
                                </div>
                                <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded-md w-fit mb-4">
                                    Code: {etab.code}
                                </span>

                                <div className="mt-auto space-y-2 text-sm text-slate-500 dark:text-slate-400">
                                    {etab.address && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span className="line-clamp-2">{etab.address}</span>
                                        </div>
                                    )}
                                    {etab.website && (
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 shrink-0" />
                                            <a href={etab.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline truncate">
                                                Site Web
                                            </a>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 shrink-0" />
                                        <span>Manager: {etab.manager ? 'Assigné' : 'Non assigné'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Slider / Drawer for Form */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />
                    <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
                        <div className="w-full h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col transform transition-transform border-l border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-emerald-600" />
                                    {editingId ? 'Modifier l\'Établissement' : 'Nouvel Établissement'}
                                </h2>
                                <button
                                    onClick={closeDrawer}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                                <form id="etab-form" onSubmit={handleCreateOrEdit} className="space-y-6">
                                    {/* Informations de base */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Nom de l'établissement <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                                                placeholder="Ex: École Supérieure d'Informatique"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Code interne <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white uppercase transition-all"
                                                placeholder="Ex: ESI-2025"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white resize-none transition-all"
                                                placeholder="Description courte de l'établissement..."
                                            />
                                        </div>
                                    </div>

                                    {/* Coordonnées */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Coordonnées</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Adresse postale
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                                                placeholder="123 Rue de l'Université, Ville"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Site Web
                                            </label>
                                            <input
                                                type="url"
                                                value={formData.website}
                                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white transition-all"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>

                                    {/* Logo */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Identité Visuelle</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Logo officiel
                                            </label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg bg-slate-50 dark:bg-slate-800/30">
                                                <div className="space-y-1 text-center">
                                                    <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                                                    <div className="flex text-sm text-slate-600 dark:text-slate-400">
                                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-slate-900 rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none px-2 py-1">
                                                            <span>Télécharger un fichier</span>
                                                            <input
                                                                id="file-upload"
                                                                name="file-upload"
                                                                type="file"
                                                                className="sr-only"
                                                                accept="image/png, image/jpeg, image/jpg"
                                                                onChange={(e) => {
                                                                    if (e.target.files && e.target.files.length > 0) {
                                                                        setLogoFile(e.target.files[0]);
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                        <p className="pl-1 pt-1 text-xs">ou glissez-déposez</p>
                                                    </div>
                                                    <p className="text-xs text-slate-500">
                                                        PNG, JPG jusqu'à 2MB
                                                    </p>
                                                    {logoFile && (
                                                        <div className="mt-2 text-sm text-emerald-600 flex items-center justify-center gap-1">
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            {logoFile.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
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
                                    form="etab-form"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm inline-flex items-center gap-2"
                                >
                                    {editingId ? 'Enregistrer les modifications' : 'Créer l\'établissement'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
