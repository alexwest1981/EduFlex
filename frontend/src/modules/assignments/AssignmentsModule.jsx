import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertCircle, Plus, ChevronDown, ChevronUp, Download, Trash2, Edit2 } from 'lucide-react';
import { api } from '../../services/api';

export const AssignmentsModuleMetadata = {
    key: 'assignments',
    name: 'Inlämningar',
    icon: FileText,
    settingsKey: 'module_assignments_enabled'
};

const AssignmentsModule = ({ courseId, currentUser, isTeacher, mode = 'COURSE' }) => {
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submissionsMap, setSubmissionsMap] = useState({}); // Håller status för studentens inlämningar

    // UI States
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [expandedAssignment, setExpandedAssignment] = useState(null);

    // Form Data
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });

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

        } catch (e) {
            console.error("Failed to load assignments", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (mode === 'GLOBAL') {
                await api.assignments.createGlobal(currentUser.id, newAssignment);
            } else {
                await api.assignments.create(courseId, currentUser.id, newAssignment);
            }
            setShowCreateForm(false);
            setNewAssignment({ title: '', description: '', dueDate: '' });
            loadAssignments();
        } catch (e) {
            alert("Kunde inte skapa uppgift");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header / Skapa knapp */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inlämningsuppgifter</h2>
                {isTeacher && (
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700"
                    >
                        {showCreateForm ? 'Avbryt' : <><Plus size={16} /> Skapa Ny</>}
                    </button>
                )}
            </div>

            {/* Skapa Formulär (Endast lärare) */}
            {showCreateForm && (
                <div className="bg-gray-50 dark:bg-[#282a2c] p-6 rounded-xl border border-gray-200 dark:border-[#3c4043] mb-6 animate-in slide-in-from-top-2">
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Ny Uppgift</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input
                            placeholder="Titel"
                            className="w-full p-3 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                            value={newAssignment.title}
                            onChange={e => setNewAssignment({ ...newAssignment, title: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Instruktioner..."
                            className="w-full p-3 rounded-lg border h-32 dark:bg-[#131314] dark:border-[#3c4043] dark:text-white resize-none"
                            value={newAssignment.description}
                            onChange={e => setNewAssignment({ ...newAssignment, description: e.target.value })}
                        />
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Deadline</label>
                            <input
                                type="datetime-local"
                                className="p-3 rounded-lg border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                value={newAssignment.dueDate}
                                onChange={e => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700">Publicera Uppgift</button>
                    </form>
                </div>
            )}

            {/* Lista med uppgifter */}
            <div className="space-y-4">
                {assignments.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 dark:border-[#3c4043] rounded-xl">
                        <FileText size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Inga uppgifter än.</p>
                    </div>
                )}

                {assignments.map(assign => (
                    <AssignmentCard
                        key={assign.id}
                        assignment={assign}
                        isTeacher={isTeacher}
                        currentUser={currentUser}
                        expanded={expandedAssignment === assign.id}
                        toggleExpand={() => setExpandedAssignment(expandedAssignment === assign.id ? null : assign.id)}
                        preloadedSubmission={submissionsMap[assign.id]}
                        onUploadSuccess={() => loadAssignments()}
                    />
                ))}
            </div>
        </div>
    );
};

// --- SUB-COMPONENT: KORT FÖR VARJE UPPGIFT ---
const AssignmentCard = ({ assignment, isTeacher, currentUser, expanded, toggleExpand, preloadedSubmission, onUploadSuccess }) => {
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
            alert("Uppgiften inlämnad!");
            setFile(null);
            if (onUploadSuccess) onUploadSuccess();
        } catch (e) {
            alert("Fel vid inlämning.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleGrade = async (subId, grade) => {
        try {
            await api.assignments.grade(subId, grade, "Betygsatt via dashboard");
            // Uppdatera listan lokalt
            setAllSubmissions(prev => prev.map(s => s.id === subId ? { ...s, grade } : s));
        } catch (e) {
            alert("Kunde inte sätta betyg");
        }
    };

    return (
        <div className={`bg-white dark:bg-[#1E1F20] rounded-xl border ${expanded ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-gray-200 dark:border-[#3c4043]'} transition-all overflow-hidden`}>

            {/* Header Row */}
            <div onClick={toggleExpand} className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${expanded ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'} transition-colors`}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{assignment.title}</h4>
                        <p className={`text-xs flex items-center gap-1 mt-1 ${new Date(assignment.dueDate) < new Date() ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                            <Clock size={12} /> Deadline: {new Date(assignment.dueDate).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!isTeacher && (
                        mySubmission
                            ? <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><CheckCircle size={14} /> Inlämnad</span>
                            : <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><AlertCircle size={14} /> Ej inlämnad</span>
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

                    {/* TEACHER VIEW: GRADING TABLE */}
                    {isTeacher ? (
                        <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] overflow-hidden shadow-sm">
                            <div className="p-4 bg-gray-50 dark:bg-[#282a2c] border-b border-gray-100 dark:border-[#3c4043] font-bold text-sm text-gray-500 uppercase">Inlämningar ({allSubmissions.length})</div>
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 border-b border-gray-100 dark:border-[#3c4043]">
                                    <tr><th className="p-4">Student</th><th className="p-4">Datum</th><th className="p-4">Fil</th><th className="p-4 text-right">Betyg</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                    {allSubmissions.map(sub => (
                                        <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50">
                                            <td className="p-4 font-medium text-gray-900 dark:text-white">{sub.student?.fullName}</td>
                                            <td className="p-4 text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <a href={`http://127.0.0.1:8080${sub.fileUrl}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg w-fit">
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
                                    ))}
                                    {allSubmissions.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-gray-400 italic">Inga studenter har lämnat in än.</td></tr>}
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
                                    <h4 className="font-bold text-xl text-gray-900 dark:text-white mb-1">Inlämning mottagen!</h4>
                                    <p className="text-gray-500 mb-6">Fil: <span className="font-mono text-indigo-600">{mySubmission.fileName}</span> <br /> {new Date(mySubmission.submittedAt).toLocaleString()}</p>

                                    {mySubmission.grade ? (
                                        <div className="inline-block px-6 py-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold border border-indigo-100 text-lg shadow-sm">
                                            Betyg: {mySubmission.grade}
                                        </div>
                                    ) : (
                                        <span className="text-sm bg-gray-100 dark:bg-[#282a2c] text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg font-medium">Läraren har inte rättat än.</span>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full max-w-md">
                                    <Upload size={48} className="text-indigo-200 mx-auto mb-4" />
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Ladda upp din lösning</h4>
                                    <p className="text-sm text-gray-500 mb-6">Ladda upp dokument, kod eller bilder (Max 500MB)</p>

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
                                            {isUploading ? 'Laddar upp...' : 'Skicka in uppgift'}
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