import { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    CheckCircle2,
    Clock,
    TrendingUp,
    Activity
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import api from '../../services/api';

export function CoordinatorDashboard() {
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingApplications: 0,
        acceptanceRate: 0,
        activeCourses: 0
    });

    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // In a real app, there would be an analytics endpoint. 
                // Currently simulating analytics by fetching courses and enrollments.
                const coursesRes = await api.get('/courses/');
                const enrollmentsRes = await api.get('/enrollments/');

                const courses = coursesRes.data;
                const enrollments = enrollmentsRes.data;

                // 1. Calculate KPIs
                const active = courses.filter((c: any) => c.status === 'PUBLISHED').length;
                const totalApps = enrollments.length;
                const pending = enrollments.filter((e: any) =>
                    e.status === 'SUBMITTED' || e.status === 'UNDER_REVIEW' || e.status === 'PRE_ENROLLED'
                ).length;

                const accepted = enrollments.filter((e: any) =>
                    e.status === 'ACCEPTED' || e.status === 'FINALIZED'
                ).length;

                const rate = totalApps > 0 ? Math.round((accepted / totalApps) * 100) : 0;

                setStats({
                    totalApplications: totalApps,
                    pendingApplications: pending,
                    acceptanceRate: rate,
                    activeCourses: active
                });

                // 2. Prepare Chart Data (Applications per course)
                const courseCountMap: Record<string, { total: number, accepted: number }> = {};

                // Initialize map with all courses
                courses.forEach((c: any) => {
                    courseCountMap[c.title] = { total: 0, accepted: 0 };
                });

                // Populate with actual enrollments
                enrollments.forEach((e: any) => {
                    const courseTitle = e.course_details?.title;
                    if (courseTitle && courseCountMap[courseTitle]) {
                        courseCountMap[courseTitle].total += 1;
                        if (e.status === 'ACCEPTED' || e.status === 'FINALIZED') {
                            courseCountMap[courseTitle].accepted += 1;
                        }
                    }
                });

                // Convert to array for Recharts
                const formattedChartData = Object.keys(courseCountMap).map(title => ({
                    name: title.length > 25 ? title.substring(0, 25) + '...' : title, // truncate long titles
                    Candidatures: courseCountMap[title].total,
                    Acceptés: courseCountMap[title].accepted,
                }));

                setChartData(formattedChartData);
            } catch (error) {
                console.error("Erreur chargement dashboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Helper KPI Card
    const KpiCard = ({ title, value, subtext, icon: Icon, trend, color }: any) => (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 subtle-shadow flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{value}</h3>
                <div className="flex items-center text-xs">
                    {trend && (
                        <span className="flex items-center text-emerald-600 dark:text-emerald-400 mr-2 font-medium">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {trend}
                        </span>
                    )}
                    <span className="text-slate-400 dark:text-slate-500">{subtext}</span>
                </div>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full bg-[#f9fafb] dark:bg-slate-950">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="bg-[#f9fafb] dark:bg-slate-950 min-h-[calc(100vh-4rem)] -m-4 md:-m-6 lg:-m-8 p-4 md:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Vue d'ensemble</h1>
                <p className="text-slate-500 dark:text-slate-400">Suivez l'activité des candidatures et les statistiques de vos formations.</p>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard
                    title="Candidatures Totales"
                    value={stats.totalApplications}
                    subtext="depuis le début"
                    icon={Users}
                    color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    trend="+12% ce mois"
                />
                <KpiCard
                    title="Dossiers en attente"
                    value={stats.pendingApplications}
                    subtext="à examiner"
                    icon={Clock}
                    color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                />
                <KpiCard
                    title="Taux d'acceptation"
                    value={`${stats.acceptanceRate}%`}
                    subtext="moyenne globale"
                    icon={CheckCircle2}
                    color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    trend="+2.4%"
                />
                <KpiCard
                    title="Formations Actives"
                    value={stats.activeCourses}
                    subtext="ouvertes aux inscriptions"
                    icon={BookOpen}
                    color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Bar Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 subtle-shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Répartition des Candidatures</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Volume de candidatures par formation</p>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                            <Activity className="h-5 w-5 text-slate-400" />
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="Candidatures" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                                <Bar dataKey="Acceptés" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Info Panel (E.g. Recent Activity or Actions) */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 subtle-shadow flex flex-col">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Actions Rapides</h2>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center rounded-lg mr-3 group-hover:scale-110 transition-transform">
                                    <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Nouvelle Formation</p>
                                    <p className="text-xs text-slate-500">Créer un nouveau programme</p>
                                </div>
                            </div>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left group">
                            <div className="flex items-center">
                                <div className="h-10 w-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center rounded-lg mr-3 group-hover:scale-110 transition-transform">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-white text-sm">Candidats en attente</p>
                                    <p className="text-xs text-slate-500">Examiner les {stats.pendingApplications} dossiers</p>
                                </div>
                            </div>
                        </button>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">Rapport mensuel</h4>
                            <p className="text-xs text-slate-500 mb-3">Le dernier rapport analytique a été généré avec succès.</p>
                            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">Télécharger PDF &rarr;</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
