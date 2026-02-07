import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppContext } from '../../context/AppContext';
import { Package, Upload, Play, Trash2, FileText, AlertCircle, Loader2, Activity, Edit2 } from 'lucide-react';
import Cmi5Player from '../../components/player/Cmi5Player';

const Cmi5List = ({ courseId: propCourseId }) => {
    // ... lines 9-36 ...
    const { id } = useParams();
    const courseId = propCourseId || id;

    const { currentUser } = useAppContext();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [activePackage, setActivePackage] = useState(null);

    const isTeacherOrAdmin = currentUser?.role === 'TEACHER' || currentUser?.role === 'ADMIN';

    useEffect(() => {
        if (courseId) fetchPackages();
    }, [courseId]);

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const data = await api.cmi5.getByCourse(courseId);
            setPackages(data || []);
        } catch (err) {
            console.error("Failed to load CMI5 packages", err);
            setError("Kunde inte hämta CMI5-paket.");
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
            alert("Endast .zip-filer stöds för CMI5-paket.");
            return;
        }

        try {
            setUploading(true);
            setError(null);
            await api.cmi5.upload(courseId, formData);
            await fetchPackages();
        } catch (err) {
            console.error("Upload failed", err);
            setError("Uppladdning misslyckades. Kontrollera att filerna är giltiga CMI5-zips.");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleDelete = async (pkgId) => {
        if (!window.confirm("Är du säker på att du vill ta bort detta CMI5-paket?")) {
            return;
        }

        try {
            await api.cmi5.delete(pkgId);
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
            await api.cmi5.update(pkg.id, { title: newTitle });
            await fetchPackages();
        } catch (err) {
            console.error("Rename failed", err);
            alert("Kunde inte uppdatera namnet.");
        }
    };

    const handleLaunch = (pkg) => {
        setActivePackage(pkg);
    };

    if (activePackage) {
        // ... (existing player view) ...
        return (
            <div className="space-y-4 h-full flex flex-col">
                <div className="flex justify-between items-center bg-gray-50 dark:bg-[#282a2c] p-4 rounded-xl">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="text-blue-500" size={20} />
                        {activePackage.title}
                    </h3>
                    <button
                        onClick={() => setActivePackage(null)}
                        className="text-sm text-gray-500 hover:text-indigo-600 font-bold"
                    >
                        Stäng Spelare
                    </button>
                </div>
                <div className="flex-grow min-h-[750px] lg:h-[800px] border border-gray-200 dark:border-[#3c4043] rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-[#1e1e1e]">
                    <Cmi5Player
                        packageId={activePackage.packageId}
                        launchUrl={activePackage.launchUrl}
                        registration={activePackage.registration}
                        actor={{
                            objectType: "Agent",
                            name: currentUser.fullName,
                            mbox: `mailto:${currentUser.email}`,
                            account: {
                                homePage: window.location.origin,
                                name: currentUser.username || currentUser.email
                            }
                        }}
                    />
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="text-blue-500" size={24} />
                    CMI5 Moduler (xAPI-spårning)
                </h3>

                {isTeacherOrAdmin && (
                    <div className="relative">
                        <input
                            type="file"
                            id="cmi5-upload"
                            className="hidden"
                            accept=".zip"
                            onChange={handleUpload}
                            disabled={uploading}
                            multiple
                        />
                        <label
                            htmlFor="cmi5-upload"
                            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            <span className="font-bold text-sm">Ladda upp CMI5</span>
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
                    <Activity size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Inga CMI5-moduler uppladdade än.</p>
                    {isTeacherOrAdmin && <p className="text-xs text-gray-400 mt-1">Ladda upp en eller flera cmi5-zips för att testa xAPI-spårning.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {packages.map(pkg => (
                        <div key={pkg.id} className="bg-white dark:bg-[#1E1F20] border border-gray-200 dark:border-[#3c4043] rounded-2xl p-5 hover:shadow-md transition-shadow flex justify-between items-center">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Activity size={24} />
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

export default Cmi5List;
