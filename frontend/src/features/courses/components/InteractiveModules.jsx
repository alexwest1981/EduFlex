import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, Activity, Upload, Play, Trash2, FileText,
    AlertCircle, Loader2, Edit2, ChevronRight, Layers
} from 'lucide-react';
import { api } from '../../../services/api';
import { useAppContext } from '../../../context/AppContext';
import ScormPlayer from '../../scorm/ScormPlayer';
import Cmi5Player from '../../../components/player/Cmi5Player';
import { TrendingUp, X } from 'lucide-react';
import TeacherAnalytics from '../../analytics/TeacherAnalytics';

const InteractiveModules = ({ courseId, isTeacher, currentUser }) => {
    const navigate = useNavigate();
    const [scormPackages, setScormPackages] = useState([]);
    const [cmi5Packages, setCmi5Packages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [activeModule, setActiveModule] = useState(null); // { id, type, pkg }
    const [showAnalytics, setShowAnalytics] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [scormData, cmi5Data] = await Promise.all([
                api.scorm.getPackages(courseId),
                api.cmi5.getPackages(courseId)
            ]);
            setScormPackages(scormData || []);
            setCmi5Packages(cmi5Data || []);
        } catch (err) {
            console.error("Failed to fetch interactive modules", err);
            setError("Kunde inte hämta interaktiva moduler.");
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId) fetchData();
    }, [courseId, fetchData]);

    const handleUpload = async (e, type) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => {
            if (file.name.toLowerCase().endsWith('.zip')) {
                formData.append('files', file);
            }
        });

        if (formData.getAll('files').length === 0) {
            alert("Endast .zip-filer stöds.");
            return;
        }

        try {
            setUploading(true);
            setError(null);
            if (type === 'SCORM') {
                await api.scorm.upload(courseId, formData);
            } else {
                await api.cmi5.upload(courseId, formData);
            }
            await fetchData();
        } catch (err) {
            console.error(`${type} upload failed`, err);
            setError(`Uppladdning av ${type}-paket misslyckades.`);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (pkgId, type) => {
        if (!window.confirm(`Är du säker på att du vill ta bort detta ${type}-paket?`)) return;

        try {
            if (type === 'SCORM') {
                await api.scorm.delete(pkgId);
            } else {
                await api.cmi5.delete(pkgId);
            }
            await fetchData();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Kunde inte ta bort paketet.");
        }
    };

    const handleRename = async (pkg, type) => {
        const newTitle = window.prompt("Ange nytt namn på modulen:", pkg.title);
        if (!newTitle || newTitle === pkg.title) return;

        try {
            if (type === 'SCORM') {
                await api.scorm.update(pkg.id, { title: newTitle });
            } else {
                await api.cmi5.update(pkg.id, { title: newTitle });
            }
            await fetchData();
        } catch (err) {
            console.error("Rename failed", err);
            alert("Kunde inte uppdatera namnet.");
        }
    };

    const handleLaunch = (pkg, type) => {
        setActiveModule({ id: pkg.id, type, pkg });
    };

    // Combine and sort
    const allModules = [
        ...scormPackages.map(p => ({ ...p, type: 'SCORM' })),
        ...cmi5Packages.map(p => ({ ...p, type: 'cmi5' }))
    ].sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    if (loading) {
        return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Upload Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Layers className="text-indigo-600 dark:text-indigo-400" size={24} />
                        Interaktiva Moduler
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Hantera och spela SCORM 1.2 och cmi5 innehåll.
                    </p>
                </div>

                {isTeacher && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAnalytics(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 rounded-xl transition-colors font-bold text-sm"
                        >
                            <TrendingUp size={18} />
                            <span>Analys</span>
                        </button>
                        <div className="relative">
                            <input type="file" id="scorm-upload" className="hidden" accept=".zip" onChange={(e) => handleUpload(e, 'SCORM')} disabled={uploading} multiple />
                            <label htmlFor="scorm-upload" className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#282a2c] border border-gray-200 dark:border-[#3c4043] text-gray-700 dark:text-gray-300 rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-[#303336] transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <Package size={18} className="text-indigo-500" />
                                <span className="font-bold text-sm">Ladda upp SCORM</span>
                            </label>
                        </div>
                        <div className="relative">
                            <input type="file" id="cmi5-upload" className="hidden" accept=".zip" onChange={(e) => handleUpload(e, 'cmi5')} disabled={uploading} multiple />
                            <label htmlFor="cmi5-upload" className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Activity size={18} />}
                                <span className="font-bold text-sm">Ladda upp cmi5</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-900/30">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {allModules.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-[#1E1F20] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Layers size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Inga interaktiva moduler än.</p>
                    {isTeacher && <p className="text-sm text-gray-400 mt-2">Ladda upp ett paket för att komma igång.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {allModules.map(pkg => (
                        <div key={`${pkg.type}-${pkg.id}`} className="group bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-2xl p-5 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${pkg.type === 'SCORM'
                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                                    : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                    }`}>
                                    {pkg.type === 'SCORM' ? <Package size={28} /> : <Activity size={28} />}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {pkg.title || 'Namnlös modul'}
                                        </h4>
                                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${pkg.type === 'SCORM'
                                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                                            : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                            }`}>
                                            {pkg.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-[#282a2c] px-2 py-1 rounded-md">
                                            <FileText size={12} /> {(pkg.sizeBytes / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                        <span>•</span>
                                        <span className="italic">Uppladdad {new Date(pkg.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => handleLaunch(pkg, pkg.type)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-0.5"
                                >
                                    <Play size={16} fill="currentColor" /> Starta
                                </button>

                                {isTeacher && (
                                    <div className="flex gap-1">
                                        <button onClick={() => handleRename(pkg, pkg.type)} className="p-2.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all" title="Redigera">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(pkg.id, pkg.type)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Radera">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                                <ChevronRight size={20} className="text-gray-300 group-hover:translate-x-1 transition-transform hidden sm:block" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ANALYTICS MODAL */}
            {showAnalytics && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-[#1E1F20] z-10">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <TrendingUp className="text-indigo-500" />
                                Kursanalys (beta)
                            </h2>
                            <button
                                onClick={() => setShowAnalytics(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6">
                            <TeacherAnalytics courseId={courseId} />
                        </div>
                    </div>
                </div>
            )}

            {/* FULL SCREEN PLAYER MODAL */}
            {activeModule && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                    <div className="w-full h-full sm:h-[90vh] sm:w-[95vw] sm:max-w-7xl bg-white dark:bg-[#1e1e1e] sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {activeModule.type === 'SCORM' ? (
                            <ScormPlayer
                                packageId={activeModule.id}
                                onClose={() => setActiveModule(null)}
                            />
                        ) : (
                            <Cmi5Player
                                packageId={activeModule.pkg.packageId}
                                launchUrl={activeModule.pkg.launchUrl}
                                registration={activeModule.pkg.registration}
                                onClose={() => setActiveModule(null)}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveModules;
