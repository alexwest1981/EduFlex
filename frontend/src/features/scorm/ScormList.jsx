import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { Package, Upload, Play, Trash2, FileText, AlertCircle, Loader2 } from 'lucide-react';

const ScormList = ({ courseId: propCourseId }) => {
    // If used as a tab in CourseDetail, courseId usually comes from URL, but can be passed as prop too
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
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.zip')) {
            alert("Endast .zip-filer stöds för SCORM-paket.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            setError(null);
            await api.scorm.upload(courseId, formData);
            await fetchPackages();
        } catch (err) {
            console.error("Upload failed", err);
            setError("Uppladdning misslyckades. Kontrollera att filen är en giltig SCORM-zip.");
        } finally {
            setUploading(false);
            // Clear input
            e.target.value = '';
        }
    };

    const handleLaunch = (pkg) => {
        // Construct URL. backend stores "scorm/uuid/". API requests go to /api...
        // Uploads are served at /uploads/*
        // We need the root URL + /uploads/ + pkg.directoryPath + pkg.launchFile

        // baseUrl logic:
        // API_BASE is usually "${window.location.origin}/api"
        // storageUrl seems to be "${window.location.origin}/uploads"

        const rootUrl = API_BASE.replace('/api', '');
        const launchUrl = `${rootUrl}/uploads/${pkg.directoryPath}${pkg.launchFile}`;

        window.open(launchUrl, '_blank', 'width=1024,height=768,resizable=yes,scrollbars=yes');
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="text-orange-500" size={24} />
                    Interaktiva Moduler (SCORM)
                </h3>

                {isTeacherOrAdmin && (
                    <div className="relative">
                        <input
                            type="file"
                            id="scorm-upload"
                            className="hidden"
                            accept=".zip"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                        <label
                            htmlFor="scorm-upload"
                            className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            <span className="font-bold text-sm">Ladda upp Paket</span>
                        </label>
                    </div>
                )}
            </div>

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
                    {isTeacherOrAdmin && <p className="text-xs text-gray-400 mt-1">Ladda upp en .zip-fil för att komma igång.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {packages.map(pkg => (
                        <div key={pkg.id} className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-2xl p-5 hover:shadow-md transition-shadow flex justify-between items-center">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                                    <Package size={24} />
                                </div>
                                <div>
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
                                {/* Admin Delete - Placeholder action */}
                                {isTeacherOrAdmin && (
                                    <button
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Ta bort (Ej implementerad)"
                                    >
                                        <Trash2 size={18} />
                                    </button>
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
