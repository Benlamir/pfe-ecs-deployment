import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    FileText,
    User,
    Mail,
    Phone,
    GraduationCap,
    Calendar
} from 'lucide-react';
import api from '../../services/api';

export function CandidateDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [enrollment, setEnrollment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // PDF Viewer selection
    const [activeDocument, setActiveDocument] = useState<string | null>(null);

    // Rejection Modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectComment, setRejectComment] = useState('');

    // Accept Modal state
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
    const [acceptComment, setAcceptComment] = useState('');

    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchEnrollmentDetails();
    }, [id]);

    const fetchEnrollmentDetails = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/enrollments/${id}/`);
            setEnrollment(res.data);

            // Auto open CV if exists
            if (res.data.cv_file) {
                setActiveDocument(res.data.cv_file);
            } else if (res.data.diplome_file) {
                setActiveDocument(res.data.diplome_file);
            }

        } catch (error) {
            console.error("Erreur", error);
            alert("Impossible de charger les détails du dossier.");
            navigate('/dashboard/candidats');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string, comment: string = '') => {
        setIsUpdating(true);
        try {
            // Include decision notes if rejected
            const payload: any = { status: newStatus };
            if (comment) {
                payload.rejection_reason = comment;
            }

            await api.patch(`/enrollments/${id}/`, payload);

            // Update local state
            setEnrollment({ ...enrollment, status: newStatus, rejection_reason: comment });
            setIsRejectModalOpen(false);
            setRejectComment('');
            setIsAcceptModalOpen(false);
            setAcceptComment('');

        } catch (error) {
            console.error("Erreur update", error);
            alert("Erreur lors de la mise à jour du statut.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!enrollment) return null;

    const getStatusStyle = (status: string) => {
        if (status === 'ACCEPTED' || status === 'FINALIZED') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
        if (status === 'REJECTED') return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    };

    const getStatusLabel = (status: string) => {
        if (status === 'ACCEPTED' || status === 'FINALIZED') return 'Validé';
        if (status === 'REJECTED') return 'Refusé';
        return 'En étude';
    };

    return (
        <div className="bg-[#f9fafb] dark:bg-slate-950 min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8 -m-4 md:-m-6 lg:-m-8">

            {/* Header Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/candidats')}
                        className="p-2 -ml-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            Dossier Candidat #{enrollment.candidate}
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(enrollment.status)}`}>
                                {getStatusLabel(enrollment.status)}
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Soumis le {new Date(enrollment.application_date).toLocaleDateString('fr-FR')} pour <strong>{enrollment.course_details?.title}</strong>
                        </p>
                    </div>
                </div>

                {/* Validation Actions */}
                <div className="flex items-center gap-3">
                    <button
                        disabled={isUpdating || enrollment.status === 'REJECTED'}
                        onClick={() => setIsRejectModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-red-300 hover:bg-red-50 text-slate-700 dark:text-slate-300 hover:text-red-600 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <XCircle className="h-4 w-4" />
                        Rejeter
                    </button>
                    <button
                        disabled={isUpdating || enrollment.status === 'ACCEPTED' || enrollment.status === 'FINALIZED'}
                        onClick={() => setIsAcceptModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        Valider le dossier
                    </button>
                </div>
            </div>

            {/* Split View Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)]">

                {/* Left Column: Data & Info */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">

                    {/* Infos Personnelles */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 subtle-shadow">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                            Informations Personnelles
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 text-sm">
                                <User className="h-5 w-5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">
                                        {enrollment.documents?.first_name || 'Non spécifié'} {enrollment.documents?.last_name || ''}
                                    </p>
                                    <p className="text-slate-500">Nom complet</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <Mail className="h-5 w-5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">Email du compte utilisé</p>
                                    <p className="text-slate-500">Contact</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <Phone className="h-5 w-5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{enrollment.documents?.phone || 'Non fourni'}</p>
                                    <p className="text-slate-500">Téléphone</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <Calendar className="h-5 w-5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{enrollment.documents?.date_of_birth || 'Non fourni'}</p>
                                    <p className="text-slate-500">Date de naissance</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pièces jointes / Navigation */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 subtle-shadow">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                            Aperçu des documents
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveDocument(enrollment.cv_file)}
                                disabled={!enrollment.cv_file}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${activeDocument === enrollment.cv_file
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                                    } ${!enrollment.cv_file && 'opacity-50 cursor-not-allowed'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5" />
                                    <span className="font-medium text-sm">Curriculum Vitae</span>
                                </div>
                                {enrollment.cv_file && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">PDF</span>}
                            </button>

                            <button
                                onClick={() => setActiveDocument(enrollment.diplome_file)}
                                disabled={!enrollment.diplome_file}
                                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${activeDocument === enrollment.diplome_file
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                                    } ${!enrollment.diplome_file && 'opacity-50 cursor-not-allowed'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <GraduationCap className="h-5 w-5" />
                                    <span className="font-medium text-sm">Dernier Diplôme</span>
                                </div>
                                {enrollment.diplome_file && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Fichier</span>}
                            </button>
                        </div>
                    </div>

                    {/* Avis & Décision (Si statué) */}
                    {enrollment.status === 'REJECTED' && enrollment.rejection_reason && (
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-5 border border-red-100 dark:border-red-900/30">
                            <h3 className="text-sm font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                                <XCircle className="h-4 w-4" /> Motif du refus
                            </h3>
                            <p className="text-sm text-red-700 dark:text-red-300 italic px-2 py-1 bg-white/50 dark:bg-black/20 rounded">
                                "{enrollment.rejection_reason}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: PDF Viewer */}
                <div className="lg:col-span-8 bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col h-full shadow-inner relative">
                    {activeDocument ? (
                        activeDocument.toLowerCase().endsWith('.pdf') ? (
                            <iframe
                                src={`${activeDocument}#view=FitH`}
                                className="w-full h-full border-none"
                                title="Visionneuse PDF"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 overflow-auto p-4">
                                <img src={activeDocument} alt="Document Scanner" className="max-w-full max-h-full object-contain rounded" />
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500">
                            <FileText className="h-16 w-16 mb-4 opacity-50 text-slate-400" />
                            <p className="text-lg font-medium text-slate-600 dark:text-slate-300">Aucun document sélectionné</p>
                            <p className="text-sm mt-1">Sélectionnez un document dans la colonne de gauche pour l'afficher ici.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsRejectModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 rounded-full">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Rejeter la candidature</h2>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                            Vous êtes sur le point de refuser la candidature de <strong>{enrollment.documents?.first_name || 'Candidat'}</strong> à la formation <strong>{enrollment.course_details?.title}</strong>. Veuillez indiquer le motif de ce refus. Ce motif pourra être visible par le candidat.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Commentaire de décision *
                            </label>
                            <textarea
                                value={rejectComment}
                                onChange={e => setRejectComment(e.target.value)}
                                rows={4}
                                placeholder="Dossier incomplet, pré-requis non satisfaits..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('REJECTED', rejectComment)}
                                disabled={!rejectComment.trim() || isUpdating}
                                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2"
                            >
                                Confirmer le refus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Accept Modal */}
            {isAcceptModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAcceptModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Valider la candidature</h2>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                            Vous êtes sur le point d'accepter la candidature de <strong>{enrollment.documents?.first_name || 'Candidat'}</strong> à la formation <strong>{enrollment.course_details?.title}</strong>. Vous pouvez ajouter un commentaire optionnel (ex: conditions d'admission, instructions).
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Commentaire (Optionnel)
                            </label>
                            <textarea
                                value={acceptComment}
                                onChange={e => setAcceptComment(e.target.value)}
                                rows={4}
                                placeholder="Félicitations, votre dossier est retenu. Veuillez vous présenter le..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 dark:text-white"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setIsAcceptModalOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={() => handleUpdateStatus('ACCEPTED', acceptComment)}
                                disabled={isUpdating}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2"
                            >
                                Confirmer la validation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
