import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, ExternalLink, PlayCircle, FileText, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// OBS: Vi använder direkt fetch här för material då det var så i din gamla kod,
// men i framtiden bör detta flyttas till api.js
import { api } from '../../services/api';

export const CourseContentModuleMetadata = {
    id: 'core_content',
    name: 'Course Content',
    version: '1.0.0',
    description: 'Kärnmodul för att hantera kursmaterial, länkar och filer.',
    icon: BookOpen,
    settingsKey: null, // Core-modul, går ej att stänga av
    isCore: true,
    permissions: ['READ', 'WRITE']
};

const CourseContentModule = ({ courseId, isTeacher }) => {
    const { t } = useTranslation();

    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [readMaterials, setReadMaterials] = useState({});

    // Form States
    const [matTitle, setMatTitle] = useState('');
    const [matContent, setMatContent] = useState('');
    const [matLink, setMatLink] = useState('');
    const [matType, setMatType] = useState('TEXT');
    const [matFile, setMatFile] = useState(null);

    useEffect(() => {
        loadMaterials();
    }, [courseId]);

    const loadMaterials = async () => {
        setIsLoading(true);
        try {
            // Här använder vi din befintliga endpoint-struktur
            const res = await fetch(`http://127.0.0.1:8080/api/courses/${courseId}/materials`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                setMaterials(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMaterialSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("title", matTitle);
        fd.append("content", matContent);
        fd.append("link", matLink);
        fd.append("type", matType);
        if (matFile) fd.append("file", matFile);

        try {
            const res = await fetch(`http://127.0.0.1:8080/api/courses/${courseId}/materials`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: fd
            });

            if (res.ok) {
                loadMaterials(); // Ladda om listan
                // Rensa formulär
                setMatTitle(''); setMatContent(''); setMatLink(''); setMatFile(null);
                alert(t('messages.upload_success'));
            } else {
                alert(t('messages.upload_error'));
            }
        } catch (e) {
            alert(t('messages.upload_error'));
        }
    };

    const handleDeleteMaterial = async (mid) => {
        if (!window.confirm(t('common.delete') + "?")) return;
        try {
            await fetch(`http://127.0.0.1:8080/api/courses/materials/${mid}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setMaterials(materials.filter(m => m.id !== mid));
        } catch (e) {
            console.error(e);
        }
    };

    const toggleReadStatus = (mid) => {
        setReadMaterials(prev => ({ ...prev, [mid]: !prev[mid] }));
    };

    const getIcon = (t) => {
        switch (t) {
            case 'VIDEO': return <PlayCircle size={20} className="text-red-500" />;
            case 'LINK': return <ExternalLink size={20} className="text-blue-500" />;
            default: return <FileText size={20} className="text-gray-500" />;
        }
    };

    if (isLoading) return <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600"/></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
            {/* Vänster: Materiallista */}
            <div className="lg:col-span-2 space-y-4">
                {materials.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-[#131314] rounded-xl border border-dashed border-gray-300 dark:border-[#3c4043]">
                        <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">{t('course.no_material')}</p>
                    </div>
                ) : (
                    materials.map(m => (
                        <div key={m.id} className="bg-white dark:bg-[#1E1F20] p-5 rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] hover:shadow-md transition-shadow group">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className={`mt-1 p-2 rounded-lg ${readMaterials[m.id] ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                                        {getIcon(m.type)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{m.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">{m.content}</p>
                                        {m.link && (
                                            <a href={m.link} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline flex items-center gap-1">
                                                <ExternalLink size={14} /> {t('course.open_link')}
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleReadStatus(m.id)}
                                        className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${readMaterials[m.id] ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-[#3c4043] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#505357]'}`}
                                    >
                                        {readMaterials[m.id] ? t('course.read') : t('course.mark_read')}
                                    </button>
                                    {isTeacher && (
                                        <button onClick={() => handleDeleteMaterial(m.id)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Höger: Uppladdningsformulär (Endast lärare) */}
            {isTeacher && (
                <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-[#3c4043] h-fit sticky top-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                        <Plus size={18} /> {t('course.add_material')}
                    </h3>
                    <form onSubmit={handleMaterialSubmit} className="space-y-4">
                        <input
                            className="w-full border dark:border-[#3c4043] p-2 rounded-lg text-sm bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={t('course.title')}
                            value={matTitle}
                            onChange={e => setMatTitle(e.target.value)}
                            required
                        />
                        <textarea
                            className="w-full border dark:border-[#3c4043] p-2 rounded-lg text-sm bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={t('course.description')}
                            value={matContent}
                            onChange={e => setMatContent(e.target.value)}
                            rows={3}
                        />
                        <select
                            className="w-full border dark:border-[#3c4043] p-2 rounded-lg text-sm bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={matType}
                            onChange={e => setMatType(e.target.value)}
                        >
                            <option value="TEXT">{t('course.type_text')}</option>
                            <option value="VIDEO">{t('course.type_video')}</option>
                            <option value="LINK">{t('course.type_link')}</option>
                            <option value="FILE">{t('course.type_file')}</option>
                        </select>

                        {matType !== 'FILE' && (
                            <input
                                className="w-full border dark:border-[#3c4043] p-2 rounded-lg text-sm bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder={t('course.link')}
                                value={matLink}
                                onChange={e => setMatLink(e.target.value)}
                            />
                        )}

                        {matType === 'FILE' && (
                            <input
                                type="file"
                                className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900/30 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100"
                                onChange={e => setMatFile(e.target.files[0])}
                            />
                        )}

                        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none">
                            {t('course.upload')}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CourseContentModule;