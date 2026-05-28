import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Clock, MapPin, GraduationCap, Calendar, CheckCircle2, ChevronLeft, Users, BookOpen, X, Upload, FileText, ArrowRight, Check, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export function FormationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState(1);

    // Step 1: Profil
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [cin, setCin] = React.useState('');

    // Step 2: Pédagogie
    const [lastDegree, setLastDegree] = React.useState('');
    const [origEtab, setOrigEtab] = React.useState('');
    const [gradYear, setGradYear] = React.useState('');

    // Step 3: Uploads & Motivation
    const [motivation, setMotivation] = React.useState('');
    const [cvFile, setCvFile] = React.useState<File | null>(null);
    const [diplomeFile, setDiplomeFile] = React.useState<File | null>(null);
    const [isUploadingCv, setIsUploadingCv] = React.useState(false);
    const [isUploadingDiplome, setIsUploadingDiplome] = React.useState(false);

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
    const [globalError, setGlobalError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    React.useEffect(() => {
        if (user) {
            setFirstName((user as any).first_name || '');
            setLastName((user as any).last_name || '');
            // L'email doit être vide par défaut selon la demande
        }
    }, [user]);

    // Mock data for demonstration
    const formation = {
        id: id || 1,
        title: "Master en Ingénierie des Systèmes d'Information",
        status: "Ouvert",
        etablissement: "École Nationale des Sciences Appliquées",
        niveau: "Master",
        domaine: "Informatique",
        dateDebut: "Septembre 2026",
        duree: "2 ans (4 semestres)",
        placesTotal: 30,
        placesRestantes: 12,
        prix: "45 000 MAD / an",
        description: "Ce Master forme des cadres de haut niveau capables de concevoir, développer et gérer des systèmes d'information complexes.",
        prerequis: [
            "Licence en Informatique ou diplôme équivalent",
            "Bon niveau en programmation",
            "Bases de données relationnelles"
        ],
        objectifs: [
            "Maîtriser les architectures logicielles distribuées",
            "Piloter des projets informatiques d'envergure",
            "Sécuriser les systèmes d'information",
            "S'intégrer dans une démarche DevOps"
        ]
    };

    const validateStep = (step: number) => {
        const errors: Record<string, string> = {};
        if (step === 1) {
            if (!firstName) errors.firstName = 'Le prénom est requis.';
            if (!lastName) errors.lastName = 'Le nom est requis.';
            if (!email) errors.email = 'L\'email est requis.';
            if (!phone) errors.phone = 'Le numéro de téléphone est requis.';
            if (!cin) errors.cin = 'Le numéro de CIN est requis.';
        } else if (step === 2) {
            if (!lastDegree) errors.lastDegree = 'Le dernier diplôme est requis.';
            if (!origEtab) errors.origEtab = 'L\'établissement d\'origine est requis.';
            if (!gradYear) errors.gradYear = 'L\'année d\'obtention est requise.';
        } else if (step === 3) {
            if (!cvFile) errors.cvFile = 'Le CV est requis.';
            else if (cvFile.size > 5 * 1024 * 1024) errors.cvFile = '5 Mo maximum.';

            if (!diplomeFile) errors.diplomeFile = 'Le diplôme est requis.';
            else if (diplomeFile.size > 5 * 1024 * 1024) errors.diplomeFile = '5 Mo maximum.';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const isStepValid = (step: number) => {
        if (step === 1) return !!(firstName && lastName && email && phone && cin);
        if (step === 2) return !!(lastDegree && origEtab && gradYear);
        if (step === 3) return !!(cvFile && diplomeFile && !isUploadingCv && !isUploadingDiplome);
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(s => s + 1);
            setGlobalError('');
        }
    };

    const prevStep = () => setCurrentStep(s => s - 1);

    const processFileUpload = (file: File, type: 'cv' | 'diplome') => {
        if (type === 'cv') {
            setIsUploadingCv(true);
            setTimeout(() => {
                setCvFile(file);
                setIsUploadingCv(false);
                setFieldErrors(prev => ({ ...prev, global: '' }));
            }, 1500);
        } else {
            setIsUploadingDiplome(true);
            setTimeout(() => {
                setDiplomeFile(file);
                setIsUploadingDiplome(false);
                setFieldErrors(prev => ({ ...prev, global: '' }));
            }, 1500);
        }
    };

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, type: 'cv' | 'diplome') => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFileUpload(file, type);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'cv' | 'diplome') => {
        const file = e.target.files?.[0];
        if (file) {
            processFileUpload(file, type);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return; // double check Before API

        setGlobalError('');
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('course', formation.id.toString());
            if (cvFile) formData.append('cv_file', cvFile);
            if (diplomeFile) formData.append('diplome_file', diplomeFile);

            const documentsData = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                cin: cin,
                dernier_diplome: lastDegree,
                etablissement_origine: origEtab,
                annee_obtention: gradYear,
                motivation: motivation
            };
            formData.append('documents', JSON.stringify(documentsData));

            await api.post('/enrollments/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(true);
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(false);
                setCurrentStep(1); // reset for next time
                navigate('/dashboard/mes-candidatures');
            }, 2000);

        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 400 || err.response?.status === 422) {
                const data = err.response.data;
                const fieldErr: Record<string, string> = {};
                let hasGlobalError = false;

                if (Array.isArray(data)) {
                    // Les erreurs globales du backend (ex: Vous êtes déjà inscrit)
                    setGlobalError(data[0]);
                    hasGlobalError = true;
                } else if (typeof data === 'object') {
                    for (const [key, val] of Object.entries(data)) {
                        const errorMsg = Array.isArray(val) ? val[0] : (val as string);

                        // Mappage des clés du backend vers l'état du frontend
                        if (key === 'non_field_errors' || key === 'course') {
                            setGlobalError(errorMsg);
                            hasGlobalError = true;
                        } else if (key === 'cv_file') {
                            fieldErr.cvFile = errorMsg;
                        } else if (key === 'diplome_file') {
                            fieldErr.diplomeFile = errorMsg;
                        } else {
                            fieldErr[key] = errorMsg; // Par défaut (first_name, last_name, etc.)
                        }
                    }
                    setFieldErrors(fieldErr);

                    if (!hasGlobalError && Object.keys(fieldErr).length > 0) {
                        setGlobalError("Certaines informations de votre dossier sont invalides. Veuillez vérifier les champs ci-dessous.");
                    }
                } else {
                    setGlobalError('Erreur de validation des données.');
                }
            } else {
                setGlobalError("Impossible de se connecter au serveur ou erreur inconnue.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 pb-12 relative">
            {/* Back Button */}
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
                <Link to="/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Retour au catalogue
                </Link>
            </div>

            {/* Hero Banner */}
            <div className="relative bg-slate-900 text-white min-h-[400px] flex items-center">
                <div
                    className="absolute inset-0 bg-cover bg-center z-0 opacity-40 mix-blend-overlay"
                    style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop")' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent z-0" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-0" />

                <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 w-full py-12">
                    <div className="max-w-3xl">
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${formation.status === 'Ouvert' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                }`}>
                                {formation.status === 'Ouvert' && <span className="h-2 w-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />}
                                Inscriptions: {formation.status}
                            </span>
                            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-white/10 text-white backdrop-blur-sm border border-white/20">
                                {formation.niveau}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 font-heading leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200">
                            {formation.title}
                        </h1>

                        <div className="flex flex-col sm:flex-row flex-wrap gap-6 text-slate-300 text-sm md:text-base">
                            <div className="flex items-center">
                                <MapPin className="mr-2 h-5 w-5 text-emerald-400" />
                                {formation.etablissement}
                            </div>
                            <div className="flex items-center">
                                <GraduationCap className="mr-2 h-5 w-5 text-emerald-400" />
                                {formation.domaine}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 mt-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Left Column (Details) */}
                    <div className="w-full lg:w-2/3 space-y-8">
                        <section className="bg-white dark:bg-slate-900 rounded-[12px] p-6 md:p-8 subtle-shadow border border-slate-100 dark:border-slate-800">
                            <h2 className="text-2xl font-bold mb-4 font-heading text-slate-900 dark:text-white flex items-center">
                                <BookOpen className="mr-3 h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                                Présentation du programme
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                {formation.description}
                            </p>
                        </section>

                        <div className="grid md:grid-cols-2 gap-8">
                            <section className="bg-white dark:bg-slate-900 rounded-[12px] p-6 md:p-8 subtle-shadow border border-slate-100 dark:border-slate-800">
                                <h3 className="text-xl font-bold mb-4 font-heading text-slate-900 dark:text-white">Objectifs</h3>
                                <ul className="space-y-3">
                                    {formation.objectifs.map((obj, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500 mr-3 shrink-0 mt-0.5" />
                                            <span className="text-slate-600 dark:text-slate-300">{obj}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-[12px] p-6 md:p-8 border border-emerald-100 dark:border-emerald-900/30">
                                <h3 className="text-xl font-bold mb-4 font-heading text-emerald-900 dark:text-emerald-400">Prérequis d'admission</h3>
                                <ul className="space-y-3 list-disc list-inside text-slate-700 dark:text-slate-300 marker:text-emerald-500">
                                    {formation.prerequis.map((req, idx) => (
                                        <li key={idx} className="pl-2">{req}</li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>

                    {/* Right Column (Floating Sticky Sidebar) */}
                    <div className="w-full lg:w-1/3 border border-slate-200 dark:border-slate-800 p-6 rounded-[12px] bg-white dark:bg-slate-900 subtle-shadow lg:sticky lg:top-24">
                        <h3 className="text-xl font-bold mb-6 font-heading border-b border-slate-100 dark:border-slate-800 pb-4 text-slate-900 dark:text-white">Informations Clés</h3>

                        <div className="space-y-5 mb-8">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mr-4 shrink-0 text-slate-600 dark:text-slate-300">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Date de début</p>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formation.dateDebut}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mr-4 shrink-0 text-slate-600 dark:text-slate-300">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Durée</p>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formation.duree}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mr-4 shrink-0 text-slate-600 dark:text-slate-300">
                                    <span className="font-bold text-lg">💰</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Frais de scolarité</p>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">{formation.prix}</p>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-4 shrink-0 text-emerald-600 dark:text-emerald-400">
                                    <Users className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Places disponibles</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">{formation.placesRestantes} / {formation.placesTotal}</p>
                                        <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500"
                                                style={{ width: `${(formation.placesTotal - formation.placesRestantes) / formation.placesTotal * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                fullWidth
                                size="lg"
                                onClick={() => setIsModalOpen(true)}
                                disabled={formation.status !== 'Ouvert'}
                                className={`text-base font-bold shadow-lg ${formation.status === 'Ouvert'
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                                    : 'bg-slate-200 text-slate-500 cursor-not-allowed border-none shadow-none dark:bg-slate-800 dark:text-slate-500'
                                    }`}
                            >
                                {formation.status === 'Ouvert' ? 'Postuler Maintenant' : 'Inscriptions Clôturées'}
                            </Button>
                            <p className="text-xs text-center text-slate-500 mt-4">
                                En postulant, vous acceptez les conditions générales d'admission.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Modal (Stepper) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-[8px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">

                        {/* Header & Close */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dossier de candidature</h2>
                            <button
                                onClick={() => !isSubmitting && !success && setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-[8px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {success ? (
                            <div className="p-12 text-center animate-in zoom-in duration-300 flex-grow">
                                <div className="h-20 w-20 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Candidature Soumise !</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Votre dossier pour <span className="font-semibold text-slate-800 dark:text-slate-200">{formation.title}</span> a bien été transmis.
                                </p>
                                <p className="text-sm text-slate-500 mt-4">Redirection vers vos candidatures...</p>
                            </div>
                        ) : (
                            <div className="p-6 flex-grow flex flex-col">
                                {/* Stepper Progress */}
                                <div className="mb-8">
                                    <div className="flex justify-between items-center relative">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 dark:bg-slate-800 z-0"></div>
                                        <div
                                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-300 z-0"
                                            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                                        ></div>

                                        {[1, 2, 3, 4].map(step => (
                                            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step < currentStep ? 'bg-emerald-600 border-emerald-600 text-white' :
                                                    step === currentStep ? 'bg-white dark:bg-slate-900 border-emerald-600 text-emerald-600' :
                                                        'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                                                    }`}>
                                                    {step < currentStep ? <Check className="h-4 w-4" /> : step}
                                                </div>
                                                <span className={`text-xs font-medium hidden sm:block ${step <= currentStep ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                    {step === 1 ? 'Profil' : step === 2 ? 'Parcours' : step === 3 ? 'Documents' : 'Aperçu'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {globalError && (
                                    <div className="mb-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-[8px] text-sm flex items-center gap-2">
                                        <XCircle className="h-5 w-5 shrink-0" />
                                        <span>{globalError}</span>
                                    </div>
                                )}

                                {/* Form Body */}
                                <div className="flex-grow">
                                    {/* STEP 1: PROFIL */}
                                    {currentStep === 1 && (
                                        <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2 dark:border-slate-800">1. Informations Personnelles</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prénom *</label>
                                                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                                                        className={`w-full h-11 px-4 rounded-[8px] bg-white border ${fieldErrors.firstName ? 'border-red-500' : 'border-slate-200'} text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow dark:bg-slate-900 dark:border-slate-700 dark:text-white`}
                                                    />
                                                    {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nom *</label>
                                                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                                                        className={`w-full h-11 px-4 rounded-[8px] bg-white border ${fieldErrors.lastName ? 'border-red-500' : 'border-slate-200'} text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow dark:bg-slate-900 dark:border-slate-700 dark:text-white`}
                                                    />
                                                    {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                                        className={`w-full h-11 px-4 rounded-[8px] bg-slate-50 border ${fieldErrors.email ? 'border-red-500' : 'border-slate-200'} text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow dark:bg-slate-800 dark:border-slate-700 dark:text-white`}
                                                    />
                                                    {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Téléphone *</label>
                                                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                                        className={`w-full h-11 px-4 rounded-[8px] bg-white border ${fieldErrors.phone ? 'border-red-500' : 'border-slate-200'} text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow dark:bg-slate-900 dark:border-slate-700 dark:text-white`}
                                                    />
                                                    {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CIN / Passeport *</label>
                                                <input type="text" value={cin} onChange={(e) => setCin(e.target.value)}
                                                    className={`w-full h-11 px-4 rounded-[8px] bg-white border ${fieldErrors.cin ? 'border-red-500' : 'border-slate-200'} text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow dark:bg-slate-900 dark:border-slate-700 dark:text-white`}
                                                />
                                                {fieldErrors.cin && <p className="text-red-500 text-xs mt-1">{fieldErrors.cin}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: PEDAGOGIE */}
                                    {currentStep === 2 && (
                                        <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-300">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 border-b pb-2 dark:border-slate-800">2. Parcours Académique</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dernier diplôme obtenu *</label>
                                                <input type="text" value={lastDegree} onChange={(e) => setLastDegree(e.target.value)} placeholder="ex: Licence Fondamentale en Informatique"
                                                    className={`w-full h-11 px-4 rounded-[8px] bg-white border ${fieldErrors.lastDegree ? 'border-red-500' : 'border-slate-200'} text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow dark:bg-slate-900 dark:border-slate-700 dark:text-white`}
                                                />
                                                {fieldErrors.lastDegree && <p className="text-red-500 text-xs mt-1">{fieldErrors.lastDegree}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Établissement d'origine *</label>
                                                <input type="text" value={origEtab} onChange={(e) => setOrigEtab(e.target.value)} placeholder="ex: FST Settat"
                                                    className={`w-full h-11 px-4 rounded-[8px] bg-white border ${fieldErrors.origEtab ? 'border-red-500' : 'border-slate-200'} text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow dark:bg-slate-900 dark:border-slate-700 dark:text-white`}
                                                />
                                                {fieldErrors.origEtab && <p className="text-red-500 text-xs mt-1">{fieldErrors.origEtab}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Année d'obtention *</label>
                                                <input type="number" min="1990" max="2030" value={gradYear} onChange={(e) => setGradYear(e.target.value)} placeholder="ex: 2023"
                                                    className={`w-full h-11 px-4 rounded-[8px] bg-white border ${fieldErrors.gradYear ? 'border-red-500' : 'border-slate-200'} text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow dark:bg-slate-900 dark:border-slate-700 dark:text-white`}
                                                />
                                                {fieldErrors.gradYear && <p className="text-red-500 text-xs mt-1">{fieldErrors.gradYear}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: UPLOAD */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2 border-b pb-2 dark:border-slate-800">3. Pièces Jointes & Motivation</h3>

                                            {/* Dropzone CV */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Curriculum Vitae (CV) * <span className="text-xs text-slate-400 font-normal">PDF/Word, max 5Mo</span></label>
                                                <div
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => handleFileDrop(e, 'cv')}
                                                    className={`relative border-2 border-dashed rounded-[8px] p-6 text-center transition-colors group cursor-pointer ${fieldErrors.cvFile ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                                >
                                                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileSelect(e, 'cv')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                    {isUploadingCv ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="h-10 w-10 flex items-center justify-center mb-2">
                                                                <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                                            </div>
                                                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Téléchargement en cours...</p>
                                                        </div>
                                                    ) : cvFile ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[250px]">{cvFile.name}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <Upload className="h-8 w-8 text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors" />
                                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Glissez-déposez ou cliquez ici</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {fieldErrors.cvFile && <p className="text-red-500 text-xs mt-1">{fieldErrors.cvFile}</p>}
                                            </div>

                                            {/* Dropzone Diplôme */}
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dernier Diplôme * <span className="text-xs text-slate-400 font-normal">PDF/Word/Images, max 5Mo</span></label>
                                                <div
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={(e) => handleFileDrop(e, 'diplome')}
                                                    className={`relative border-2 border-dashed rounded-[8px] p-6 text-center transition-colors group cursor-pointer ${fieldErrors.diplomeFile ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                                >
                                                    <input type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => handleFileSelect(e, 'diplome')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                                    {isUploadingDiplome ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="h-10 w-10 flex items-center justify-center mb-2">
                                                                <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                                            </div>
                                                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Téléchargement en cours...</p>
                                                        </div>
                                                    ) : diplomeFile ? (
                                                        <div className="flex flex-col items-center">
                                                            <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[250px]">{diplomeFile.name}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <Upload className="h-8 w-8 text-slate-400 mb-2 group-hover:text-emerald-500 transition-colors" />
                                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Glissez-déposez ou cliquez ici</p>
                                                        </div>
                                                    )}
                                                </div>
                                                {fieldErrors.diplomeFile && <p className="text-red-500 text-xs mt-1">{fieldErrors.diplomeFile}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lettre de motivation (Optionnelle)</label>
                                                <textarea rows={3} value={motivation} onChange={(e) => setMotivation(e.target.value)}
                                                    className="w-full p-4 rounded-[8px] bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                                                    placeholder="Pourquoi postulez-vous ?"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4: REVIEW */}
                                    {currentStep === 4 && (
                                        <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b pb-4 dark:border-slate-800">
                                                4. Aperçu de votre dossier
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Informations personnelles */}
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Informations personnelles</h4>
                                                    </div>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-slate-500 dark:text-slate-400">Nom complet</span>
                                                            <span className="font-medium text-slate-900 dark:text-white">{firstName} {lastName.toUpperCase()}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-slate-500 dark:text-slate-400">CIN / Passeport</span>
                                                            <span className="font-medium text-slate-900 dark:text-white">{cin}</span>
                                                        </div>
                                                        <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                                            <span className="text-slate-500 dark:text-slate-400">Email</span>
                                                            <span className="font-medium text-slate-900 dark:text-white">{email}</span>
                                                        </div>
                                                        <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                                            <span className="text-slate-500 dark:text-slate-400">Téléphone</span>
                                                            <span className="font-medium text-slate-900 dark:text-white">{phone}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Parcours académique */}
                                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Parcours académique</h4>
                                                    </div>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-slate-500 dark:text-slate-400">Dernier diplôme</span>
                                                            <span className="font-medium text-slate-900 dark:text-white">{lastDegree}</span>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-slate-500 dark:text-slate-400">Établissement</span>
                                                            <span className="font-medium text-slate-900 dark:text-white">{origEtab}</span>
                                                        </div>
                                                        <div className="flex justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                            <span className="text-slate-500 dark:text-slate-400">Année d'obtention</span>
                                                            <span className="font-medium text-slate-900 dark:text-white">{gradYear}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Documents */}
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200">Documents joints</h4>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                                                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-md shrink-0">
                                                            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-0.5">CV</p>
                                                            <p className="font-medium text-slate-900 dark:text-white truncate">{cvFile?.name || 'Non fourni'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                                                        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-md shrink-0">
                                                            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-0.5">Diplôme</p>
                                                            <p className="font-medium text-slate-900 dark:text-white truncate">{diplomeFile?.name || 'Non fourni'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Statut / Avertissement */}
                                            <div className="flex items-start gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-xl">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                                <div className="text-sm text-emerald-800 dark:text-emerald-300">
                                                    <p className="font-medium mb-1">Prêt pour la soumission</p>
                                                    <p className="text-emerald-600/80 dark:text-emerald-400/80">
                                                        Veuillez vérifier vos informations avant de confirmer l'envoi. Une fois validé, votre dossier passera à l'état "Soumis" et sera examiné par notre équipe.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    {currentStep > 1 ? (
                                        <Button variant="outline" onClick={prevStep} disabled={isSubmitting} className="rounded-[8px] dark:border-slate-700 dark:text-slate-300">
                                            <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                                        </Button>
                                    ) : (
                                        <div></div> // Spacer
                                    )}

                                    {currentStep < 4 ? (
                                        <Button onClick={nextStep} disabled={!isStepValid(currentStep)} className="rounded-[8px] bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                                            Suivant <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]">
                                            {isSubmitting ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Envoi...
                                                </div>
                                            ) : (
                                                <>Soumettre <Check className="h-4 w-4 ml-2" /></>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
