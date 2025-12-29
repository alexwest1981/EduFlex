import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, BookOpen, FileText, CheckSquare, Users,
    Plus, Trash2, ExternalLink, PlayCircle,
    HelpCircle, Clock, Award, MessageSquare, Loader2, CheckCircle, Edit
    // OBS: 'File' borttaget härifrån då det inte verkar användas i komponenten, och för att undvika krockar.
    // Om du behöver en fil-ikon, importera 'File as FileIcon' precis som i de andra filerna.
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import CourseForum from '../components/CourseForum';
import { QuizBuilderModal, QuizRunnerModal } from '../components/QuizModals';

const CourseDetail = ({ currentUser }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // --- LOCAL STATE ---
    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [mySubmission, setMySubmission] = useState(null);

    const [activeTab, setActiveTab] = useState('material');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // UI States
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showQuizBuilder, setShowQuizBuilder] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [readMaterials, setReadMaterials] = useState({});
    const [grading, setGrading] = useState({});

    // Forms
    const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });
    const [matTitle, setMatTitle] = useState('');
    const [matContent, setMatContent] = useState('');
    const [matLink, setMatLink] = useState('');
    const [matType, setMatType] = useState('TEXT');
    const [matFile, setMatFile] = useState(null);
    const [submissionFile, setSubmissionFile] = useState(null);

    const isTeacher = currentUser && (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN');

    useEffect(() => {
        if (id) {
            loadCourseData();
        }
    }, [id]);

    const loadCourseData = async () => {
        setIsLoading(true);
        try {
            const courseData = await api.courses.getOne(id);
            setCourse(courseData);

            const [mats, assigns, quizList] = await Promise.all([
                fetch(`http://127.0.0.1:8080/api/courses/${id}/materials`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }).then(r => r.ok ? r.json() : []).catch(() => []),
                api.assignments.getByCourse(id),
                api.quiz.getByCourse(id)
            ]);

            setMaterials(mats || []);
            setAssignments(assigns || []);
            setQuizzes(quizList || []);

        } catch (e) {
            console.error("Kunde inte hämta kursdata", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedAssignment) return;
        const loadSubmissions = async () => {
            if (isTeacher) {
                const subs = await api.assignments.getSubmissions(selectedAssignment.id);
                setSubmissions(subs || []);
            }
        };
        loadSubmissions();
    }, [selectedAssignment, isTeacher]);


    // --- HANDLERS ---

    const handleEditQuiz = (quiz) => {
        setEditingQuiz(quiz);
        setShowQuizBuilder(true);
    };

    const handleSaveQuiz = async (quizData, quizId) => {
        try {
            if (quizId) {
                await api.quiz.update(quizId, quizData);
                alert(t('quiz.updated_alert'));
            } else {
                await api.quiz.create(id, quizData);
                alert(t('quiz.created_alert'));
            }
            const q = await api.quiz.getByCourse(id);
            setQuizzes(q);
            setShowQuizBuilder(false);
            setEditingQuiz(null);
        } catch (e) { alert(t('quiz.save_error')); }
    };

    const handleDeleteQuiz = async (quizId, e) => {
        e.stopPropagation();
        if(!window.confirm(t('quiz.delete_confirm'))) return;

        try {
            await api.quiz.delete(quizId);
            setQuizzes(quizzes.filter(q => q.id !== quizId));
        } catch (e) { alert(t('quiz.delete_error')); }
    };

    const handleSubmitQuiz = async (quizId, score, maxScore) => {
        try {
            await api.quiz.submit(quizId, { studentId: currentUser.id, score, maxScore });
            alert(`${t('quiz.result_saved')}: ${score}/${maxScore}`);
            setActiveQuiz(null);
        } catch (e) { console.error("Kunde inte spara resultat"); }
    };

    const handleCreateAssignment = async (e) => { e.preventDefault(); try { await api.assignments.create(id, assignmentForm); setShowAssignmentModal(false); setAssignmentForm({ title: '', description: '', dueDate: '' }); const assigns = await api.assignments.getByCourse(id); setAssignments(assigns); alert("Uppgift skapad!"); } catch (e) { alert("Fel vid skapande av uppgift."); } };
    const handleMaterialSubmit = async (e) => { e.preventDefault(); const fd = new FormData(); fd.append("title", matTitle); fd.append("content", matContent); fd.append("link", matLink); fd.append("type", matType); if (matFile) fd.append("file", matFile); try { await fetch(`http://127.0.0.1:8080/api/courses/${id}/materials`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: fd }); const matRes = await fetch(`http://127.0.0.1:8080/api/courses/${id}/materials`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); if(matRes.ok) setMaterials(await matRes.json()); setMatTitle(''); setMatContent(''); setMatLink(''); setMatFile(null); alert(t('messages.upload_success')); } catch (e) { alert(t('messages.upload_error')); } };
    const handleDeleteMaterial = async (mid) => { if(!window.confirm(t('common.delete') + "?")) return; try { await fetch(`http://127.0.0.1:8080/api/courses/materials/${mid}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); setMaterials(materials.filter(m => m.id !== mid)); } catch(e) { console.error(e); } };
    const handleStudentSubmit = async (e) => { e.preventDefault(); if (!submissionFile) return alert(t('assignments.select_file_alert')); const fd = new FormData(); fd.append("file", submissionFile); try { await api.assignments.submit(selectedAssignment.id, currentUser.id, fd); setMySubmission({ submittedAt: new Date().toISOString().split('T')[0], grade: null }); alert(t('assignments.submitted')); } catch (e) { alert("Fel vid inlämning."); } };
    const handleGradeSubmission = async (sid) => { const d = grading[sid]; if(!d || !d.grade) return alert("Välj betyg"); try { await api.assignments.grade(sid, d.grade, d.feedback); alert("Betyg sparat!"); const subs = await api.assignments.getSubmissions(selectedAssignment.id); setSubmissions(subs || []); } catch(e) { alert("Kunde inte spara betyg"); } };

    const getIcon = (t) => { switch(t) { case 'VIDEO': return <PlayCircle size={20} className="text-red-500"/>; case 'LINK': return <ExternalLink size={20} className="text-blue-500"/>; default: return <FileText size={20} className="text-gray-500"/>; } };
    const toggleReadStatus = (mid) => setReadMaterials(p => ({ ...p, [mid]: !p[mid] }));

    const [allUsers, setAllUsers] = useState([]);
    useEffect(() => { if(isTeacher && allUsers.length === 0) { api.users.getAll().then(setAllUsers).catch(() => {}); } }, [isTeacher]);
    const students = allUsers.filter(u => u.role === 'STUDENT');
    const enrolledStudentIds = course?.students?.map(s => s.id) || [];
    const availableStudents = students.filter(s => !enrolledStudentIds.includes(s.id));
    const handleAddStudent = async (sid) => { try { await api.courses.enroll(id, sid); loadCourseData(); alert("Student tillagd!"); } catch(e) { alert("Fel vid tilläggning"); } };

    if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32}/></div>;
    if (!course) return <div className="text-center mt-10">Kursen hittades inte.</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <button onClick={() => navigate('/')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
                <ArrowLeft size={20} className="mr-2" /> {t('course.back')}
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-8 -mt-8"></div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 relative z-10">{course.name}</h1>
                <div className="flex items-center gap-4 text-gray-500 text-sm mb-6 relative z-10">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-mono font-bold">{course.courseCode}</span>
                    <span>{course.teacher?.fullName || "Ingen lärare"}</span>
                    <span>{course.startDate} — {course.endDate}</span>
                </div>
                <p className="text-gray-600 max-w-2xl relative z-10">{course.description}</p>

                <div className="flex gap-6 mt-8 border-b border-gray-100 overflow-x-auto">
                    {['material', 'assignments', 'quiz', 'forum', 'students'].map(tab => {
                        if (tab === 'students' && !isTeacher) return null;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 flex items-center gap-2 transition-colors whitespace-nowrap capitalize ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600 font-bold' : 'text-gray-500 hover:text-gray-800'}`}
                            >
                                {tab === 'material' && <><BookOpen size={18} /> {t('course.material')}</>}
                                {tab === 'assignments' && <><FileText size={18} /> {t('course.assignments')}</>}
                                {tab === 'quiz' && <><HelpCircle size={18} /> {t('course.quiz')}</>}
                                {tab === 'forum' && <><MessageSquare size={18} /> {t('course.forum')}</>}
                                {tab === 'students' && <><Users size={18} /> {t('course.students')}</>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- FLIK: MATERIAL --- */}
            {activeTab === 'material' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {materials.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300"><BookOpen size={48} className="mx-auto text-gray-300 mb-3"/><p className="text-gray-500">{t('course.no_material')}</p></div> :
                            materials.map(m => (
                                <div key={m.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className={`mt-1 p-2 rounded-lg ${readMaterials[m.id] ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>{getIcon(m.type)}</div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{m.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1 mb-3">{m.content}</p>
                                                {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="text-indigo-600 text-sm hover:underline flex items-center gap-1"><ExternalLink size={14}/> {t('course.open_link')}</a>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => toggleReadStatus(m.id)} className={`text-xs px-3 py-1 rounded-full font-bold transition-colors ${readMaterials[m.id] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{readMaterials[m.id] ? t('course.read') : t('course.mark_read')}</button>
                                            {isTeacher && <button onClick={() => handleDeleteMaterial(m.id)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    {isTeacher && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> {t('course.add_material')}</h3>
                            <form onSubmit={handleMaterialSubmit} className="space-y-4">
                                <input className="w-full border p-2 rounded-lg text-sm" placeholder={t('course.title')} value={matTitle} onChange={e => setMatTitle(e.target.value)} required />
                                <textarea className="w-full border p-2 rounded-lg text-sm" placeholder={t('course.description')} value={matContent} onChange={e => setMatContent(e.target.value)} />
                                <select className="w-full border p-2 rounded-lg text-sm bg-white" value={matType} onChange={e => setMatType(e.target.value)}>
                                    <option value="TEXT">{t('course.type_text')}</option>
                                    <option value="VIDEO">{t('course.type_video')}</option>
                                    <option value="LINK">{t('course.type_link')}</option>
                                    <option value="FILE">{t('course.type_file')}</option>
                                </select>
                                {matType !== 'FILE' && <input className="w-full border p-2 rounded-lg text-sm" placeholder={t('course.link')} value={matLink} onChange={e => setMatLink(e.target.value)} />}
                                {matType === 'FILE' && <input type="file" className="w-full text-sm" onChange={e => setMatFile(e.target.files[0])} />}
                                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">{t('course.upload')}</button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* --- FLIK: ASSIGNMENTS, QUIZ, STUDENTS... --- */}
            {activeTab === 'assignments' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg">{t('assignments.header')}</h3>
                            {isTeacher && <button onClick={() => setShowAssignmentModal(true)} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-200">+ {t('assignments.new')}</button>}
                        </div>
                        {showAssignmentModal && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 animate-in fade-in">
                                <h4 className="font-bold text-sm mb-2">{t('assignments.create_header')}</h4>
                                <form onSubmit={handleCreateAssignment} className="space-y-3">
                                    <input className="w-full border p-2 rounded text-sm" placeholder={t('course.title')} value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} required/>
                                    <textarea className="w-full border p-2 rounded text-sm" placeholder={t('course.description')} value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} required/>
                                    <input type="date" className="w-full border p-2 rounded text-sm" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} required/>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowAssignmentModal(false)} className="text-xs text-gray-500">{t('assignments.cancel')}</button>
                                        <button className="bg-indigo-600 text-white text-xs px-3 py-1 rounded font-bold">{t('assignments.save')}</button>
                                    </div>
                                </form>
                            </div>
                        )}
                        {assignments.map(a => (
                            <div key={a.id} onClick={() => setSelectedAssignment(a)} className={`p-5 rounded-xl border cursor-pointer transition-all ${selectedAssignment?.id === a.id ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-gray-200 hover:border-indigo-300'}`}>
                                <div className="flex justify-between items-start">
                                    <div><h4 className="font-bold text-gray-900">{a.title}</h4><p className="text-sm text-gray-500 mb-2">{t('assignments.deadline')}: {a.dueDate}</p></div>
                                    <div className="bg-orange-100 text-orange-700 p-2 rounded-full"><Clock size={16}/></div>
                                </div>
                            </div>
                        ))}
                        {assignments.length === 0 && <p className="text-gray-400 italic">{t('assignments.no_assignments')}</p>}
                    </div>
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 min-h-[400px]">
                        {selectedAssignment ? (
                            <>
                                <h3 className="text-xl font-bold mb-2">{selectedAssignment.title}</h3>
                                <p className="text-gray-600 mb-6">{selectedAssignment.description}</p>
                                {isTeacher ? (
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-500 uppercase mb-4">{t('assignments.submissions')} ({submissions.length})</h4>
                                        <div className="space-y-3">
                                            {submissions.length === 0 && <p className="text-sm text-gray-400 italic">{t('assignments.no_submissions')}</p>}
                                            {submissions.map(s => (
                                                <div key={s.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                    <div className="flex justify-between items-center mb-2"><span className="font-bold text-sm">{s.studentName}</span><span className="text-xs text-gray-400">{s.submittedAt}</span></div>
                                                    <div className="text-sm text-green-700 bg-green-50 p-2 rounded mb-2">{t('assignments.file_received')}</div>
                                                    <div className="space-y-2 mt-2 pt-2 border-t">
                                                        <select className="w-full text-sm border p-1 rounded" onChange={(e) => setGrading({...grading, [s.id]: { ...grading[s.id], grade: e.target.value }})}><option value="">{t('assignments.grade_placeholder')}</option><option value="IG">IG</option><option value="G">G</option><option value="VG">VG</option></select>
                                                        <input className="w-full text-sm border p-1 rounded" placeholder={t('assignments.feedback_placeholder')} onChange={(e) => setGrading({...grading, [s.id]: { ...grading[s.id], feedback: e.target.value }})}/>
                                                        <button onClick={() => handleGradeSubmission(s.id)} className="w-full bg-indigo-600 text-white text-xs py-1.5 rounded font-bold hover:bg-indigo-700">{t('assignments.save')}</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
                                        {mySubmission ? (
                                            <div><CheckCircle size={48} className="mx-auto text-green-500 mb-2"/><h3 className="font-bold text-green-700">{t('assignments.submitted')}</h3><p className="text-sm text-gray-500">{t('assignments.submitted_desc')}</p></div>
                                        ) : (
                                            <form onSubmit={handleStudentSubmit}>
                                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-4 hover:bg-gray-50 transition-colors"><input type="file" onChange={e => setSubmissionFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/></div>
                                                <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">{t('assignments.submit_button')}</button>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : <div className="h-full flex flex-col items-center justify-center text-gray-400"><FileText size={48} className="mb-2 opacity-50"/><p>Välj en uppgift till vänster</p></div>}
                    </div>
                </div>
            )}

            {activeTab === 'quiz' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                        <div><h2 className="text-xl font-bold text-indigo-900">{t('quiz.header')}</h2><p className="text-indigo-700 text-sm">{t('quiz.subtitle')}</p></div>
                        {isTeacher && (<button onClick={() => { setEditingQuiz(null); setShowQuizBuilder(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2"><Plus size={18} /> {t('course.create_quiz')}</button>)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes && quizzes.length > 0 ? quizzes.map(quiz => (
                            <div key={quiz.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative group">
                                {isTeacher && (<div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => { e.stopPropagation(); handleEditQuiz(quiz); }} className="p-2 bg-gray-100 hover:bg-indigo-100 text-gray-500 hover:text-indigo-600 rounded-full transition-colors"><Edit size={16} /></button><button onClick={(e) => handleDeleteQuiz(quiz.id, e)} className="p-2 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-full transition-colors"><Trash2 size={16} /></button></div>)}
                                <div className="flex items-start justify-between mb-4"><div className="bg-purple-100 p-3 rounded-full text-purple-600"><HelpCircle size={24} /></div><span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{quiz.questions ? quiz.questions.length : 0} {t('quiz.questions_count')}</span></div>
                                <h3 className="font-bold text-lg mb-2">{quiz.title}</h3><p className="text-sm text-gray-500 mb-6">{t('quiz.knowledge_check')}</p>
                                <button onClick={() => setActiveQuiz(quiz)} className="w-full bg-white border-2 border-indigo-600 text-indigo-600 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"><PlayCircle size={18} /> {t('course.start_quiz')}</button>
                            </div>
                        )) : <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed"><Award size={48} className="mx-auto mb-2 opacity-50"/><p>{t('quiz.no_quizzes')}</p></div>}
                    </div>
                </div>
            )}

            {activeTab === 'forum' && <CourseForum courseId={id} currentUser={currentUser} />}

            {activeTab === 'students' && isTeacher && (
                <div className="space-y-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">{t('course.participants')}</h3>
                            <div className="flex gap-2">
                                <select id="studentSelect" className="text-sm border p-2 rounded-lg w-64">
                                    <option value="">{t('course.select_student')}</option>
                                    {availableStudents.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.username})</option>)}
                                </select>
                                <button onClick={() => { const sid = document.getElementById('studentSelect').value; if(sid) handleAddStudent(sid); }} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700">{t('course.add_student')}</button>
                            </div>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase"><tr><th className="p-4">{t('profile.firstname')}</th><th className="p-4">{t('auth.username')}</th><th className="p-4">{t('course.role')}</th><th className="p-4">{t('course.status')}</th></tr></thead>
                            <tbody className="divide-y">
                            {course.students?.map(s => (<tr key={s.id} className="hover:bg-gray-50"><td className="p-4 font-bold text-gray-900">{s.fullName}</td><td className="p-4 text-gray-600">{s.username}</td><td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">STUDENT</span></td><td className="p-4 text-green-600 font-bold flex items-center gap-1"><CheckSquare size={14}/> {t('course.active')}</td></tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showQuizBuilder && (<QuizBuilderModal onClose={() => { setShowQuizBuilder(false); setEditingQuiz(null); }} onSubmit={handleSaveQuiz} courseId={id} initialData={editingQuiz} />)}
            {activeQuiz && (<QuizRunnerModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onSubmit={handleSubmitQuiz} />)}
        </div>
    );
};

export default CourseDetail;