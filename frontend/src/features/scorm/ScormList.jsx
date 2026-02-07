import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { Package, Upload, Play, Trash2, FileText, AlertCircle, Loader2, Edit2, TrendingUp, X } from 'lucide-react';
import TeacherAnalytics from '../analytics/TeacherAnalytics';

const ScormList = ({ courseId: propCourseId }) => {
    // ... lines 8-36 ...
    const { id } = useParams();
    const courseId = propCourseId || id;

    const { currentUser, API_BASE } = useAppContext();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';

    useEffect(() => {
        if (courseId) fetchPackages();
    }, [courseId]);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const data = await api.scorm.getByCourse(courseId);
            setPackages(data || []);
        } catch (err) {
            console.error("Failed to load SCORM packages", err);
            setError("Kunde inte hämta SCORM-paket.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const formData = new FormData();
        files.forEach(file => {
            if (file.name.toLowerCase().endsWith('.zip')) {
                formData.append('files', file);
            }
        });

        if (formData.getAll('files').length === 0) {
            alert("Endast .zip-filer stöds för SCORM-paket.");
            return;
        }

        try {
            setUploading(true);
            setError(null);
            await api.scorm.upload(courseId, formData);
            await fetchPackages();
        } catch (err) {
            console.error("Upload failed", err);
            setError("Uppladdning misslyckades. Kontrollera att filerna är giltiga SCORM-zips.");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (pkgId) => {
        if (!window.confirm("Är du säker på att du vill ta bort detta paket? All data och framsteg kommer att försvinna.")) {
            return;
        }

        try {
            await api.scorm.delete(pkgId);
            await fetchPackages();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Kunde inte ta bort paketet.");
        }
    };

    const handleEdit = async (pkg) => {
        const newTitle = window.prompt("Ange nytt namn på modulen:", pkg.title);
        if (!newTitle || newTitle === pkg.title) return;

        try {
            await api.scorm.update(pkg.id, { title: newTitle });
            await fetchPackages();
        } catch (err) {
            console.error("Rename failed", err);
            alert("Kunde inte uppdatera namnet.");
        }
    };

    const handleLaunch = (pkg) => {
        const rootUrl = API_BASE.replace('/api', '');
        const launchUrl = `${rootUrl}/uploads/${pkg.directoryPath}${pkg.launchFile}`;
        window.open(launchUrl, '_blank', 'width=1024,height=768,resizable=yes,scrollbars=yes');
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
    }

    const [showAnalytics, setShowAnalytics] = useState(false);

    // ... (existing helper functions)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="text-orange-500" size={24} />
                    Interaktiva Moduler (SCORM / cmi5)
                </h3>

                {isTeacherOrAdmin && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowAnalytics(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 rounded-xl transition-colors font-bold text-sm"
                        >
                            <TrendingUp size={18} />
                            <span>Analys</span>
                        </button>

                        <div className="relative">
                            <input
                                type="file"
                                id="scorm-upload"
                                className="hidden"
                                accept=".zip"
                                onChange={handleUpload}
                                disabled={uploading}
                                multiple
                            />
                            <label
                                htmlFor="scorm-upload"
                                className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                <span className="font-bold text-sm">Ladda upp Paket</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Analytics Modal */}
            {showAnalytics && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1E1F20] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700">
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

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {packages.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-[#1E1F20] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Package size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Inga moduler uppladdade än.</p>
                    {isTeacherOrAdmin && <p className="text-xs text-gray-400 mt-1">Ladda upp en eller flera .zip-filer för att komma igång.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {packages.map(pkg => (
                        <div key={pkg.id} className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-2xl p-5 hover:shadow-md transition-shadow flex justify-between items-center">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                                    <Package size={24} />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">{pkg.title || 'Namnlös modul'}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1"><FileText size={12} /> {(pkg.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                                        <span>•</span>
                                        <span>{new Date(pkg.uploadedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleLaunch(pkg)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors"
                                >
                                    <Play size={16} /> Starta
                                </button>
                                {isTeacherOrAdmin && (
                                    <>
                                        <button
                                            onClick={() => handleEdit(pkg)}
                                            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                            title="Ändra namn"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(pkg.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Ta bort"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScormList;
