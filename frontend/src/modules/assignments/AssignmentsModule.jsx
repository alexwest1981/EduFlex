import React, { useState, useEffect } from 'react';
import { FileText, Plus, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../../services/api';

export const AssignmentsModuleMetadata = {
    id: 'assignments_engine',
    name: 'Assignments Engine',
    version: '1.0.0',
    description: 'Hanterar inlämningsuppgifter, deadlines och betyg.',
    icon: FileText,
    settingsKey: 'module_assignments_enabled', // Vi kan styra detta i admin om vi vill
    permissions: ['READ', 'WRITE']
};

const AssignmentsModule = ({ courseId, currentUser, isTeacher }) => {
    const { t } = useTranslation();

    // Data States
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [mySubmission, setMySubmission] = useState(null);

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Forms
    const [createForm, setCreateForm] = useState({ title: '', description: '', dueDate: '' });
    const [submissionFile, setSubmissionFile] = useState(null);
    const [grading, setGrading] = useState({}); // { submissionId: { grade: '', feedback: '' } }

    // --- DATA LOADING ---
    useEffect(() => {
        loadAssignments();
    }, [courseId]);

    // Ladda submissions när man klickar på en uppgift
    useEffect(() => {
        if (!selectedAssignment) return;

        const loadDetails = async () => {
            if (isTeacher) {
                const subs = await api.assignments.getSubmissions(selectedAssignment.id);
                setSubmissions(subs || []);
            } else {
                // För studenter: Kolla om jag redan lämnat in (Simulerad check då API kanske saknar endpointen 'getMySubmission')
                // I ett riktigt scenario skulle vi hämta "min" submission här.
                // För nu nollställer vi bara för att visa formuläret.
                setMySubmission(null);
            }
        };
        loadDetails();
    }, [selectedAssignment, isTeacher]);

    const loadAssignments = async () => {
        setIsLoading(true);
        try {
            const data = await api.assignments.getByCourse(courseId);
            setAssignments(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.assignments.create(courseId, createForm);
            setShowCreateModal(false);
            setCreateForm({ title: '', description: '', dueDate: '' });
            loadAssignments();
            alert("Uppgift skapad!");
        } catch (e) { alert("Kunde inte skapa uppgift."); }
    };

    const handleSubmitAssignment = async (e) => {
        e.preventDefault();
        if (!submissionFile) return alert(t('assignments.select_file_alert'));

        const fd = new FormData();
        fd.append("file", submissionFile);

        try {
            await api.assignments.submit(selectedAssignment.id, currentUser.id, fd);
            setMySubmission({ submittedAt: new Date().toISOString().split('T')[0], grade: null });
            alert(t('assignments.submitted'));
        } catch (e) { alert("Fel vid inlämning."); }
    };

    const handleGrade = async (submissionId) => {
        const d = grading[submissionId];
        if(!d || !d.grade) return alert("Välj betyg");

        try {
            await api.assignments.grade(submissionId, d.grade, d.feedback);
            // Uppdatera listan lokalt
            const updatedSubmissions = submissions.map(s =>
                s.id === submissionId ? { ...s, grade: d.grade, feedback: d.feedback, status: 'GRADED' } : s
            );
            setSubmissions(updatedSubmissions);
            alert("Betyg sparat!");
        } catch (e) { alert("Kunde inte spara betyg."); }
    };

    // --- RENDER ---

    if (isLoading) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-600"/></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
            {/* Vänster: Lista */}
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">{t('assignments.header')}</h3>
                    {isTeacher && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-bold hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                            + {t('assignments.new')}
                        </button>
                    )}
                </div>

                {/* Create Modal (Inline) */}
                {showCreateModal && (
                    <div className="bg-gray-50 dark:bg-[#131314] p-4 rounded-lg border border-gray-200 dark:border-[#3c4043] mb-4 animate-in slide-in-from-top-2">
                        <h4 className="font-bold text-sm mb-2 text-gray-800 dark:text-white">{t('assignments.create_header')}</h4>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <input className="w-full border dark:border-[#3c4043] p-2 rounded text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" placeholder={t('course.title')} value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} required/>
                            <textarea className="w-full border dark:border-[#3c4043] p-2 rounded text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" placeholder={t('course.description')} value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} required/>
                            <input type="date" className="w-full border dark:border-[#3c4043] p-2 rounded text-sm bg-white dark:bg-[#1E1F20] text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500" value={createForm.dueDate} onChange={e => setCreateForm({...createForm, dueDate: e.target.value})} required/>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="text-xs text-gray-500 dark:text-gray-400 font-bold px-2">{t('assignments.cancel')}</button>
                                <button className="bg-indigo-600 text-white text-xs px-3 py-1.5 rounded font-bold hover:bg-indigo-700">{t('assignments.save')}</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* List Items */}
                {assignments.length === 0 ? (
                    <p className="text-gray-400 italic text-center py-8 border-2 border-dashed border-gray-200 dark:border-[#3c4043] rounded-xl">{t('assignments.no_assignments')}</p>
                ) : (
                    assignments.map(a => (
                        <div
                            key={a.id}
                            onClick={() => setSelectedAssignment(a)}
                            className={`p-5 rounded-xl border cursor-pointer transition-all ${selectedAssignment?.id === a.id ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white dark:bg-[#1E1F20] border-gray-200 dark:border-[#3c4043] hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">{a.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{t('assignments.deadline')}: {a.dueDate}</p>
                                </div>
                                <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 p-2 rounded-full">
                                    <Clock size={16}/>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Höger: Detaljvy / Inlämning / Rättning */}
            <div className="bg-gray-50 dark:bg-[#131314] rounded-xl border border-gray-200 dark:border-[#3c4043] p-6 min-h-[400px]">
                {selectedAssignment ? (
                    <>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{selectedAssignment.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">{selectedAssignment.description}</p>

                        {isTeacher ? (
                            // --- TEACHER VIEW (GRADING) ---
                            <div>
                                <h4 className="font-bold text-sm text-gray-500 dark:text-gray-400 uppercase mb-4 tracking-wider">{t('assignments.submissions')} ({submissions.length})</h4>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {submissions.length === 0 && <p className="text-sm text-gray-400 italic text-center py-4">{t('assignments.no_submissions')}</p>}
                                    {submissions.map(s => (
                                        <div key={s.id} className="bg-white dark:bg-[#1E1F20] p-4 rounded-lg shadow-sm border border-gray-200 dark:border-[#3c4043]">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-sm text-gray-900 dark:text-white">{s.studentName}</span>
                                                <span className="text-xs text-gray-400">{s.submittedAt}</span>
                                            </div>
                                            <div className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded mb-2 flex items-center gap-2">
                                                <FileText size={12}/> {t('assignments.file_received')}
                                            </div>

                                            {/* Grading Form */}
                                            <div className="space-y-2 mt-2 pt-2 border-t border-gray-100 dark:border-[#3c4043]">
                                                <div className="flex gap-2">
                                                    <select
                                                        className="w-1/3 text-xs border dark:border-[#3c4043] p-1.5 rounded bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white outline-none"
                                                        value={grading[s.id]?.grade || s.grade || ""}
                                                        onChange={(e) => setGrading({...grading, [s.id]: { ...grading[s.id], grade: e.target.value }})}
                                                    >
                                                        <option value="">{t('assignments.grade_placeholder')}</option>
                                                        <option value="IG">IG</option>
                                                        <option value="G">G</option>
                                                        <option value="VG">VG</option>
                                                    </select>
                                                    <input
                                                        className="w-2/3 text-xs border dark:border-[#3c4043] p-1.5 rounded bg-gray-50 dark:bg-[#131314] text-gray-900 dark:text-white outline-none"
                                                        placeholder={t('assignments.feedback_placeholder')}
                                                        value={grading[s.id]?.feedback || s.feedback || ""}
                                                        onChange={(e) => setGrading({...grading, [s.id]: { ...grading[s.id], feedback: e.target.value }})}
                                                    />
                                                </div>
                                                <button onClick={() => handleGrade(s.id)} className="w-full bg-indigo-600 text-white text-xs py-1.5 rounded font-bold hover:bg-indigo-700 transition-colors">
                                                    {t('assignments.save')}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // --- STUDENT VIEW (SUBMIT) ---
                            <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-xl border border-gray-200 dark:border-[#3c4043] text-center">
                                {mySubmission ? (
                                    <div className="animate-in zoom-in">
                                        <CheckCircle size={48} className="mx-auto text-green-500 mb-2"/>
                                        <h3 className="font-bold text-green-700 dark:text-green-400">{t('assignments.submitted')}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('assignments.submitted_desc')}</p>
                                        {mySubmission.grade && <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"><span className="font-bold text-indigo-700 dark:text-indigo-300">Betyg: {mySubmission.grade}</span></div>}
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitAssignment}>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-[#3c4043] rounded-xl p-8 mb-4 hover:bg-gray-50 dark:hover:bg-[#131314] transition-colors cursor-pointer relative group">
                                            <input type="file" onChange={e => setSubmissionFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                                            <FileText size={32} className="mx-auto text-gray-400 mb-2 group-hover:text-indigo-500 transition-colors"/>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 font-medium">
                                                {submissionFile ? submissionFile.name : t('assignments.select_file_alert') || "Klicka för att välja fil"}
                                            </p>
                                        </div>
                                        <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02]">
                                            {t('assignments.submit_button')}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <FileText size={48} className="mb-2 opacity-20"/>
                        <p className="text-sm font-medium">Välj en uppgift till vänster</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignmentsModule;