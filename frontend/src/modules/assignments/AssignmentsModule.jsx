import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertCircle, Plus, ChevronDown, ChevronUp, Download, Trash2, Edit2, Paperclip, Link as LinkIcon, Youtube, Zap, Trophy, Timer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';
import { useGamification } from '../../context/GamificationContext';
import XPBoostIndicator from '../../components/gamification/XPBoostIndicator';

export const AssignmentsModuleMetadata = {
    id: 'SUBMISSIONS',
    key: 'assignments',
    name: 'Inlämningar',
    icon: FileText,
    settingsKey: 'module_assignments_enabled'
};

const AssignmentsModule = ({ courseId, currentUser, isTeacher, mode = 'COURSE' }) => {
    const { t } = useTranslation();
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submissionsMap, setSubmissionsMap] = useState({}); // Håller status för studentens inlämningar
    const { isEnabled, xpMultiplierMax, isTimeBonusEnabled, isLeaderboardsEnabled } = useGamification();

    // UI States
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [expandedAssignment, setExpandedAssignment] = useState(null);

    // Form Data
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null); // För editering
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        dueDate: '',
        xpReward: 100,
        xpMultiplier: 1.0,
        timeBonusMinutes: 0,
        timeBonusXp: 0,
        showOnLeaderboard: true
    });
    const [attachments, setAttachments] = useState([]); // { type: 'FILE'|'LINK'|'YOUTUBE', file: File, url: '', title: '' }

    useEffect(() => {
        loadAssignments();
    }, [courseId, mode]);

    const loadAssignments = async () => {
        setIsLoading(true);
        try {
            let data;
            if (mode === 'GLOBAL') {
                data = await api.assignments.getMy(currentUser.id);
            } else {
                data = await api.assignments.getByCourse(courseId);
            }
            setAssignments(data || []);

            // Om student: Hämta status för alla uppgifter direkt
            if (!isTeacher && data && data.length > 0) {
                const subMap = {};
                await Promise.all(data.map(async (assign) => {
                    try {
                        const sub = await api.assignments.getMySubmission(assign.id, currentUser.id);
                        if (sub) subMap[assign.id] = sub;
                    } catch (e) { /* Ingen inlämning än */ }
                }));
                setSubmissionsMap(subMap);
            }

            // --- AUTO SELECT ITEM FROM URL ---
            const query = new URLSearchParams(window.location.search);
            const itemId = query.get('itemId');
            if (itemId && data) {
                const foundAssign = data.find(a => String(a.id) === itemId);
                if (foundAssign) {
                    setExpandedAssignment(foundAssign.id);
                    // Add a small delay to allow the list to render before scrolling
                    setTimeout(() => {
                        const element = document.getElementById(`assignment-card-${itemId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }, 500);
                }
            }

        } catch (e) {
            console.error("Failed to load assignments", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            let createdAssign;

            if (selectedAssignmentId) {
                // UPDATE
                createdAssign = await api.assignments.update(selectedAssignmentId, newAssignment);
            } else {
                // CREATE
                if (mode === 'GLOBAL') {
                    createdAssign = await api.assignments.createGlobal(currentUser.id, newAssignment);
                } else {
                    createdAssign = await api.assignments.create(courseId, currentUser.id, newAssignment);
                }
            }

            // Upload Attachments (ONLY NEW ONES FOR NOW, OLD ONES REMAIN)
            for (const att of attachments) {
                if (att.type === 'FILE' && att.file) {
                    const fd = new FormData();
                    fd.append('file', att.file);
                    await api.assignments.addAttachmentFile(createdAssign.id, fd);
                } else if ((att.type === 'LINK' || att.type === 'YOUTUBE') && !att.id) { // Only add if no ID (new)
                    await api.assignments.addAttachmentLink(createdAssign.id, {
                        title: att.title || att.url,
                        url: att.url,
                        type: att.type
                    });
                }
            }

            setShowCreateForm(false);
            setShowCreateForm(false);
            setNewAssignment({
                title: '',
                description: '',
                dueDate: '',
                xpReward: 100,
                xpMultiplier: 1.0,
                timeBonusMinutes: 0,
                timeBonusXp: 0,
                showOnLeaderboard: true
            });
            setAttachments([]);
            setSelectedAssignmentId(null);
            loadAssignments();
        } catch (e) {
            console.error(e);
            alert(t('assignments.error_save'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('assignments.confirm_delete'))) return;
        try {
            await api.assignments.delete(id);
            setAssignments(assignments.filter(a => a.id !== id));
        } catch (e) {
            alert(t('assignments.error_delete'));
        }
    };

    const handleEdit = (assignment) => {
        setNewAssignment({
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate,
            xpReward: assignment.xpReward || 100,
            xpMultiplier: assignment.xpMultiplier || 1.0,
            timeBonusMinutes: assignment.timeBonusMinutes || 0,
            timeBonusXp: assignment.timeBonusXp || 0,
            showOnLeaderboard: assignment.showOnLeaderboard !== false
        });
        // We don't populate attachments to state for deletion yet, but keeps them in DB.
        // If we want to support deleting old attachments during edit, we need more complex logic.
        // For now, let's keep it simple: Add new attachments.

        setSelectedAssignmentId(assignment.id);
        setShowCreateForm(true);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header / Skapa knapp */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('assignments.header')}</h2>
                {isTeacher && (
                    <button
                        onClick={() => {
                            setShowCreateForm(!showCreateForm);
                            if (!showCreateForm) {
                                setSelectedAssignmentId(null);
                                setSelectedAssignmentId(null);
                                setNewAssignment({
                                    title: '',
                                    description: '',
                                    dueDate: '',
                                    xpReward: 100,
                                    xpMultiplier: 1.0,
                                    timeBonusMinutes: 0,
                                    timeBonusXp: 0,
                                    showOnLeaderboard: true
                                });
                                setAttachments([]);
                            }
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"
                    >
                        {showCreateForm ? t('assignments.cancel') : <><Plus size={16} /> {t('assignments.new')}</>}
                    </button>
                )}
            </div>

            {/* Skapa Formulär (Endast lärare) */}
            {showCreateForm && (
                <div className="bg-gray-50 dark:bg-[#282a2c] p-6 rounded-xl border border-gray-200 dark:border-[#3c4043] mb-6 animate-in slide-in-from-top-2">
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-white">{selectedAssignmentId ? t('assignments.edit_header') : t('assignments.create_header')}</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input
                            placeholder={t('assignments.title_placeholder')}
                            className="w-full p-3 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                            value={newAssignment.title}
                            onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder={t('assignments.description_placeholder')}
                            className="w-full p-3 rounded-lg border h-32 dark:bg-[#131314] dark:border-[#3c4043] dark:text-white resize-none"
                            value={newAssignment.description}
                            onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                        />
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">{t('assignments.deadline_label')}</label>
                            <input
                                type="datetime-local"
                                className="p-3 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                value={newAssignment.dueDate}
                                onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                required
                            />
                        </div>

                        {/* GAMIFICATION SETTINGS */}
                        {isEnabled && (
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30 space-y-4">
                                <h4 className="font-bold text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                    <Zap size={16} /> Gamification-inställningar
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">{t('assignments.xp_multiplier')}</label>
                                        <select
                                            className="w-full p-2.5 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                            value={newAssignment.xpMultiplier}
                                            onChange={e => setNewAssignment({ ...newAssignment, xpMultiplier: parseFloat(e.target.value) })}
                                        >
                                            <option value="1.0">1.0x (Standard)</option>
                                            <option value="1.5">1.5x (Boost)</option>
                                            <option value="2.0">2.0x (Dubbel)</option>
                                            <option value="3.0">3.0x (Super)</option>
                                            <option value="5.0">5.0x (Ultra)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">{t('assignments.xp_reward')}</label>
                                        <input
                                            type="number"
                                            className="w-full p-2.5 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                            value={newAssignment.xpReward}
                                            onChange={e => setNewAssignment({ ...newAssignment, xpReward: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                {isTimeBonusEnabled && (
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-amber-100 dark:border-amber-900/30">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Timer size={12} /> {t('assignments.time_bonus_minutes')}</label>
                                            <input
                                                type="number"
                                                placeholder={`0 (${t('common.disabled') || 'inaktiverad'})`}
                                                className="w-full p-2.5 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                                value={newAssignment.timeBonusMinutes}
                                                onChange={e => setNewAssignment({ ...newAssignment, timeBonusMinutes: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 flex items-center gap-1"><Zap size={12} /> {t('assignments.time_bonus_xp')}</label>
                                            <input
                                                type="number"
                                                className="w-full p-2.5 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                                value={newAssignment.timeBonusXp}
                                                onChange={e => setNewAssignment({ ...newAssignment, timeBonusXp: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isLeaderboardsEnabled && (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={newAssignment.showOnLeaderboard}
                                            onChange={e => setNewAssignment({ ...newAssignment, showOnLeaderboard: e.target.checked })}
                                            className="rounded text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('assignments.show_on_leaderboard')}</span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* ATTACHMENTS SECTION */}
                        <div className="bg-white dark:bg-[#1E1F20] p-4 rounded-lg border border-gray-200 dark:border-[#3c4043]">
                            <h4 className="font-bold text-sm mb-3">{t('assignments.attachments_header')}</h4>
                            <div className="space-y-3 mb-4">
                                {attachments.map((att, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-[#131314] p-2 rounded text-sm">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {att.type === 'FILE' && <Paperclip size={14} />}
                                            {att.type === 'LINK' && <LinkIcon size={14} />}
                                            {att.type === 'YOUTUBE' && <Youtube size={14} />}
                                            <span className="truncate">{att.title || att.file?.name}</span>
                                        </div>
                                        <button type="button" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <label className="cursor-pointer bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-100">
                                    <Paperclip size={16} /> {t('assignments.upload_file')}
                                    <input type="file" className="hidden" onChange={e => {
                                        if (e.target.files[0]) setAttachments([...attachments, { type: 'FILE', file: e.target.files[0] }]);
                                    }} />
                                </label>
                                <button type="button" onClick={() => {
                                    const url = prompt(t('assignments.prompt_youtube') || "Ange URL till YouTube-video:");
                                    if (url) setAttachments([...attachments, { type: 'YOUTUBE', url, title: t('assignments.youtube_video') }]);
                                }} className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-100">
                                    <Youtube size={16} /> {t('assignments.youtube')}
                                </button>
                                <button type="button" onClick={() => {
                                    const url = prompt(t('assignments.prompt_link') || "Ange Länk URL:");
                                    const title = url ? prompt(t('assignments.prompt_title') || "Ange Titel (valfritt):") : null;
                                    if (url) setAttachments([...attachments, { type: 'LINK', url, title: title || url }]);
                                }} className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-100">
                                    <LinkIcon size={16} /> {t('assignments.link')}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                        >
                            {selectedAssignmentId ? t('assignments.save_changes') : t('assignments.publish')}
                        </button>
                    </form>
                </div>
            )}

            {/* Listning av uppgifter */}
            {assignments.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043]">
                    <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">{t('assignments.no_assignments')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assignments.map(assign => (
                        <AssignmentCard
                            key={assign.id}
                            id={`assignment-card-${assign.id}`}
                            assignment={assign}
                            isTeacher={isTeacher}
                            currentUser={currentUser}
                            expanded={expandedAssignment === assign.id}
                            toggleExpand={() => setExpandedAssignment(expandedAssignment === assign.id ? null : assign.id)}
                            preloadedSubmission={submissionsMap[assign.id]}
                            onUploadSuccess={() => loadAssignments()}
                            onDelete={() => handleDelete(assign.id)}
                            onEdit={() => handleEdit(assign)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENT: KORT FÖR VARJE UPPGIFT ---
const AssignmentCard = ({ id, assignment, isTeacher, currentUser, expanded, toggleExpand, preloadedSubmission, onUploadSuccess, onDelete, onEdit }) => {
    const [mySubmission, setMySubmission] = useState(preloadedSubmission);
    const [allSubmissions, setAllSubmissions] = useState([]); // Endast för lärare
    const [file, setFile] = useState(null); // För upload
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (preloadedSubmission) setMySubmission(preloadedSubmission);
    }, [preloadedSubmission]);

    // Ladda inlämningar när lärare öppnar kortet
    useEffect(() => {
        if (expanded && isTeacher) {
            api.assignments.getSubmissions(assignment.id).then(setAllSubmissions);
        }
    }, [expanded, isTeacher, assignment.id]);

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.assignments.submit(assignment.id, currentUser.id, formData);
            alert(t('assignments.submission_success'));
            setFile(null);
            if (onUploadSuccess) onUploadSuccess();
        } catch (e) {
            alert(t('assignments.error_submit'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleGrade = async (subId, grade) => {
        try {
            await api.assignments.grade(subId, grade, t('assignments.graded_by_teacher'));
            // Uppdatera listan lokalt
            setAllSubmissions(prev => prev.map(s => s.id === subId ? { ...s, grade } : s));
        } catch (e) {
            alert(t('assignments.error_grade'));
        }
    };

    return (
        <div id={id} className={`bg-white dark:bg-[#1E1F20] rounded-xl border ${expanded ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-gray-200 dark:border-[#3c4043]'} transition-all overflow-hidden`}>

            {/* Header Row */}
            <div onClick={toggleExpand} className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${expanded ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'} transition-colors`}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{assignment.title}</h4>
                        <p className={`text-xs flex items-center gap-1 mt-1 ${new Date(assignment.dueDate) < new Date() ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                            <Clock size={12} /> {t('assignments.deadline')}: {new Date(assignment.dueDate).toLocaleString()}
                        </p>
                        <div className="mt-2">
                            <XPBoostIndicator assignment={assignment} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* TEACHER ACTIONS */}
                    {isTeacher && (
                        <div className="flex items-center gap-1 mr-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title={t('common.delete') || 'Ta bort'}
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(); }}
                                className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                title={t('common.edit') || 'Redigera'}
                            >
                                <Edit size={16} />
                            </button>
                        </div>
                    )}

                    {!isTeacher && (
                        mySubmission
                            ? <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><CheckCircle size={14} /> {t('assignments.submitted')}</span>
                            : <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><AlertCircle size={14} /> {t('assignments.not_submitted')}</span>
                    )}
                    {expanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
            </div>

            {/* Expandable Content */}
            {expanded && (
                <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] bg-gray-50/50 dark:bg-[#131314]">
                    <div className="prose dark:prose-invert max-w-none mb-8 text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white dark:bg-[#1E1F20] p-4 rounded-xl border border-gray-200 dark:border-[#3c4043]">
                        {assignment.description}
                    </div>

                    {/* ATTACHMENTS DISPLAY */}
                    {assignment.attachments?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <h5 className="text-xs font-bold text-gray-400 uppercase mb-2">{t('assignments.material_header')}</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {assignment.attachments.map(att => (
                                    <div key={att.id} className="bg-white dark:bg-[#1E1F20] p-3 rounded-lg border border-gray-200 dark:border-[#3c4043] flex items-center gap-3 hover:border-indigo-300 transition-colors">
                                        {att.type === 'FILE' && <div className="bg-indigo-100 p-2 rounded text-indigo-600"><Paperclip size={16} /></div>}
                                        {att.type === 'LINK' && <div className="bg-blue-100 p-2 rounded text-blue-600"><LinkIcon size={16} /></div>}
                                        {att.type === 'YOUTUBE' && <div className="bg-red-100 p-2 rounded text-red-600"><Youtube size={16} /></div>}

                                        <div className="flex-1 overflow-hidden">
                                            <div className="font-bold text-sm truncate">{att.name}</div>
                                            <a href={`${window.location.origin}${att.url.startsWith('/') ? '' : '/'}${att.url}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:underline truncate block">
                                                {att.type === 'FILE' ? t('assignments.download_file') : t('assignments.open_link')}
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TEACHER VIEW: GRADING TABLE */}
                    {isTeacher ? (
                        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] overflow-hidden shadow-sm">
                            <div className="p-4 bg-gray-50 dark:bg-[#282a2c] border-b border-gray-100 dark:border-[#3c4043] font-bold text-sm text-gray-500 uppercase">{t('assignments.submissions')} ({allSubmissions.length})</div>
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 border-b border-gray-100 dark:border-[#3c4043]">
                                    <tr>
                                        <th className="p-4">{t('common.student')}</th>
                                        <th className="p-4">{t('common.date')}</th>
                                        <th className="p-4">{t('common.file')}</th>
                                        <th className="p-4 text-right">{t('assignments.grade_label')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                    {allSubmissions.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-gray-400 italic">{t('assignments.no_submissions')}</td>
                                        </tr>
                                    ) : (
                                        allSubmissions.map(sub => (
                                            <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50">
                                                <td className="p-4 font-medium text-gray-900 dark:text-white">{sub.student?.fullName}</td>
                                                <td className="p-4 text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <a href={`${window.location.origin}${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg w-fit">
                                                        <Download size={14} /> {sub.fileName}
                                                    </a>
                                                </td>
                                                <td className="p-4 text-right flex justify-end gap-1">
                                                    {['IG', 'G', 'VG'].map(g => (
                                                        <button
                                                            key={g}
                                                            onClick={() => handleGrade(sub.id, g)}
                                                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${sub.grade === g ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-[#282a2c] text-gray-500 border-gray-200 dark:border-[#3c4043] hover:border-indigo-300'}`}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* STUDENT VIEW: UPLOAD */
                        <div className="bg-white dark:bg-[#1E1F20] p-8 rounded-xl border border-gray-200 dark:border-[#3c4043] flex flex-col items-center justify-center text-center shadow-sm">
                            {mySubmission ? (
                                <div className="animate-in zoom-in">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{t('assignments.submission_received')}</h4>
                                    <p className="text-gray-500 mb-6">{t('assignments.file')}: <span className="font-mono text-indigo-600">{mySubmission.fileName}</span> <br /> {new Date(mySubmission.submittedAt).toLocaleString()}</p>

                                    {mySubmission.grade ? (
                                        <div className="inline-block px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold border border-indigo-100 text-lg shadow-sm">
                                            {t('assignments.grade')}: {mySubmission.grade}
                                        </div>
                                    ) : (
                                        <span className="text-sm bg-gray-100 dark:bg-[#282a2c] text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg font-medium">{t('assignments.not_graded_yet')}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full max-w-md">
                                    <Upload size={48} className="text-indigo-200 mx-auto mb-4" />
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{t('assignments.upload_solution_header')}</h4>
                                    <p className="text-sm text-gray-500 mb-6">{t('assignments.upload_solution_description')}</p>

                                    <div className="relative mb-4">
                                        <input
                                            type="file"
                                            onChange={e => setFile(e.target.files[0])}
                                            className="block w-full text-sm text-slate-500
                                              file:mr-4 file:py-2.5 file:px-4
                                              file:rounded-full file:border-0
                                              file:text-sm file:font-bold
                                              file:bg-indigo-50 file:text-indigo-700
                                              hover:file:bg-indigo-100
                                              cursor-pointer"
                                        />
                                    </div>

                                    {file && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={isUploading}
                                            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                                        >
                                            {isUploading ? t('assignments.uploading') : t('assignments.submit_assignment')}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssignmentsModule;
