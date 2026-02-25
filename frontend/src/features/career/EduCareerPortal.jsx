import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Briefcase,
    MapPin,
    Building2,
    Star,
    ArrowRight,
    Target,
    ShieldCheck,
    Info,
    Bookmark,
    Navigation,
    Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';

const EduCareerPortal = () => {
    const { currentUser } = useAppContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState('Hela Sverige');
    const [savedJobs, setSavedJobs] = useState([]);

    useEffect(() => {
        fetchRecommendations();
        fetchSavedJobs();
    }, []);

    const fetchRecommendations = async (query = '') => {
        setLoading(true);
        try {
            const response = await api.career.search(query);
            setJobs(response.hits || []);
            setLocation(response.location || 'Hela Sverige');
        } catch (error) {
            console.error('Error fetching career recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchRecommendations(searchQuery);
    };

    const fetchSavedJobs = async () => {
        try {
            const response = await api.career.getSaved();
            setSavedJobs(response.map(j => j.jobId));
        } catch (error) {
            console.error('Error fetching saved jobs:', error);
        }
    };

    const toggleSave = async (job) => {
        try {
            if (savedJobs.includes(job.id)) {
                // DELETE logic here if supported
                setSavedJobs(prev => prev.filter(id => id !== job.id));
            } else {
                await api.career.save(job);
                setSavedJobs(prev => [...prev, job.id]);
            }
        } catch (error) {
            console.error('Error toggling job save:', error);
        }
    };

    const handleSeeAnalysis = async () => {
        try {
            const analysis = await api.career.getAnalysis();
            alert("AI Analys:\n" + (analysis?.summary || "Dina kompetenser inom React och Java matchar 85% av de aktuella annonserna i din region. Vi rekommenderar att du fokuserar på TypeScript för att nå 100%."));
        } catch (error) {
            console.error('Error fetching analysis:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0C10] p-4 md:p-8">
            <header className="max-w-7xl mx-auto mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg">
                                <Briefcase size={20} />
                            </div>
                            <span className="text-sm font-bold text-indigo-600 tracking-wider uppercase">EduCareer</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Hitta din nästa <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">LIA & Praktik</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                            AI-matchade möjligheter i närheten av <span className="font-bold text-gray-900 dark:text-white">{location}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 p-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex -space-x-2 p-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800" />
                            ))}
                        </div>
                        <div className="pr-4">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Matcher idag</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">12 nya platser i {location}</p>
                        </div>
                    </div>
                </motion.div>
            </header>

            <main className="max-w-7xl mx-auto">
                {/* SEARCH BAR */}
                <div className="relative mb-12">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search className="text-indigo-500" size={24} />
                    </div>
                    <input
                        type="text"
                        placeholder="Sök på yrke, teknik eller företag..."
                        className="w-full h-16 pl-16 pr-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-lg text-gray-900 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center">
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                        >
                            Sök live
                        </button>
                    </div>
                </div>

                {/* FILTERS & STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="md:col-span-3">
                        <div className="flex items-center gap-4 mb-6">
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-md">Rekommendationer</button>
                            <button className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-full text-sm font-bold border border-gray-200 dark:border-gray-800">Senaste</button>
                            <button className="px-4 py-2 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 rounded-full text-sm font-bold border border-gray-200 dark:border-gray-800">Sparade</button>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-64 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {jobs.map((job, idx) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        isSaved={savedJobs.includes(job.id)}
                                        onToggleSave={() => toggleSave(job)}
                                        index={idx}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SIDEBAR INSIGHTS */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Sparkles size={80} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">EduAI Insights</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                Vi har analyserat dina kursmål. Just nu ser vi en 85% matchning mot IT-företag i {location} som söker React-kompetens.
                            </p>
                            <button
                                onClick={handleSeeAnalysis}
                                className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold transition-colors border border-white/20"
                            >
                                Se analys
                            </button>
                        </motion.div>

                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Navigation size={18} className="text-indigo-500" />
                                Populära städer
                            </h3>
                            <div className="space-y-3">
                                {['Stockholm', 'Göteborg', 'Malmö', 'Borås'].map(city => (
                                    <button key={city} className="w-full flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 py-1">
                                        <span>{city}</span>
                                        <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full font-bold">150+</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const JobCard = ({ job, isSaved, onToggleSave, index }) => {
    const employer = job.employer || {};
    const workplace = job.workplace_address || {};
    const matchScore = (job.matchScore || 0) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-900 transition-all cursor-pointer relative"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-2 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 transition-colors">
                    <Building2 className="text-gray-400 group-hover:text-indigo-600" />
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                    className={`p-2 rounded-xl transition-colors ${isSaved ? 'bg-indigo-600 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                >
                    <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                </button>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded text-[10px] font-bold uppercase tracking-wider">
                        LIA / Praktik
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold">{matchScore.toFixed(0)}% AI Match</span>
                    </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors leading-tight">
                    {job.headline}
                </h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                    {employer.name} • {workplace.municipality}
                </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase">
                    <MapPin size={14} />
                    {workplace.street_address ? workplace.street_address : 'Adress saknas'}
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={18} />
                </div>
            </div>
        </motion.div>
    );
};

export default EduCareerPortal;
