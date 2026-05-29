import { useState, useEffect } from 'react';
import {
    Users,
    GraduationCap,
    TrendingUp,
    Briefcase,
    Activity
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';
import api from '../../services/api';

export function EtablissementDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        activePrograms: 0,
        conversionRate: 0,
        pendingActions: 0
    });

    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEtablissementData = async () => {
            try {
                // In a real application, this would fetch data isolated to the Administrator's specific Etablissement.
                // Here we simulate the KPIs based on the global courses and enrollments available.
                const [coursesRes, enrollmentsRes] = await Promise.all([
                    api.get('/courses/'),
                    api.get('/enrollments/')
                ]);

                const courses = coursesRes.data;
                const enrollments = enrollmentsRes.data;

                // 1. Calculate Etablissement Specific KPIs
                const active = courses.filter((c: any) => c.status === 'PUBLISHED').length;
                const totalApps = enrollments.length;
                const pending = enrollments.filter((e: any) =>
                    e.status === 'UNDER_REVIEW' || e.status === 'SUBMITTED'
                ).length;
                const accepted = enrollments.filter((e: any) =>
                    e.status === 'ACCEPTED' || e.status === 'FINALIZED'
                ).length;

                const rate = totalApps > 0 ? Math.round((accepted / totalApps) * 100) : 0;

                setStats({
                    totalStudents: accepted, // Simulating total "students" as accepted candidates
                    activePrograms: active,
                    conversionRate: rate,
                    pendingActions: pending
                });

                // 2. Prepare Chart Data (Simulated Monthly Evolution)
                // In a real scenario, this aggregates application_date or enrollment status dates.
                const mockTimeline = [
                    { name: 'Jan', candidats: 40, acceptes: 24 },
                    { name: 'Fév', candidats: 30, acceptes: 13 },
                    { name: 'Mar', candidats: 20, acceptes: 18 },
                    { name: 'Avr', candidats: 27, acceptes: 20 },
                    { name: 'Mai', candidats: 18, acceptes: 15 },
                    { name: 'Juin', candidats: 23, acceptes: 21 },
                    { name: 'Juil', candidats: 34, acceptes: 29 },
                ];

                // Add the real total to the last month to ground the simulation in reality
                mockTimeline.push({
                    name: 'Août (Actuel)',
                    candidats: totalApps,
                    acceptes: accepted
                });

                setChartData(mockTimeline);
            } catch (error) {
                console.error("Erreur chargement dashboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEtablissementData();
    }, []);

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
        <div className="bg-[#f9fafb] dark:bg-slate-950 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 -m-4 md:-m-6 lg:-m-8 relative">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Rapport d'Établissement</h1>
                <p className="text-slate-500 dark:text-slate-400">Performances, conversions et statistiques globales de votre établissement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KpiCard
                    title="Étudiants Inscrits"
                    value={stats.totalStudents}
                    subtext="Total validé"
                    icon={GraduationCap}
                    color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    trend="+15% (A/A)"
                />
                <KpiCard
                    title="Programmes Actifs"
                    value={stats.activePrograms}
                    subtext="Formations ouvertes"
                    icon={Briefcase}
                    color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                />
                <KpiCard
                    title="Taux de Conversion"
                    value={`${stats.conversionRate}%`}
                    subtext="Candidats acceptés"
                    icon={TrendingUp}
                    color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                    trend="+3.1%"
                />
                <KpiCard
                    title="Actions Requises"
                    value={stats.pendingActions}
                    subtext="Dossiers en attente"
                    icon={Users}
                    color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                />
            </div>

            {/* Growth Chart Section */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 subtle-shadow mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Évolution de l'attractivité</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Croissance des candidatures vs acceptations sur l'année.</p>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-md">
                        <Activity className="h-5 w-5 text-slate-400" />
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorCandidats" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAcceptes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
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
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area type="monotone" dataKey="candidats" name="Candidatures" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorCandidats)" />
                            <Area type="monotone" dataKey="acceptes" name="Dossiers Acceptés" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAcceptes)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
