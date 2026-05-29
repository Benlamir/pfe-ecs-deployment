import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import Header from '../components/Header';

// Types (à factoriser)
interface Establishment {
    id: number;
    name: string;
    code: string;
    logo: string | null;
}

interface Course {
    id: number;
    title: string;
    description: string;
    establishment_details: Establishment;
    status: string;
    start_date: string;
    end_date: string;
    registration_open_date: string;
    registration_close_date: string;
    is_open: boolean;
    capacity: number;
    coordinator: number; // ID du coordinateur
}

const CourseDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await api.get(`/courses/${id}/`);
                setCourse(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Erreur chargement cours", err);
                setError("Impossible de charger les détails de cette formation.");
                setLoading(false);
            }
        };

        if (id) {
            fetchCourse();
        }
    }, [id]);

    if (loading) return <div className="text-center py-20 bg-gray-50 min-h-screen">Chargement...</div>;
    if (error || !course) return <div className="text-center py-20 bg-gray-50 min-h-screen text-red-600">{error || "Formation introuvable"}</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* 1. Header (Reused) */}
            <Header />

            {/* 2. Hero Section */}
            <div className="bg-blue-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <div className="inline-flex items-center bg-blue-800 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide mb-4">
                                {course.establishment_details.name}
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                                {course.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-blue-100 text-sm">
                                <span className="flex items-center gap-1">
                                    📅 Début : {course.start_date || 'À définir'}
                                </span>
                                <span className="flex items-center gap-1">
                                    🏁 Fin : {course.end_date || 'À définir'}
                                </span>
                            </div>
                        </div>
                        {course.establishment_details.logo && (
                            <img src={course.establishment_details.logo} alt="Logo" className="w-24 h-24 rounded-full bg-white p-2 object-contain hidden md:block" />
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Main Content - 2 Columns */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Description</h2>
                            <div className="prose text-gray-700 whitespace-pre-line">
                                {course.description}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Informations Pratiques</h2>
                            <ul className="space-y-3 text-gray-700">
                                <li><strong>Capacité :</strong> {course.capacity > 0 ? `${course.capacity} places` : 'Illimité'}</li>
                                <li><strong>Inscriptions :</strong> Du {course.registration_open_date || '?'} au {course.registration_close_date || '?'}</li>
                            </ul>
                        </section>
                    </div>

                    {/* Right Column: Sticky Action Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24 border border-gray-100">
                            {course.is_open ? (
                                <div className="text-center mb-6">
                                    <span className="inline-block bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full mb-2">
                                        Inscriptions Ouvertes
                                    </span>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Ne tardez pas, les places sont limitées.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center mb-6">
                                    <span className="inline-block bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full mb-2">
                                        Inscriptions Fermées
                                    </span>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Ce cours n'accepte plus de nouvelles candidatures pour le moment.
                                    </p>
                                </div>
                            )}

                            {course.is_open ? (
                                <Link
                                    to={`/apply/${course.id}`}
                                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-center transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                >
                                    Postuler Maintenant
                                </Link>
                            ) : (
                                <button disabled className="block w-full bg-gray-300 text-gray-500 font-bold py-4 px-6 rounded-lg text-center cursor-not-allowed">
                                    Candidatures closes
                                </button>
                            )}

                            <div className="mt-6 border-t pt-4">
                                <button className="w-full text-blue-600 font-medium hover:text-blue-800 text-sm flex items-center justify-center gap-2">
                                    📥 Télécharger la brochure (PDF)
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Footer (Reused) */}
            <footer className="bg-white border-t border-gray-200 mt-20">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="text-gray-400 text-sm">
                            &copy; 2026 Centre de Formation Continue.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CourseDetail;
