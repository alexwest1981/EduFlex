import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  TrendingUp, 
  Filter, 
  ExternalLink,
  ChevronRight,
  Target,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const CareerDashboard = () => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [limit, setLimit] = useState(10);
    const [stats, setStats] = useState({
        total: 14520, // Mock for now
        trending: ['Frontend Utvecklare', 'UX Designer', 'Data Scientist']
    });
    const [userSkills, setUserSkills] = useState([]);
    const [matches, setMatches] = useState({}); // jobId -> matchData
    const [matchingJobs, setMatchingJobs] = useState(new Set()); // track which jobs are currently being matched
    const [selectedJob, setSelectedJob] = useState(null); // job for match details modal
    const [recommendations, setRecommendations] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);

    useEffect(() => {
        if (selectedJob && selectedJob.match?.missingRequiredSkills?.length > 0) {
            fetchRecommendations(selectedJob.match.missingRequiredSkills);
        } else {
            setRecommendations([]);
        }
    }, [selectedJob]);

    const fetchRecommendations = async (missingSkills) => {
        setLoadingRecs(true);
        try {
            const response = await api.career.getRecommendations(missingSkills);
            // Handle potential variations in API response structure
            setRecommendations(response?.data || response || []);
        } catch (err) {
            console.error("Failed to fetch recommendations", err);
            setRecommendations([]);
        } finally {
            setLoadingRecs(false);
        }
    };

    useEffect(() => {
        fetchUserSkills();
    }, []);

    const fetchUserSkills = async () => {
        try {
            const data = await api.skills.getGap();
            // Extract skill names for matching
            const skillNames = (data.skills || []).map(s => s.skillName);
            setUserSkills(skillNames);
        } catch (err) {
            console.error("Failed to fetch user skills", err);
        }
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        setMatches({}); // Clear old matches
        try {
            const data = await api.jobtech.search(searchQuery, limit);
            const hits = data.hits || [];
            setJobs(hits);
            
            // Trigger background matching for visible jobs if user has skills
            if (userSkills.length > 0) {
                hits.slice(0, 5).forEach(job => triggerMatch(job.id));
            }
        } catch (err) {
            console.error("Job search failed", err);
            setError(t('career.search_error'));
        } finally {
            setLoading(false);
        }
    };

    const triggerMatch = async (jobId) => {
        if (matches[jobId] || matchingJobs.has(jobId)) return;
        
        setMatchingJobs(prev => new Set(prev).add(jobId));
        try {
            const matchData = await api.jobtech.match(jobId, userSkills);
            setMatches(prev => ({ ...prev, [jobId]: matchData }));
        } catch (err) {
            console.error("Matching failed for job", jobId, err);
        } finally {
            setMatchingJobs(prev => {
                const next = new Set(prev);
                next.delete(jobId);
                return next;
            });
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2 text-blue-400 font-semibold tracking-wider uppercase text-xs">
                        <Sparkles className="w-4 h-4" />
                        {t('career.badge', 'JobEd Connect')}
                    </div>
                    <h1 className="text-4xl font-bold text-white">
                        {t('career.title', 'Karriär & Arbetsmarknad')}
                    </h1>
                    <p className="text-slate-400 max-w-xl text-lg">
                        {t('career.subtitle', 'Matcha dina utbildningsmål mot realtidsannonser från Arbetsförmedlingen.')}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col items-center">
                        <span className="text-2xl font-bold text-white">14.5k</span>
                        <span className="text-slate-400 text-xs uppercase tracking-tighter">Aktiva Jobb</span>
                    </div>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col items-center">
                        <span className="text-2xl font-bold text-blue-400">92%</span>
                        <span className="text-slate-400 text-xs uppercase tracking-tighter">Matchning</span>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-14 pr-32 py-5 bg-white border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-lg shadow-sm"
                    placeholder={t('career.search_placeholder', 'Sök efter yrke, färdighet eller företag...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    type="submit"
                    className="absolute inset-y-2 right-2 px-8 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                    {t('common.search', 'Sök')}
                </button>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Results Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-500" />
                            {t('jobed_results_label', { num: jobs.length || 0 })}
                        </h2>
                        <div className="flex gap-2">
                             <button className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-100">
                                <Filter className="w-4 h-4" />
                             </button>
                        </div>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            <div className="space-y-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-2xl w-full" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center bg-red-50 rounded-3xl border border-red-100">
                                <p className="text-red-600 font-medium">{error}</p>
                            </div>
                        ) : jobs.length > 0 ? (
                            <div className="space-y-4">
                                {jobs.map((job) => (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white border border-slate-100 p-6 rounded-2xl hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden"
                                    >
                                        {/* Match Score Badge */}
                                        {matches[job.id] ? (
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedJob({ ...job, match: matches[job.id] });
                                                }}
                                                className="absolute top-0 right-0 p-1 px-3 bg-blue-600 text-white text-[10px] font-bold rounded-bl-xl shadow-lg z-20 hover:bg-blue-700 transition-colors flex items-center gap-1 group/btn"
                                            >
                                                {matches[job.id].score}% {t('career.match_score', 'MATCH')}
                                                <ChevronRight className="w-2.5 h-2.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                            </button>
                                        ) : matchingJobs.has(job.id) ? (
                                            <div className="absolute top-0 right-0 p-1 px-3 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-bl-xl z-20 animate-pulse">
                                                {t('career.analyzing', 'ANALYZING...')}
                                            </div>
                                        ) : userSkills.length > 0 && (
                                            <button 
                                                onClick={() => triggerMatch(job.id)}
                                                className="absolute top-0 right-0 p-1 px-3 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-bl-xl hover:bg-blue-50 hover:text-blue-500 transition-colors z-20"
                                            >
                                                {t('career.calculate_match', 'CALCULATE MATCH')}
                                            </button>
                                        )}

                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                                                    {job.headline}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase className="w-3 h-3" />
                                                        {job.employer?.name || 'Okänt företag'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {job.workplace_address?.municipality || 'Sverige'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <a 
                                                    href={job.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {matches[job.id]?.matchedSkills?.map(skill => (
                                                <span key={skill} className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold border border-green-100">
                                                    ✓ {skill}
                                                </span>
                                            ))}
                                            {matches[job.id]?.missingRequiredSkills?.slice(0, 3).map(skill => (
                                                <span key={skill} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-semibold border border-amber-100">
                                                    ! {skill}
                                                </span>
                                            ))}
                                            {!matches[job.id] && job.occupation?.label && (
                                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                                                    {job.occupation.label}
                                                </span>
                                            )}
                                            {!matches[job.id] && job.must_have?.skills?.slice(0, 3).map(skill => (
                                                <span key={skill.label} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium">
                                                    {skill.label}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                                <div className="mx-auto w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
                                    <Search className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Inga jobb hittades</h3>
                                <p className="text-slate-500">Sök efter något för att se vad som finns på arbetsmarknaden just nu.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Trending Section */}
                    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-green-500" />
                                Hetast Just Nu
                            </h3>
                        </div>
                        <div className="space-y-2">
                            {stats.trending.map(item => (
                                <button
                                    key={item}
                                    onClick={() => { setSearchQuery(item); handleSearch(); }}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-slate-600 text-sm transition-colors border border-transparent hover:border-slate-100"
                                >
                                    {item}
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl shadow-blue-200 space-y-4 relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg">AI-matchning Aktiv</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Vi analyserar nu dina kurser och erfarenheter mot realtidsannonser för att hitta din perfekta matchning.
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full border border-white/10 uppercase tracking-tighter">
                                <CheckCircle2 className="w-3 h-3" />
                                {t('career.badge', 'JobEd Connect')} v2.0
                            </div>
                        </div>
                        {/* Abstract Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    </div>
                </div>
            </div>

            {/* Match Details Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedJob(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 leading-tight">{t('career.details', 'Matchningsdetaljer')}</h3>
                                        <p className="text-xs text-slate-500 font-medium truncate max-w-[300px]">{selectedJob.headline}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedJob(null)}
                                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Score Column */}
                                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                                        <div className="relative w-40 h-40">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="80"
                                                    cy="80"
                                                    r="70"
                                                    fill="transparent"
                                                    stroke="#f1f5f9"
                                                    strokeWidth="12"
                                                />
                                                <motion.circle
                                                    cx="80"
                                                    cy="80"
                                                    r="70"
                                                    fill="transparent"
                                                    stroke="#2563eb"
                                                    strokeWidth="12"
                                                    strokeDasharray={440}
                                                    initial={{ strokeDashoffset: 440 }}
                                                    animate={{ strokeDashoffset: 440 - (440 * selectedJob.match.score) / 100 }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-4xl font-black text-slate-900 leading-none">
                                                        {selectedJob.match.score}<span className="text-xl">%</span>
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('career.match_score', 'MATCH')}</span>
                                                </div>
                                            </div>
                                            {selectedJob.match.warning && (
                                                <div className="px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full flex items-center gap-2 animate-pulse mt-2">
                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                                                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">{selectedJob.match.warning}</span>
                                                </div>
                                            )}
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-900">{t('career.potential', 'Din potential')}</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed italic">
                                                {selectedJob.match.score > 80 ? "En perfekt match! Du har nästan alla färdigheter som krävs." : 
                                                 selectedJob.match.score > 50 ? "Du är en stark kandidat, men har några luckor att fylla." : 
                                                 "Det här jobbet kräver några nya färdigheter, men vi kan hjälpa dig dit!"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Skills Column */}
                                    <div className="space-y-6">
                                        {/* Matched Skills */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-green-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider tracking-tighter">{t('career.matched_skills', 'Matched Skills')}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.match.matchedSkills?.length > 0 ? (
                                                    selectedJob.match.matchedSkills.map(s => (
                                                        <span key={s} className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold border border-green-100">
                                                            {s}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-slate-400 italic">{t('career.no_matches', 'Inga direkta matchningar ännu.')}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Missing Skills */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-amber-600">
                                                <AlertCircle className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider tracking-tighter">{t('career.missing_skills', 'Missing Skills')}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.match.missingRequiredSkills?.length > 0 ? (
                                                    selectedJob.match.missingRequiredSkills.map(s => (
                                                        <span key={s} className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold border border-amber-100">
                                                            {s}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-slate-400 italic">{t('career.no_missing', 'Inga obligatoriska krav saknas!')}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Learning Paths / Recommendations */}
                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Target className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">{t('career.matchModal.learningPaths', 'Personliga lärstigar')}</span>
                                            </div>
                                            
                                            {loadingRecs ? (
                                                <div className="space-y-2">
                                                    {[1, 2].map(i => (
                                                        <div key={i} className="h-16 bg-slate-50 animate-pulse rounded-2xl w-full" />
                                                    ))}
                                                </div>
                                            ) : recommendations.length > 0 ? (
                                                <div className="space-y-3">
                                                    {recommendations.map(rec => (
                                                        <div key={rec.courseId} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 transition-all shadow-sm group/rec">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h5 className="font-bold text-slate-900 text-sm group-hover/rec:text-blue-600 transition-colors line-clamp-1">
                                                                    {rec.courseName}
                                                                </h5>
                                                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
                                                                    {Math.round(rec.relevanceScore * 100)}% {t('career.matchModal.relevance', 'Relevans')}
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mb-3">
                                                                {rec.matchedSkills?.slice(0, 3).map(skill => (
                                                                    <span key={skill} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <button 
                                                                className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                                onClick={() => window.location.href = `/courses/${rec.courseId}`}
                                                            >
                                                                {t('career.matchModal.enrollNow', 'Anmäl dig nu')}
                                                                <ArrowRight className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic">
                                                    {t('career.matchModal.noRecommendations', 'Inga specifika kurser hittades för dessa kompetenser ännu.')}
                                                </p>
                                            )}
                                        </div>

                                        {/* Info Box */}
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-3">
                                            <div className="p-2 bg-white rounded-xl text-blue-600 shadow-sm shrink-0 h-fit">
                                                <Info className="w-4 h-4" />
                                            </div>
                                            <p className="text-[11px] text-blue-800 leading-relaxed">
                                                {t('career.tip', 'Tips: Du kan minska dina gap genom att gå kurser inom')} <strong>{selectedJob.match.missingRequiredSkills?.[0] || t('career.relevant_areas', 'relevanta områden')}</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                <button 
                                    onClick={() => setSelectedJob(null)}
                                    className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
                                >
                                    {t('career.close', 'Stäng')}
                                </button>
                                <a 
                                    href={selectedJob.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 group"
                                >
                                    {t('career.apply', 'Sök tjänsten')}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CareerDashboard;
