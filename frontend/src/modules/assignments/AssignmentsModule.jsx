import React, { useState, useEffect } from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertCircle, Plus, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { api } from '../../services/api'; // Justera sökväg vid behov

export const AssignmentsModuleMetadata = {
    key: 'assignments',
    name: 'Inlämningar',
    icon: FileText,
    settingsKey: 'module_assignments_enabled'
};

const AssignmentsModule = ({ courseId, currentUser, isTeacher }) => {
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submissionsMap, setSubmissionsMap] = useState({}); // Håller inlämningsstatus

    // UI States
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [expandedAssignment, setExpandedAssignment] = useState(null);

    // Form Data
    const [newAssignment, setNewAssignment] = useState({ title: '', description: '', dueDate: '' });

    useEffect(() => {
        loadAssignments();
    }, [courseId]);

    const loadAssignments = async () => {
        setIsLoading(true);
        try {
            const data = await api.assignments.getByCourse(courseId);
            setAssignments(data);

            // Hämta status för alla uppgifter direkt (om man är elev)
            if (!isTeacher && data.length > 0) {
                const subMap = {};
                await Promise.all(data.map(async (assign) => {
                    try {
                        const sub = await api.assignments.getMySubmission(assign.id, currentUser.id);
                        if (sub) subMap[assign.id] = sub;
                    } catch (e) { /* Ingen inlämning */ }
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
            await api.assignments.create(courseId, newAssignment);
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
                        {showCreateForm ? 'Avbryt' : <><Plus size={16}/> Skapa Ny</>}
                    </button>
                )}
            </div>

            {/* Skapa Formulär (Endast lärare) */}
            {showCreateForm && (
                <div className="bg-gray-50 dark:bg-[#282a2c] p-6 rounded-xl border border-gray-200 dark:border-[#3c4043] mb-6">
                    <h3 className="font-bold mb-4 text-gray-800 dark:text-white">Ny Uppgift</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input
                            placeholder="Titel"
                            className="w-full p-2 rounded border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                            value={newAssignment.title}
                            onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                            required
                        />
                        <textarea
                            placeholder="Instruktioner..."
                            className="w-full p-2 rounded border h-24 dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                            value={newAssignment.description}
                            onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
                        />
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Deadline</label>
                            <input
                                type="datetime-local"
                                className="p-2 rounded border dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                                value={newAssignment.dueDate}
                                onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded font-bold hover:bg-indigo-700">Publicera</button>
                    </form>
                </div>
            )}

            {/* Lista med uppgifter */}
            <div className="space-y-4">
                {assignments.length === 0 && !isLoading && (
                    <p className="text-center text-gray-500 py-8 italic">Inga uppgifter än.</p>
                )}

                {assignments.map(assign => (
                    <AssignmentCard
                        key={assign.id}
                        assignment={assign}
                        isTeacher={isTeacher}
                        currentUser={currentUser}
                        expanded={expandedAssignment === assign.id}
                        toggleExpand={() => setExpandedAssignment(expandedAssignment === assign.id ? null : assign.id)}
                        preloadedSubmission={submissionsMap[assign.id]} // Skicka status!
                        onUploadSuccess={() => loadAssignments()} // Uppdatera allt vid inlämning
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

    // Uppdatera state om prop ändras (t.ex. vid ny laddning)
    useEffect(() => {
        if (preloadedSubmission) setMySubmission(preloadedSubmission);
    }, [preloadedSubmission]);

    // Data fetching vid expand (Endast för lärare)
    useEffect(() => {
        if (expanded && isTeacher) {
            api.assignments.getSubmissions(assignment.id).then(setAllSubmissions);
        }
    }, [expanded, isTeacher, assignment.id]);

    const handleUpload = async () => {
        if(!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.assignments.submit(assignment.id, currentUser.id, formData);
            alert("Inlämnat!");
            setFile(null);
            if(onUploadSuccess) onUploadSuccess(); // Ladda om listan
        } catch (e) {
            alert("Fel vid inlämning");
        }
    };

    const handleGrade = async (subId, grade) => {
        try {
            await api.assignments.grade(subId, grade, "Bra jobbat!");
            setAllSubmissions(prev => prev.map(s => s.id === subId ? {...s, grade} : s));
        } catch (e) {
            alert("Kunde inte sätta betyg");
        }
    };

    return (
        <div className={`bg-white dark:bg-[#1E1F20] rounded-xl border ${expanded ? 'border-indigo-500 shadow-md' : 'border-gray-200 dark:border-[#3c4043]'} transition-all overflow-hidden`}>

            {/* Header Row */}
            <div onClick={toggleExpand} className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-[#282a2c]">
                <div className="flex items-center gap-4">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{assignment.title}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12}/> Deadline: {new Date(assignment.dueDate).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!isTeacher && (
                        mySubmission
                            ? <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><CheckCircle size={12}/> Inlämnad</span>
                            : <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1"><AlertCircle size={12}/> Ej inlämnad</span>
                    )}
                    {expanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                </div>
            </div>

            {/* Expandable Content */}
            {expanded && (
                <div className="p-6 border-t border-gray-100 dark:border-[#3c4043] bg-gray-50/50 dark:bg-[#131314]">
                    <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">{assignment.description}</p>

                    {/* TEACHER VIEW */}
                    {isTeacher ? (
                        <div className="bg-white dark:bg-[#1E1F20] rounded-lg border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-[#282a2c] text-gray-500 border-b border-gray-200 dark:border-[#3c4043]">
                                <tr><th className="p-3">Student</th><th className="p-3">Datum</th><th className="p-3">Fil</th><th className="p-3 text-right">Betyg</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                                {allSubmissions.map(sub => (
                                    <tr key={sub.id}>
                                        <td className="p-3 font-medium text-gray-900 dark:text-white">{sub.student?.fullName}</td>
                                        <td className="p-3 text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                        <td className="p-3">
                                            <a href={`http://127.0.0.1:8080${sub.fileUrl}`} target="_blank" className="text-indigo-600 hover:underline flex items-center gap-1">
                                                <Download size={14}/> {sub.fileName}
                                            </a>
                                        </td>
                                        <td className="p-3 text-right flex justify-end gap-1">
                                            {['IG', 'G', 'VG'].map(g => (
                                                <button
                                                    key={g}
                                                    onClick={() => handleGrade(sub.id, g)}
                                                    className={`px-2 py-1 rounded text-xs font-bold border ${sub.grade === g ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-[#282a2c] text-gray-500 border-gray-200 dark:border-[#3c4043]'}`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                                {allSubmissions.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-500">Inga inlämningar än.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* STUDENT VIEW: UPLOAD */
                        <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-lg border border-gray-200 dark:border-[#3c4043] flex flex-col items-center justify-center text-center">
                            {mySubmission ? (
                                <div>
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Inlämning mottagen!</h4>
                                    <p className="text-gray-500 text-sm mb-4">Du lämnade in: {mySubmission.fileName} <br/> {new Date(mySubmission.submittedAt).toLocaleString()}</p>

                                    {mySubmission.grade ? (
                                        <div className="inline-block px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg font-bold border border-indigo-100">
                                            Betyg: {mySubmission.grade}
                                        </div>
                                    ) : (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Väntar på rättning...</span>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Upload size={40} className="text-gray-300 mb-4" />
                                    <p className="font-bold text-gray-700 dark:text-gray-300 mb-2">Ladda upp din lösning</p>
                                    <input
                                        type="file"
                                        onChange={e => setFile(e.target.files[0])}
                                        className="mb-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    {file && (
                                        <button onClick={handleUpload} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 w-full md:w-auto">
                                            Skicka in
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AssignmentsModule;