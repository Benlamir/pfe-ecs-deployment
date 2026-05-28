import * as React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Search, MapPin, GraduationCap, ChevronDown, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

// Simple debounce hook for performance optimization
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export function Home() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [domainFilter, setDomainFilter] = React.useState('');
    const [levelFilter, setLevelFilter] = React.useState('');

    // Use debounced search query to prevent excessive filtering re-renders
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const formations = [
        {
            id: 1,
            title: "Master en Ingénierie des Systèmes d'Information",
            status: "Ouvert",
            etablissement: "École Nationale des Sciences Appliquées",
            niveau: "Master",
            domaine: "Informatique",
            dateDebut: "Septembre 2026",
            placesL: 12
        },
        {
            id: 2,
            title: "Licence Professionnelle en Management",
            status: "Fermé",
            etablissement: "Faculté d'Économie et de Gestion",
            niveau: "Licence",
            domaine: "Gestion",
            dateDebut: "Octobre 2026",
            placesL: 0
        },
        {
            id: 3,
            title: "Master Spécialisé en Data Science",
            status: "Ouvert",
            etablissement: "Faculté des Sciences",
            niveau: "Master",
            domaine: "Intelligence Artificielle",
            dateDebut: "Septembre 2026",
            placesL: 5
        },
        {
            id: 4,
            title: "Diplôme Universitaire en Cybersécurité",
            status: "Ouvert",
            etablissement: "École Nationale de Commerce",
            niveau: "Formation Continue",
            domaine: "Sécurité",
            dateDebut: "Novembre 2026",
            placesL: 20
        }
    ];

    // Compute derived filtered list
    const filteredFormations = React.useMemo(() => {
        return formations.filter(form => {
            // Check domain filter (exact match or empty)
            if (domainFilter && form.domaine !== domainFilter) return false;

            // Check level filter (exact match or empty)
            if (levelFilter && form.niveau !== levelFilter) return false;

            // Check debounced search query (case insensitive search in multiple fields)
            if (debouncedSearchQuery) {
                const query = debouncedSearchQuery.toLowerCase();
                const matchTitle = form.title.toLowerCase().includes(query);
                const matchSchool = form.etablissement.toLowerCase().includes(query);
                const matchDomain = form.domaine.toLowerCase().includes(query);
                if (!matchTitle && !matchSchool && !matchDomain) return false;
            }

            return true;
        });
    }, [debouncedSearchQuery, domainFilter, levelFilter]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header and Search Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl subtle-shadow border border-slate-100 dark:border-slate-800">
                <div className="w-full md:w-1/2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Catalogue des Formations</h1>
                    <p className="text-slate-500 mt-2">Découvrez nos programmes d'excellence et postulez en quelques clics.</p>

                    <div className="relative mt-6 group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-emerald-600 dark:text-emerald-500 transition-colors group-focus-within:text-emerald-700">
                            <Search className="h-5 w-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher une formation, un domaine, un établissement..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex h-12 w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 pl-12 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:bg-white dark:focus-visible:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* Dropdown Filters */}
                <div className="w-full md:w-auto flex flex-wrap gap-3">
                    <div className="relative">
                        <select
                            value={domainFilter}
                            onChange={(e) => setDomainFilter(e.target.value)}
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 h-10 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                        >
                            <option value="">Tous les Domaines</option>
                            <option value="Informatique">Informatique</option>
                            <option value="Gestion">Gestion</option>
                            <option value="Intelligence Artificielle">IA / Data Science</option>
                            <option value="Sécurité">Cybersécurité</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 h-10 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                        >
                            <option value="">Tous les Niveaux</option>
                            <option value="Master">Master</option>
                            <option value="Licence">Licence</option>
                            <option value="Formation Continue">Formation Continue</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Grid of Cards */}
            {filteredFormations.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredFormations.map((form) => (
                        <Link to={`/dashboard/formations/${form.id}`} key={form.id} className="block group">
                            <Card className="h-full hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 cursor-pointer">
                                <CardContent className="p-0 flex flex-col h-full">
                                    {/* Card Banner Top */}
                                    <div className="h-2 w-full bg-gradient-to-r from-emerald-500 to-emerald-700 transition-all duration-300 group-hover:from-emerald-400 group-hover:to-emerald-600"></div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${form.status === 'Ouvert'
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {form.status === 'Ouvert' ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                                                {form.status}
                                            </span>
                                            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-50 text-slate-500 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                {form.niveau}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                            {form.title}
                                        </h3>

                                        <div className="space-y-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                <MapPin className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                                <span className="truncate">{form.etablissement}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                <GraduationCap className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                                {form.domaine}
                                            </div>
                                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                <Clock className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                                Début: {form.dateDebut}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                        <span className={`text-sm font-medium ${form.status === 'Ouvert' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {form.status === 'Ouvert' ? `${form.placesL} places restantes` : 'Complet'}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant={form.status === 'Ouvert' ? 'default' : 'outline'}
                                            disabled={form.status !== 'Ouvert'}
                                            className={form.status === 'Ouvert' ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' : 'dark:border-slate-700 dark:text-slate-400'}
                                        >
                                            {form.status === 'Ouvert' ? 'Postuler' : 'Fermé'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 subtle-shadow">
                    <Search className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Aucune formation trouvée</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
                        Ajustez vos filtres ou votre recherche pour trouver le programme qui vous correspond.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => { setSearchQuery(''); setDomainFilter(''); setLevelFilter(''); }}
                        className="mt-6"
                    >
                        Réinitialiser les filtres
                    </Button>
                </div>
            )}
        </div>
    );
}
