import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    Calendar,
    Users,
    X
} from 'lucide-react';
import api from '../../services/api';

export function AdminFormations() {
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        capacity: 0,
        status: 'DRAFT',
        registration_open_date: '',
        registration_close_date: ''
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/courses/');
            setCourses(res.data);
        } catch (error) {
            console.error("Erreur chargement formations", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (course: any) => {
        const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
        try {
            await api.patch(`/courses/${course.id}/`, { status: newStatus });
            setCourses(courses.map(c => c.id === course.id ? { ...c, status: newStatus } : c));
        } catch (error) {
            console.error("Erreur statut", error);
            alert("Erreur lors du changement de statut.");
        }
    };

    const handleCreateOrEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCourseId) {
                // Edit Mode
                const res = await api.patch(`/courses/${editingCourseId}/`, formData);
                setCourses(courses.map(c => c.id === editingCourseId ? res.data : c));
            } else {
                // Create Mode
                const res = await api.post('/courses/', formData);
                setCourses([res.data, ...courses]);
            }
            closeDrawer();
        } catch (error) {
            console.error("Erreur sauvegarde", error);
            alert("Erreur lors de l'enregistrement de la formation.");
        }
    };

    const handleEditClick = (course: any) => {
        setEditingCourseId(course.id);
        setFormData({
            title: course.title,
            description: course.description,
            capacity: course.capacity,
            status: course.status,
            registration_open_date: course.registration_open_date || '',
            registration_close_date: course.registration_close_date || ''
        });
        setIsDrawerOpen(true);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setEditingCourseId(null);
        setFormData({
            title: '',
            description: '',
            capacity: 0,
            status: 'DRAFT',
            registration_open_date: '',
            registration_close_date: ''
        });
    }

    const handleDelete = async (courseId: number) => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.")) {
            try {
                await api.delete(`/courses/${courseId}/`);
                setCourses(courses.filter(c => c.id !== courseId));
            } catch (error) {
                console.error("Erreur suppression", error);
                alert("Erreur lors de la suppression de la formation.");
            }
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-[#f9fafb] dark:bg-slate-950 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 -m-4 md:-m-6 lg:-m-8 relative">

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Gestion des Formations</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gérez le catalogue des formations et leurs inscriptions.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCourseId(null);
                        setFormData({
                            title: '',
                            description: '',
                            capacity: 0,
                            status: 'DRAFT',
                            registration_open_date: '',
                            registration_close_date: ''
                        });
                        setIsDrawerOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Nouvelle Formation
                </button>
            </div>

            {/* Filter bar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 subtle-shadow mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une formation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all dark:text-white"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl subtle-shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Titre</th>
                                <th className="px-6 py-4 font-medium">Capacité</th>
                                <th className="px-6 py-4 font-medium">Dates d'inscription</th>
                                <th className="px-6 py-4 font-medium">Statut</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Chargement des données...</td>
                                </tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Aucune formation trouvée.</td>
                                </tr>
                            ) : (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-white">{course.title}</div>
                                            <div className="text-xs text-slate-500 mt-1 line-clamp-1">{course.description.substring(0, 60)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                <Users className="h-4 w-4 text-slate-400" />
                                                <span>{course.capacity || 'Illimité'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400">
                                                {course.registration_open_date ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                                                        <span>Déb: {course.registration_open_date}</span>
                                                    </div>
                                                ) : <span className="text-slate-400 italic">Non défini</span>}
                                                {course.registration_close_date ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5 text-rose-500" />
                                                        <span>Fin: {course.registration_close_date}</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(course)}
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${course.status === 'PUBLISHED'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-500/20'
                                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {course.status === 'PUBLISHED' ? (
                                                    <><CheckCircle2 className="h-3.5 w-3.5" /> Publié</>
                                                ) : (
                                                    <><XCircle className="h-3.5 w-3.5" /> Brouillon</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditClick(course)}
                                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-colors mr-1"
                                                title="Modifier la formation"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-colors"
                                                title="Supprimer la formation"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Creation Drawer Sidebar */}
            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={closeDrawer} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-md flex bg-white dark:bg-slate-900 shadow-2xl transition-transform transform translate-x-0">
                        <div className="h-full flex flex-col w-full">
                            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {editingCourseId ? 'Modifier la Formation' : 'Nouvelle Formation'}
                                </h2>
                                <button onClick={closeDrawer} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <form id="course-form" onSubmit={handleCreateOrEdit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titre de la formation *</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                                            placeholder="Ex: Master en Ingénierie..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                                        <textarea
                                            required
                                            rows={4}
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                                            placeholder="Décrivez les objectifs, le pré-requis, etc."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacité maximale</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.capacity}
                                            onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                                            placeholder="0 pour illimité"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Laissez à 0 pour une capacité illimitée.</p>
                                    </div>

                                    {/* DateRangePicker equivalent using two input[type=date] */}
                                    <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                            Période d'inscription
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date d'ouverture</label>
                                                <input
                                                    type="date"
                                                    value={formData.registration_open_date}
                                                    onChange={e => setFormData({ ...formData, registration_open_date: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Date de fermeture</label>
                                                <input
                                                    type="date"
                                                    min={formData.registration_open_date || undefined}
                                                    value={formData.registration_close_date}
                                                    onChange={e => setFormData({ ...formData, registration_close_date: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Toggle Switch */}
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Publier immédiatement</p>
                                            <p className="text-xs text-slate-500">La formation sera visible par les candidats.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={formData.status === 'PUBLISHED'}
                                                onChange={e => setFormData({ ...formData, status: e.target.checked ? 'PUBLISHED' : 'DRAFT' })}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/20 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                                        </label>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeDrawer}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    form="course-form"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                                >
                                    {editingCourseId ? 'Enregistrer les modifications' : 'Créer la formation'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
