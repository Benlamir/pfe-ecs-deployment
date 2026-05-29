import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Users, FileText, Search } from 'lucide-react';
import api from '../services/api';

interface Enrollment {
    id: string;
    course_details: {
        title: string;
    };
    candidate: number; // Assuming the ID is exposed, or could be expanded via user serializer
    status: string;
    application_date: string;
    cv_file?: string;
    documents?: {
        phone?: string;
        motivation?: string;
    };
}

export function Candidates() {
    const [enrollments, setEnrollments] = React.useState<Enrollment[]>([]);
    const [courses, setCourses] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filterStatus, setFilterStatus] = React.useState('');
    const [filterCourse, setFilterCourse] = React.useState('');

    React.useEffect(() => {
        fetchEnrollmentsAndCourses();
    }, []);

    const fetchEnrollmentsAndCourses = async () => {
        setIsLoading(true);
        try {
            const [enrollmentsRes, coursesRes] = await Promise.all([
                api.get('/enrollments/'),
                api.get('/courses/')
            ]);
            setEnrollments(enrollmentsRes.data);
            setCourses(coursesRes.data);
            setError('');
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError('Impossible de charger les données. Assurez-vous d\'avoir les droits nécessaires (Coordinateur ou Admin).');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'ACCEPTED':
            case 'FINALIZED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Accepté</span>;
            case 'REJECTED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">Refusé</span>;
            case 'SUBMITTED':
            case 'UNDER_REVIEW':
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">En étude</span>;
        }
    };

    const filteredEnrollments = enrollments.filter(e => {
        if (filterStatus && e.status !== filterStatus) return false;
        if (filterCourse && e.course_details.title !== filterCourse) return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return e.course_details.title.toLowerCase().includes(query) ||
                (e.documents?.phone && e.documents.phone.includes(query));
        }
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl subtle-shadow border border-slate-100 dark:border-slate-800">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
                        Gestion des Candidatures
                    </h1>
                    <p className="text-slate-500 mt-2">Validez, étudiez ou refusez les dossiers de candidature reçus.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <select
                        value={filterCourse}
                        onChange={e => setFilterCourse(e.target.value)}
                        className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[200px]"
                    >
                        <option value="">Toutes les formations</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.title}>
                                {course.title.length > 30 ? course.title.substring(0, 30) + '...' : course.title}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="SUBMITTED">Nouveaux (En attente)</option>
                        <option value="ACCEPTED">Acceptés</option>
                        <option value="REJECTED">Refusés</option>
                    </select>
                </div>
            </div>

            {error ? (
                <Card className="bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-800/30">
                    <CardContent className="p-6 text-red-600 dark:text-red-400 font-medium text-center">
                        {error}
                    </CardContent>
                </Card>
            ) : filteredEnrollments.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 subtle-shadow text-slate-500">
                    Aucune candidature ne correspond à vos critères.
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 subtle-shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">ID Candidat / Date</th>
                                    <th className="px-6 py-4">Formation</th>
                                    <th className="px-6 py-4">Contact & CV</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                {filteredEnrollments.map((enr) => (
                                    <tr key={enr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-900 dark:text-white">Candidat #{enr.candidate}</div>
                                            <div className="text-slate-500 text-xs mt-1">
                                                {new Date(enr.application_date).toLocaleDateString('fr-FR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium max-w-[250px] truncate" title={enr.course_details.title}>
                                                {enr.course_details.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {enr.documents?.phone && <span className="text-xs">{enr.documents.phone}</span>}
                                                {enr.cv_file ? (
                                                    <a
                                                        href={enr.cv_file}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 text-xs font-semibold"
                                                    >
                                                        <FileText className="h-3 w-3" /> Voir CV
                                                    </a>
                                                ) : <span className="text-xs text-slate-400 italic">Aucun CV partagé</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(enr.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`${enr.id}`}
                                                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                                                >
                                                    Examiner
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
