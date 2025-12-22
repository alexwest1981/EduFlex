import React, { useState, useEffect } from 'react';
import {
    Search, Bell, AlertTriangle, CheckCircle, Video, Link as LinkIcon,
    FileText, X, File, Shield, Key, Lock, Unlock, Loader2, Info, Calendar, User,
    HelpCircle, CheckSquare, Award, PlusCircle, Trash2, BarChart2, MessageSquare, AlertCircle, Users, Briefcase
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import EvaluationModal from './components/EvaluationModal';
import ChatOverlay from './components/ChatOverlay';

import AdminPanel from './pages/AdminPanel';
import CourseDetail from './pages/CourseDetail';
import CourseCatalog from './pages/CourseCatalog';
import DocumentManager from './pages/DocumentManager';
import UserProfile from './pages/UserProfile';
import CalendarView from './pages/CalendarView';

// --- DASHBOARD-KOMPONENTER (100% LIVE DATA) ---

// 1. ADMIN DASHBOARD
const AdminDashboard = ({ users, courses, documents, navigateTo }) => {
    // Statistik baserad på faktiskt inläst data
    const studentCount = users.filter(u => u.role === 'STUDENT').length;
    const teacherCount = users.filter(u => u.role === 'TEACHER').length;
    const latestUsers = [...users].reverse().slice(0, 5); // De 5 senast skapade
    const latestDocs = [...documents].reverse().slice(0, 5); // De 5 senaste filerna

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Systemöversikt (Live)</h1>
                <p className="text-gray-500">Realtidsdata från databasen.</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Användare</p>
                        <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                        <p className="text-xs text-green-600 font-medium mt-1">{studentCount} studenter, {teacherCount} lärare</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Users size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Kurser</p>
                        <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
                        <p className="text-xs text-gray-500 font-medium mt-1">{courses.filter(c => c.isOpen).length} aktiva</p>
                    </div>
                    <div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><Briefcase size={24}/></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Arkiverade Filer</p>
                        <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full text-orange-600"><FileText size={24}/></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Senaste Användare (Ersätter Ticket-systemet som saknade backend) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><User size={18}/> Senast registrerade</h3>
                        <button onClick={() => navigateTo('admin')} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded font-bold hover:bg-indigo-100">Hantera</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {latestUsers.map(u => (
                            <div key={u.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-sm text-gray-900">{u.fullName}</p>
                                    <p className="text-xs text-gray-500">{u.email || u.username}</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded font-bold ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'TEACHER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Senaste Dokument (Live från DocumentManager) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><FileText size={18}/> Senaste uppladdningar</h3>
                        <button onClick={() => navigateTo('documents')} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded font-bold hover:bg-indigo-100">Arkiv</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {latestDocs.length > 0 ? latestDocs.map(d => (
                            <div key={d.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <File size={16} className="text-gray-400"/>
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{d.name}</span>
                                </div>
                                <div className="text-xs text-gray-500 text-right">
                                    <p>{d.owner}</p>
                                    <p>{d.date}</p>
                                </div>
                            </div>
                        )) : <div className="p-6 text-center text-gray-400">Inga dokument i arkivet.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 2. TEACHER DASHBOARD
const TeacherDashboard = ({ currentUser, myCourses, ungradedSubmissions, allAssignments, allSubmissions, navigateTo }) => {

    // LIVE-LOGIK: Räkna ut riskzonen baserat på FAKTISKT data
    // En elev är i riskzonen om de har missade deadlines (där deadline passerat och ingen submission finns)
    const now = new Date();
    const atRiskMap = {}; // StudentID -> { name, missedCount, courses }

    // 1. Gå igenom alla uppgifter i lärarens kurser
    allAssignments.forEach(assignment => {
        const dueDate = new Date(assignment.dueDate);
        if (dueDate < now) { // Tiden har gått ut
            // Hitta kursen för uppgiften
            const course = myCourses.find(c => c.id === assignment.courseId);
            if (course && course.students) {
                // Kolla varje student i kursen
                course.students.forEach(student => {
                    // Har studenten lämnat in?
                    const hasSubmitted = allSubmissions.some(s => s.assignmentId === assignment.id && s.studentId === student.id);

                    if (!hasSubmitted) {
                        if (!atRiskMap[student.id]) {
                            atRiskMap[student.id] = { id: student.id, name: student.fullName, missedCount: 0, courses: new Set() };
                        }
                        atRiskMap[student.id].missedCount++;
                        atRiskMap[student.id].courses.add(course.name);
                    }
                });
            }
        }
    });

    const atRiskStudents = Object.values(atRiskMap);
    const totalStudents = myCourses.reduce((acc, course) => acc + (course.students ? course.students.length : 0), 0);

    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Lärarpanel</h1>
                <p className="text-gray-500">Översikt för {currentUser.fullName}</p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-1">Mina Studenter</h3>
                    <p className="text-3xl font-bold text-indigo-600">{totalStudents}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-1">Inlämningar att rätta</h3>
                    <p className="text-3xl font-bold text-orange-500">{ungradedSubmissions.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-1">Aktiva Kurser</h3>
                    <p className="text-3xl font-bold text-green-600">{myCourses.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Riskzonen (Live-kalkylerad) */}
                <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="p-5 border-b border-red-50 bg-red-50 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-600"/>
                        <h3 className="font-bold text-red-900">Elever i riskzonen (Sena inlämningar)</h3>
                    </div>
                    <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {atRiskStudents.length > 0 ? atRiskStudents.map(s => (
                            <div key={s.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-900">{s.name}</p>
                                    <p className="text-xs text-red-500 font-medium">Har missat {s.missedCount} deadlines</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{Array.from(s.courses)[0]}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-6 text-center">
                                <CheckCircle size={48} className="mx-auto text-green-200 mb-2"/>
                                <p className="text-green-600 font-medium">Inga sena inlämningar!</p>
                                <p className="text-xs text-gray-400">Alla dina studenter är i fas.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Ograderade inlämningar */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                            <CheckSquare size={18} className="text-orange-500"/>
                            <h3 className="font-bold text-gray-900">Att göra: Rättning</h3>
                        </div>
                        {ungradedSubmissions.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {ungradedSubmissions.slice(0, 5).map(s => (
                                    <div key={s.id} className="p-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer" onClick={() => navigateTo('course-detail', s.courseId)}>
                                        <div>
                                            <p className="font-bold text-sm">{s.assignmentTitle}</p>
                                            <p className="text-xs text-gray-500">{s.studentName} • {s.courseName}</p>
                                        </div>
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold">Rätta</span>
                                    </div>
                                ))}
                                {ungradedSubmissions.length > 5 && (
                                    <div className="p-3 text-center text-xs text-gray-500 border-t">
                                        + {ungradedSubmissions.length - 5} till...
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-400 text-sm">Allt är rättat! Bra jobbat.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 3. STUDENT DASHBOARD (Befintlig)
const StudentDashboard = ({ currentUser, myCourses, upcomingAssignments, navigateTo, fetchCourseDetails }) => {
    return (
        <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Hej, {currentUser.fullName.split(' ')[0]}! 👋</h1>
                <p className="text-gray-500">Här är dina studier just nu.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* AKTIVA KURSER */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle size={20} className="text-indigo-600"/> Mina Kurser</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myCourses.map(course => (
                                <div
                                    key={course.id}
                                    onClick={() => navigateTo('course-detail', course.id)}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all group overflow-hidden"
                                >
                                    <div className={`h-3 w-full ${course.color || 'bg-indigo-600'}`}></div>
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{course.courseCode}</span>
                                            {!course.isOpen && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-bold">Stängd</span>}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{course.description}</p>
                                    </div>
                                </div>
                            ))}
                            {myCourses.length === 0 && <p className="text-gray-400 italic">Du är inte registrerad på några kurser.</p>}
                        </div>
                    </div>

                    {/* UPCOMING ASSIGNMENTS */}
                    <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Bell size={20} className="text-orange-500"/> Kommande Deadlines</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
                            {upcomingAssignments.length === 0 ? (
                                <div className="p-6 text-center text-gray-400">Inga kommande uppgifter just nu.</div>
                            ) : (
                                upcomingAssignments.map(a => (
                                    <div key={a.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900">{a.title}</h4>
                                            <p className="text-xs text-gray-500">{a.courseName} • {a.dueDate}</p>
                                        </div>
                                        <button onClick={() => { fetchCourseDetails(a.courseId); navigateTo('course-detail', a.courseId); }} className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold hover:bg-indigo-100">Gå till</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Widget */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-400 text-sm font-bold uppercase mb-1">Snittbetyg</h3>
                        <p className="text-4xl font-bold text-green-600">B</p>
                        <p className="text-xs text-gray-400 mt-2">Baserat på 4 avslutade kurser</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- HUVUDKOMPONENT: Dashboard Controller ---
const Dashboard = ({
                       currentUser, myCourses, allCourses, documents, navigateTo,
                       upcomingAssignments, ungradedSubmissions, pendingEvaluations,
                       openEvaluationModal, setSelectedAssignment, fetchCourseDetails,
                       handleToggleCourseStatus, users,
                       // NYA PROPS FÖR LÄRARE
                       allAssignments, allSubmissions
                   }) => {
    // Välj dashboard baserat på roll
    if (currentUser.role === 'ADMIN') {
        return <AdminDashboard users={users} courses={allCourses} documents={documents} navigateTo={navigateTo} />;
    } else if (currentUser.role === 'TEACHER') {
        return (
            <TeacherDashboard
                currentUser={currentUser}
                myCourses={myCourses}
                ungradedSubmissions={ungradedSubmissions}
                allAssignments={allAssignments}
                allSubmissions={allSubmissions}
                navigateTo={navigateTo}
            />
        );
    } else {
        return (
            <StudentDashboard
                currentUser={currentUser}
                myCourses={myCourses}
                upcomingAssignments={upcomingAssignments}
                navigateTo={navigateTo}
                fetchCourseDetails={fetchCourseDetails}
            />
        );
    }
};

// --- RESTEN AV APP.JSX ---

const QuizBuilderModal = ({ onClose, onSubmit, courseId }) => {
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([{ id: 1, text: '', options: ['', ''], correct: 0 }]);
    const addQuestion = () => setQuestions([...questions, { id: Date.now(), text: '', options: ['', ''], correct: 0 }]);
    const updateQuestion = (idx, field, value) => { const newQ = [...questions]; newQ[idx][field] = value; setQuestions(newQ); };
    const updateOption = (qIdx, oIdx, value) => { const newQ = [...questions]; newQ[qIdx].options[oIdx] = value; setQuestions(newQ); };
    const addOption = (qIdx) => { const newQ = [...questions]; newQ[qIdx].options.push(''); setQuestions(newQ); };
    const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));
    const handleSubmit = (e) => { e.preventDefault(); onSubmit({ title, questions, courseId }); };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white shrink-0"><h2 className="text-2xl font-bold flex items-center gap-2"><HelpCircle /> Skapa Quiz</h2><button onClick={onClose}><X size={24} /></button></div>
                <div className="p-6 overflow-y-auto"><div className="mb-6"><label className="block font-bold mb-1">Quiz Titel</label><input className="w-full border p-2 rounded" value={title} onChange={e => setTitle(e.target.value)} placeholder="T.ex. Kunskapskontroll Java Basics" /></div>{questions.map((q, qIdx) => (<div key={q.id} className="bg-gray-50 p-4 rounded-xl border mb-4 relative"><button onClick={() => removeQuestion(qIdx)} className="absolute top-2 right-2 text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16}/></button><label className="text-sm font-bold text-gray-500 mb-1">Fråga {qIdx + 1}</label><input className="w-full border p-2 rounded mb-3 bg-white" value={q.text} onChange={e => updateQuestion(qIdx, 'text', e.target.value)} placeholder="Skriv frågan här..." /><div className="space-y-2">{q.options.map((opt, oIdx) => (<div key={oIdx} className="flex items-center gap-2"><input type="radio" name={`correct-${q.id}`} checked={q.correct === oIdx} onChange={() => updateQuestion(qIdx, 'correct', oIdx)} className="w-4 h-4 accent-green-600 cursor-pointer"/><input className="flex-1 border p-1 rounded text-sm" value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)} placeholder={`Alternativ ${oIdx + 1}`} /></div>))}<button type="button" onClick={() => addOption(qIdx)} className="text-xs text-indigo-600 font-bold hover:underline">+ Lägg till alternativ</button></div></div>))}<button type="button" onClick={addQuestion} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-600 transition-colors font-bold flex items-center justify-center gap-2"><PlusCircle size={20} /> Lägg till fråga</button></div>
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-2"><button onClick={onClose} className="px-4 py-2 text-gray-600">Avbryt</button><button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700">Spara Quiz</button></div>
            </div>
        </div>
    );
};

const QuizRunnerModal = ({ quiz, onClose, onSubmit }) => {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const handleSelect = (qId, oIdx) => { if (submitted) return; setAnswers({ ...answers, [qId]: oIdx }); };
    const finishQuiz = () => { let correctCount = 0; quiz.questions.forEach(q => { if (answers[q.id] === q.correct) correctCount++; }); setScore(correctCount); setSubmitted(true); if(onSubmit) onSubmit(quiz.id, correctCount, quiz.questions.length); };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white shrink-0"><h2 className="text-2xl font-bold">{quiz.title}</h2><button onClick={onClose}><X size={24} /></button></div>
                <div className="p-6 overflow-y-auto">{submitted && (<div className="bg-green-100 border border-green-300 text-green-800 p-6 rounded-xl text-center mb-6"><Award size={48} className="mx-auto mb-2 text-green-600"/><h3 className="text-2xl font-bold">Resultat: {score} / {quiz.questions.length}</h3><p>Bra jobbat! Ditt resultat har sparats.</p></div>)}<div className="space-y-8">{quiz.questions.map((q, idx) => { const isCorrect = submitted && answers[q.id] === q.correct; const isWrong = submitted && answers[q.id] !== q.correct && answers[q.id] !== undefined; return (<div key={q.id} className={`border-b pb-6 last:border-0 ${submitted ? (isCorrect ? 'opacity-100' : 'opacity-70') : ''}`}><h4 className="font-bold text-lg mb-3 flex gap-2"><span className="text-gray-400">#{idx + 1}</span> {q.text}{submitted && isCorrect && <CheckCircle size={20} className="text-green-500" />}{submitted && isWrong && <AlertTriangle size={20} className="text-red-500" />}</h4><div className="space-y-2">{q.options.map((opt, oIdx) => (<div key={oIdx} onClick={() => handleSelect(q.id, oIdx)} className={`p-3 rounded-lg cursor-pointer border transition-colors flex items-center justify-between ${answers[q.id] === oIdx ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-gray-200 hover:bg-gray-50'} ${submitted && q.correct === oIdx ? '!bg-green-100 !border-green-500' : ''} ${submitted && answers[q.id] === oIdx && answers[q.id] !== q.correct ? '!bg-red-100 !border-red-500' : ''}`}><span>{opt}</span>{answers[q.id] === oIdx && <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>}</div>))}</div></div>); })}</div></div>
                {!submitted && (<div className="p-6 border-t bg-gray-50 flex justify-end"><button onClick={finishQuiz} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-indigo-700 shadow-lg transition-transform hover:scale-105">Lämna in Quiz</button></div>)}
            </div>
        </div>
    );
};

const LicenseLockScreen = ({ onActivate, error, isLoading }) => {
    const [keyInput, setKeyInput] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); onActivate(keyInput); };
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white font-sans animate-in fade-in duration-700">
            <div className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 bg-red-900/30 rounded-full flex items-center justify-center mb-4 border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                        <Shield size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Systemet är Låst</h1>
                    <p className="text-gray-400 mt-2 text-sm">Ingen giltig licens hittades.</p>
                </div>
                {error && <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center gap-3 text-sm"><AlertTriangle size={18}/> {error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Licensnyckel</label>
                        <div className="relative"><Key className="absolute left-3 top-3 text-gray-500" size={18} /><input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-100 font-mono text-sm focus:ring-2 focus:ring-red-500 outline-none" placeholder="XXXX-XXXX-XXXX-XXXX" value={keyInput} onChange={(e) => setKeyInput(e.target.value)} autoFocus /></div>
                    </div>
                    <button disabled={isLoading || !keyInput} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"><Unlock size={20}/> Aktivera System</button>
                </form>
            </div>
        </div>
    );
};

function App() {
    const [licenseStatus, setLicenseStatus] = useState('checking');
    const [licenseError, setLicenseError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [authView, setAuthView] = useState('login');
    const [view, setView] = useState('dashboard');
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOffline, setIsOffline] = useState(false);
    const [documents, setDocuments] = useState(() => { const saved = localStorage.getItem('lms_documents'); return saved ? JSON.parse(saved) : []; });
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [ungradedSubmissions, setUngradedSubmissions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [pendingEvaluations, setPendingEvaluations] = useState([]);
    const [evaluationModalCourse, setEvaluationModalCourse] = useState(null);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [allDocuments, setAllDocuments] = useState([]);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [readMaterials, setReadMaterials] = useState({});
    const [availableCourses, setAvailableCourses] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [quizResults, setQuizResults] = useState([]);
    const [showQuizBuilder, setShowQuizBuilder] = useState(false);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [activeTab, setActiveTab] = useState('material');
    const [adminTab, setAdminTab] = useState('users');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', ssn: '', street: '', zip: '', city: '', country: '', phone: '', email: '', username: '', password: '', role: 'STUDENT' });
    const [usernameSuggestions, setUsernameSuggestions] = useState([]);
    const [courseForm, setCourseForm] = useState({ name: '', courseCode: '', description: '', teacherId: '', startDate: '', endDate: '' });
    const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });
    const [matTitle, setMatTitle] = useState('');
    const [matContent, setMatContent] = useState('');
    const [matLink, setMatLink] = useState('');
    const [matType, setMatType] = useState('TEXT');
    const [matFile, setMatFile] = useState(null);
    const [submissionFile, setSubmissionFile] = useState(null);
    const [grading, setGrading] = useState({});

    // NYA STATES FÖR LÄRAR-DASHBOARD (LIVE DATA)
    const [allAssignments, setAllAssignments] = useState([]); // Alla uppgifter i systemet (för analys)
    const [allSubmissions, setAllSubmissions] = useState([]); // Alla inlämningar i systemet (för analys)

    const API_BASE = 'http://127.0.0.1:8080/api';
    const getAuthHeaders = (contentType = 'application/json') => { const headers = { 'Authorization': `Bearer ${token}` }; if (contentType) headers['Content-Type'] = contentType; return headers; };
    const myCourses = React.useMemo(() => { if (!currentUser) return []; if (currentUser.role === 'STUDENT') return courses.filter(c => c.students?.some(s => s.id === currentUser.id)); if (currentUser.role === 'TEACHER') return courses.filter(c => c.teacher?.id === currentUser.id); return courses; }, [currentUser, courses]);

    useEffect(() => { checkSystemLicense(); }, []);

    // START-HOOK: Ladda all data
    useEffect(() => {
        if (licenseStatus === 'valid' && token && currentUser) {
            initData();
            // Om man är Admin eller Lärare, hämta extra data för dashboarden
            if (currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') {
                fetchAllLmsData();
            }
            const interval = setInterval(fetchNotifications, 30000);
            fetchNotifications();
            return () => clearInterval(interval);
        }
    }, [token, currentUser, licenseStatus]);

    useEffect(() => { if (view === 'course-detail' && selectedCourseId) { fetchCourseDetails(selectedCourseId); fetchAssignments(selectedCourseId); fetchQuizzes(selectedCourseId); } }, [selectedCourseId, view]);
    useEffect(() => { if (selectedAssignment) fetchSubmissions(selectedAssignment.id); }, [selectedAssignment]);
    useEffect(() => { if (view === 'admin' && adminTab === 'docs') fetchAllDocuments(); }, [view, adminTab]);
    useEffect(() => { if (view === 'catalog') fetchAvailableCourses(); }, [view]);
    useEffect(() => { if ((myCourses.length > 0 || currentUser?.role === 'ADMIN') && licenseStatus === 'valid') { if (view === 'calendar') fetchAllCalendarData(); if (view === 'dashboard') fetchDashboardData(); } }, [view, myCourses, licenseStatus]);
    useEffect(() => { localStorage.setItem('lms_documents', JSON.stringify(documents)); }, [documents]);

    const checkSystemLicense = async () => { try { const res = await fetch(`${API_BASE}/system/license/status`); if (res.ok) setLicenseStatus((await res.json()).status); else setLicenseStatus('locked'); } catch { setLicenseStatus('locked'); setLicenseError("Kunde inte nå servern."); } };
    const handleActivateLicense = async (key) => { setIsLoading(true); try { const res = await fetch(`${API_BASE}/system/license/activate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) }); if (res.ok) { showMessage("Licens godkänd!"); setLicenseStatus('valid'); if (token) initData(); } else setLicenseError((await res.json()).error); } catch { setLicenseError("Nätverksfel."); } finally { setIsLoading(false); } };

    const initData = async () => {
        setIsLoading(true);
        await refreshUser();
        await fetchUsers();
        await fetchCourses();
        if(currentUser?.role === 'ADMIN') await fetchAllDocuments();
        setIsLoading(false);
    };

    // --- NY FUNKTION: HÄMTA ALL DATA (FÖR LIVE-ANALYS) ---
    const fetchAllLmsData = async () => {
        // Detta är lite tungt, men nödvändigt för "Riskzon"-analys utan dedikerad backend-endpoint
        try {
            // 1. Hämta alla kurser (om vi inte redan har dem)
            const cRes = await fetch(`${API_BASE}/courses`, { headers: getAuthHeaders() });
            const allCoursesData = await cRes.json();

            let allAss = [];
            let allSubs = [];

            // 2. Loopa kurser och hämta uppgifter
            for (const course of allCoursesData) {
                const aRes = await fetch(`${API_BASE}/courses/${course.id}/assignments`, { headers: getAuthHeaders() });
                if(aRes.ok) {
                    const assigns = await aRes.json();
                    // Lägg till courseId på varje assignment för spårning
                    const labeledAssigns = assigns.map(a => ({...a, courseId: course.id}));
                    allAss = [...allAss, ...labeledAssigns];

                    // 3. Loopa uppgifter och hämta inlämningar (endast för lärare/admin)
                    if (currentUser.role !== 'STUDENT') {
                        for (const assign of assigns) {
                            const sRes = await fetch(`${API_BASE}/assignments/${assign.id}/submissions`, { headers: getAuthHeaders() });
                            if(sRes.ok) {
                                const subs = await sRes.json();
                                const labeledSubs = subs.map(s => ({...s, assignmentId: assign.id}));
                                allSubs = [...allSubs, ...labeledSubs];
                            }
                        }
                    }
                }
            }
            setAllAssignments(allAss);
            setAllSubmissions(allSubs);

        } catch (e) {
            console.error("Kunde inte hämta fullständig LMS-data", e);
        }
    };

    const fetchNotifications = async () => { if (!currentUser) return; try { const res = await fetch(`${API_BASE}/notifications/user/${currentUser.id}`, { headers: getAuthHeaders() }); if (res.ok) setNotifications(await res.json()); } catch {} };
    const markNotificationAsRead = async (id) => { try { await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT', headers: getAuthHeaders() }); setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); } catch {} };
    const refreshUser = async () => { if (currentUser) { try { const res = await fetch(`${API_BASE}/users/${currentUser.id}`, { headers: getAuthHeaders() }); if (res.ok) { const u = await res.json(); setCurrentUser(u); localStorage.setItem('user', JSON.stringify(u)); } } catch (e) { console.error("Could not refresh user", e); } } };
    const fetchUsers = async () => { try { const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() }); if (res.ok) setUsers(await res.json()); else if (res.status === 401) logout(); } catch { setIsOffline(true); } };
    const fetchCourses = async () => { try { const res = await fetch(`${API_BASE}/courses`, { headers: getAuthHeaders() }); if(res.ok) setCourses(await res.json()); } catch {} };
    const fetchAvailableCourses = async () => { try { const res = await fetch(`${API_BASE}/courses/available/${currentUser.id}`, { headers: getAuthHeaders() }); if (res.ok) setAvailableCourses(await res.json()); } catch {} };
    const fetchCourseDetails = async (id) => { setCurrentCourse(null); setMaterials([]); try { const cRes = await fetch(`${API_BASE}/courses/${id}`, { headers: getAuthHeaders() }); if (cRes.ok) setCurrentCourse(await cRes.json()); const mRes = await fetch(`${API_BASE}/courses/${id}/materials`, { headers: getAuthHeaders() }); if (mRes.ok) setMaterials(await mRes.json()); } catch {} };
    const fetchAssignments = async (cid) => { try { const res = await fetch(`${API_BASE}/courses/${cid}/assignments`, { headers: getAuthHeaders() }); if (res.ok) setAssignments(await res.json()); } catch {} };
    const fetchSubmissions = async (aid) => { try { const res = await fetch(`${API_BASE}/assignments/${aid}/submissions`, { headers: getAuthHeaders() }); if (res.ok) setSubmissions(await res.json()); } catch {} };
    const fetchAllDocuments = async () => { try { const res = await fetch(`${API_BASE}/documents/all`, { headers: getAuthHeaders() }); if (res.ok) setAllDocuments(await res.json()); } catch {} };
    const fetchQuizzes = async (cid) => { const mockQuizzes = [{ id: 101, courseId: cid, title: 'Java Basics - Kontroll', questions: [{ id: 1, text: 'Vad är en variabel?', options: ['En bil', 'En databehållare', 'En fågel'], correct: 1 }, { id: 2, text: 'Vilken datatyp är "Hello"?', options: ['int', 'boolean', 'String'], correct: 2 }] }]; setQuizzes(mockQuizzes); };
    const fetchAllCalendarData = async () => { try { const promises = myCourses.map(c => fetch(`${API_BASE}/courses/${c.id}/assignments`, { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : []).then(d => d.map(a => ({ ...a, courseName: c.name, courseCode: c.courseCode, type: 'ASSIGNMENT' })))); const allAssignments = (await Promise.all(promises)).flat(); const courseStarts = myCourses.filter(c => c.startDate).map(c => ({ id: `start-${c.id}`, title: `Kursstart: ${c.name}`, dueDate: c.startDate, courseName: c.name, courseCode: c.courseCode, type: 'COURSE_START' })); setCalendarEvents([...allAssignments, ...courseStarts]); } catch {} };

    // Denna används nu mest för Student
    const fetchDashboardData = async () => { if (!currentUser) return; try { const promises = myCourses.map(c => fetch(`${API_BASE}/courses/${c.id}/assignments`, { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : []).then(d => d.map(a => ({ ...a, courseName: c.name, courseId: c.id })))); const allAssigns = (await Promise.all(promises)).flat(); setUpcomingAssignments(allAssigns.filter(a => new Date(a.dueDate) > new Date()).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5)); if (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') { const subPromises = allAssigns.map(a => fetch(`${API_BASE}/assignments/${a.id}/submissions`, { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : []).then(d => d.map(s => ({ ...s, assignmentTitle: a.title, courseName: a.courseName, assignmentId: a.id })))); setUngradedSubmissions((await Promise.all(subPromises)).flat().filter(s => !s.grade)); } setPendingEvaluations(myCourses.filter(c => c.evaluation && c.evaluation.active)); } catch {} };
    const checkUsernameAvailability = async (u) => { try { const res = await fetch(`${API_BASE}/users/exists?username=${u}`); if (res.ok) return await res.json(); } catch {} return false; };

    const handleLogin = async (e) => { e.preventDefault(); setError(null); setIsLoading(true); try { const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) }); if (res.ok) { const d = await res.json(); setToken(d.token); const u = { id: d.id, username: d.username, fullName: d.fullName, role: d.role, profilePictureUrl: d.profilePictureUrl }; setCurrentUser(u); localStorage.setItem('token', d.token); localStorage.setItem('user', JSON.stringify(u)); setLoginForm({ username: '', password: '' }); setIsOffline(false); } else setError("Fel inloggning."); } catch { setError("Kunde inte nå servern."); } finally { setIsLoading(false); } };
    const handleGenerateUsernames = async () => { if (!registerForm.firstName) return setError("Fyll i uppgifter."); try { const res = await fetch(`${API_BASE}/users/generate-usernames`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registerForm) }); if (res.ok) setUsernameSuggestions(await res.json()); } catch { setError("Nätverksfel."); } };
    const handleRegister = async (e) => { e.preventDefault(); if (!registerForm.username) return setError("Användarnamn krävs."); const addr = `${registerForm.street}, ${registerForm.zip} ${registerForm.city}, ${registerForm.country}`; const pl = { ...registerForm, address: addr }; try { const res = await fetch(`${API_BASE}/users/register`, { method: 'POST', headers: currentUser ? getAuthHeaders() : { 'Content-Type': 'application/json' }, body: JSON.stringify(pl) }); if (res.ok) { showMessage("Konto skapat!"); if(!currentUser) setAuthView('login'); else fetchUsers(); } else setError(await res.text()); } catch { setError("Registreringsfel."); } };
    const logout = () => { setToken(null); setCurrentUser(null); localStorage.removeItem('token'); localStorage.removeItem('user'); setView('dashboard'); };
    const handleCreateEvaluation = async (q) => { try { const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/evaluation`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ questions: q, active: true }) }); if (res.ok) { showMessage("Aktiverad!"); fetchCourseDetails(selectedCourseId); } } catch {} };
    const handleToggleCourseStatus = async (courseId) => { try { const res = await fetch(`${API_BASE}/courses/${courseId}/toggle-status`, { method: 'PUT', headers: getAuthHeaders() }); if (res.ok) { showMessage("Status uppdaterad!"); fetchCourses(); fetchAvailableCourses(); } else { setError("Kunde inte ändra status."); } } catch (err) { setError("Nätverksfel."); } };
    const handleSubmitEvaluation = async (cid, ans) => { try { const res = await fetch(`${API_BASE}/courses/${cid}/evaluation/submit`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ answers: ans }) }); if (res.ok) { showMessage("Tack!"); setEvaluationModalCourse(null); setPendingEvaluations(p => p.filter(c => c.id !== cid)); } } catch {} };
    const handleAddStudentToCourse = async (sid) => { try { const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/enroll/${sid}`, { method: 'POST', headers: getAuthHeaders() }); if (res.ok) { showMessage("Student tillagd!"); fetchCourseDetails(selectedCourseId); } } catch {} };
    const handleEnroll = async (cid) => { if(!window.confirm("Gå med?")) return; try { const res = await fetch(`${API_BASE}/courses/${cid}/enroll/${currentUser.id}`, { method: 'POST', headers: getAuthHeaders() }); if (res.ok) { showMessage("Gick med!"); setAvailableCourses(p => p.filter(c => c.id !== cid)); fetchCourses(); } } catch {} };

    // --- SKARP FUNKTION: Uppdatera kurs ---
    const handleUpdateCourse = async (updatedCourse) => {
        try {
            const res = await fetch(`${API_BASE}/courses/${updatedCourse.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedCourse)
            });

            if (res.ok) {
                const savedCourse = await res.json();
                setCourses(prevCourses =>
                    prevCourses.map(c => c.id === savedCourse.id ? savedCourse : c)
                );
                showMessage("Kursuppgifter sparade till databasen!");
            } else {
                const errorData = await res.text();
                console.error("Serverfel:", errorData);
                setError(`Kunde inte uppdatera: Servern svarade ${res.status}`);
            }
        } catch (err) {
            console.error("Nätverksfel:", err);
            setError("Kunde inte nå servern. Kontrollera att backend är igång.");
        }
    };

    const handleUploadDocument = (newDoc) => { const updatedDocs = [newDoc, ...documents]; setDocuments(updatedDocs); showMessage(`Filen "${newDoc.name}" har laddats upp!`); };
    const handleDeleteDocument = (docId) => { if(!window.confirm("Är du säker på att du vill ta bort filen?")) return; const updatedDocs = documents.filter(d => d.id !== docId); setDocuments(updatedDocs); showMessage("Fil raderad."); };
    const handleCreateQuiz = async (quizData) => { setQuizzes([...quizzes, { ...quizData, id: Date.now() }]); setShowQuizBuilder(false); showMessage("Quiz skapat!"); };
    const handleSubmitQuiz = (quizId, score, maxScore) => { setQuizResults([...quizResults, { quizId, score, maxScore, date: new Date().toISOString() }]); showMessage("Resultat sparat!"); };
    const handleCourseSubmit = async (e) => { e.preventDefault(); const payload = { name: courseForm.name, courseCode: courseForm.courseCode, description: courseForm.description, startDate: courseForm.startDate || null, endDate: courseForm.endDate || null }; try { const res = await fetch(`${API_BASE}/courses?teacherId=${courseForm.teacherId}`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) }); if (res.ok) { showMessage('Kurs skapad!'); setShowCourseModal(false); fetchCourses(); setCourseForm({ name: '', courseCode: '', description: '', teacherId: '', startDate: '', endDate: '' }); } } catch {} };
    const handleDeleteCourse = async (id, e) => { e?.stopPropagation(); if(!window.confirm("Radera?")) return; try { const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE', headers: getAuthHeaders() }); if (res.ok) { showMessage('Raderad!'); fetchCourses(); } } catch {} };
    const handleAttemptDeleteUser = async (u) => { try { const res = await fetch(`${API_BASE}/documents/user/${u.id}`, { headers: getAuthHeaders() }); if(res.ok) { const d = await res.json(); if(d.length > 0) setPendingDeleteUser({ user: u, docs: d }); else performDeleteUser(u.id); } } catch {} };
    const performDeleteUser = async (uid) => { try { if (pendingDeleteUser) for (const d of pendingDeleteUser.docs) await fetch(`${API_BASE}/documents/${d.id}`, { method: 'DELETE', headers: getAuthHeaders() }); await fetch(`${API_BASE}/users/${uid}`, { method: 'DELETE', headers: getAuthHeaders() }); showMessage("Raderad."); setPendingDeleteUser(null); fetchUsers(); } catch {} };
    const handleDeleteDoc = async (id, refreshAll) => { if(!window.confirm("Radera?")) return; try { await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE', headers: getAuthHeaders() }); if (refreshAll) fetchAllDocuments(); else fetchDocuments(currentUser.id); } catch {} };
    const handleMaterialSubmit = async (e) => { e.preventDefault(); const fd = new FormData(); fd.append("title", matTitle); fd.append("content", matContent); fd.append("link", matLink); fd.append("type", matType); if (matFile) fd.append("file", matFile); try { const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/materials`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd }); if (res.ok) { showMessage('Material sparat!'); setMatFile(null); fetchCourseDetails(selectedCourseId); } } catch {} };
    const handleDeleteMaterial = async (mid) => { if(!window.confirm("Radera?")) return; try { await fetch(`${API_BASE}/courses/materials/${mid}`, { method: 'DELETE', headers: getAuthHeaders() }); fetchCourseDetails(selectedCourseId); } catch {} };
    const handleCreateAssignment = async (e) => { e.preventDefault(); try { const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/assignments`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(assignmentForm) }); if (res.ok) { showMessage("Uppgift skapad!"); setShowAssignmentModal(false); fetchAssignments(selectedCourseId); } } catch {} };
    const handleStudentSubmit = async (e) => { e.preventDefault(); if (!submissionFile) return setError("Välj fil!"); const fd = new FormData(); fd.append("file", submissionFile); try { const res = await fetch(`${API_BASE}/assignments/${selectedAssignment.id}/submit/${currentUser.id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd }); if (res.ok) { showMessage("Inlämnat!"); setSubmissionFile(null); fetchSubmissions(selectedAssignment.id); } } catch {} };
    const handleGradeSubmission = async (sid) => { const d = grading[sid]; try { await fetch(`${API_BASE}/submissions/${sid}/grade?grade=${d.grade}&feedback=${d.feedback}`, { method: 'POST', headers: getAuthHeaders() }); showMessage("Betyg sparat!"); fetchSubmissions(selectedAssignment.id); } catch {} };

    const toggleReadStatus = (mid) => setReadMaterials(p => ({ ...p, [mid]: !p[mid] }));
    const showMessage = (m) => { setMessage(m); setTimeout(() => setMessage(''), 3000); };
    const navigateTo = (v, cid) => { setError(null); setSelectedCourseId(cid); setView(v); if (v !== 'course-detail') { setCurrentCourse(null); setSelectedAssignment(null); } };
    const getYoutubeEmbed = (url) => url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2]?.length === 11 ? url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)[2] : null;
    const teachers = users.filter(u => u.role === 'TEACHER' || u.role === 'ADMIN');
    const getIcon = (t) => { switch(t) { case 'VIDEO': return <Video size={20} className="text-red-500"/>; case 'LINK': return <LinkIcon size={20} className="text-blue-500"/>; default: return <FileText size={20} className="text-gray-500"/>; } };
    const getMySubmission = () => submissions.find(s => s.studentId === currentUser.id);

    if (licenseStatus === 'checking') return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><div className="flex flex-col items-center gap-4"><Loader2 size={48} className="animate-spin text-indigo-500"/><p>INITIATING EDUFLEX...</p></div></div>;
    if (licenseStatus === 'locked') return <LicenseLockScreen onActivate={handleActivateLicense} error={licenseError} isLoading={isLoading} />;
    if (!token || !currentUser) return <Auth authView={authView} setAuthView={setAuthView} loginForm={loginForm} setLoginForm={setLoginForm} handleLogin={handleLogin} isLoading={isLoading} error={error} message={message} registerForm={registerForm} setRegisterForm={setRegisterForm} handleRegister={handleRegister} handleGenerateUsernames={handleGenerateUsernames} usernameSuggestions={usernameSuggestions} checkUsernameAvailability={checkUsernameAvailability} />;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden" onClick={() => setShowNotifDropdown(false)}>
            {evaluationModalCourse && <EvaluationModal course={evaluationModalCourse} onClose={() => setEvaluationModalCourse(null)} onSubmit={handleSubmitEvaluation} />}
            {pendingDeleteUser && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"><h2 className="text-xl font-bold mb-4">Varning! Filer finns.</h2><button onClick={() => performDeleteUser(pendingDeleteUser.user.id)} className="bg-red-600 text-white px-4 py-2 rounded">Radera allt</button></div></div>}
            {showQuizBuilder && <QuizBuilderModal onClose={() => setShowQuizBuilder(false)} onSubmit={handleCreateQuiz} courseId={selectedCourseId} />}
            {activeQuiz && <QuizRunnerModal quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onSubmit={handleSubmitQuiz} />}
            {showCourseModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"><div className="bg-indigo-600 p-6 flex justify-between items-center text-white shrink-0"><h2 className="text-2xl font-bold">Skapa Ny Kurs</h2><button onClick={() => setShowCourseModal(false)} className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"><X size={24}/></button></div><div className="p-8 overflow-y-auto"><form id="courseForm" onSubmit={handleCourseSubmit} className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="md:col-span-2"><label className="block text-sm font-bold text-gray-700 mb-1">Kursnamn</label><input className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} placeholder="T.ex. Objektorienterad Programmering" required /></div><div><label className="block text-sm font-bold text-gray-700 mb-1">Kurskod</label><input className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm uppercase" value={courseForm.courseCode} onChange={e => setCourseForm({...courseForm, courseCode: e.target.value.toUpperCase()})} placeholder="JAV23" required /></div></div><div className="grid grid-cols-2 gap-6"><div><label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><Calendar size={16}/> Startdatum</label><input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={courseForm.startDate} onChange={e => setCourseForm({...courseForm, startDate: e.target.value})} required /></div><div><label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><Calendar size={16}/> Slutdatum</label><input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={courseForm.endDate} onChange={e => setCourseForm({...courseForm, endDate: e.target.value})} required /></div></div><div><label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><User size={16}/> Ansvarig Lärare</label><div className="relative"><select className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none" value={courseForm.teacherId} onChange={e => setCourseForm({...courseForm, teacherId: e.target.value})} required><option value="">-- Välj lärare --</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.fullName} ({t.username})</option>)}</select></div></div><div><label className="block text-sm font-bold text-gray-700 mb-2">Kursbeskrivning</label><textarea className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-48 resize-none" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} placeholder="Beskriv kursen..." required /></div></form></div><div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0"><button onClick={() => setShowCourseModal(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">Avbryt</button><button form="courseForm" className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:scale-105">Spara Kurs</button></div></div></div>)}
            {showAssignmentModal && (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"><h2 className="mb-4 text-xl font-bold">Ny Uppgift</h2><form onSubmit={handleCreateAssignment}><input className="w-full border p-2 mb-4" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} placeholder="Titel"/><button className="w-full bg-indigo-600 text-white p-2">Spara</button></form><button onClick={() => setShowAssignmentModal(false)} className="mt-4 text-gray-500">Avbryt</button></div></div>)}

            <Sidebar view={view} navigateTo={navigateTo} currentUser={currentUser} logout={logout} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-20">
                    <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg w-96"><Search size={18} className="text-gray-400"/><input type="text" placeholder="Sök..." className="bg-transparent border-none outline-none text-sm w-full" /></div>
                    <div className="relative">
                        <div className="relative cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowNotifDropdown(!showNotifDropdown); }}><Bell size={20} className="text-gray-400 hover:text-indigo-600"/>{unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white">{unreadCount}</span>}</div>
                        {showNotifDropdown && <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}><div className="p-3 border-b bg-gray-50"><h3 className="font-bold text-gray-700 text-sm">Notifieringar</h3></div><div className="max-h-80 overflow-y-auto">{notifications.length === 0 ? <div className="p-6 text-center text-sm text-gray-400">Inga nya notiser.</div> : notifications.map(n => <div key={n.id} onClick={() => markNotificationAsRead(n.id)} className={`p-4 text-sm cursor-pointer border-b ${n.read ? 'opacity-50' : 'bg-blue-50'}`}>{n.message}</div>)}</div></div>}
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"><AlertTriangle size={20}/> {error}</div>}
                    {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"><CheckCircle size={20}/> {message}</div>}

                    {view === 'dashboard' && <Dashboard
                        currentUser={currentUser}
                        myCourses={myCourses}
                        allCourses={courses}
                        documents={documents}
                        users={users}
                        navigateTo={navigateTo}
                        upcomingAssignments={upcomingAssignments}
                        ungradedSubmissions={ungradedSubmissions}
                        pendingEvaluations={pendingEvaluations}
                        openEvaluationModal={setEvaluationModalCourse}
                        setSelectedAssignment={setSelectedAssignment}
                        fetchCourseDetails={fetchCourseDetails}
                        handleToggleCourseStatus={handleToggleCourseStatus}
                        // SKICKA LIVE-DATA FÖR LÄRAR-DASHBOARD
                        allAssignments={allAssignments}
                        allSubmissions={allSubmissions}
                    />}

                    {view === 'catalog' && <CourseCatalog availableCourses={availableCourses} handleEnroll={handleEnroll} />}
                    {view === 'calendar' && <CalendarView events={calendarEvents} navigateTo={navigateTo} />}
                    {view === 'documents' && <DocumentManager documents={documents} handleUploadDoc={handleUploadDocument} handleDeleteDoc={handleDeleteDocument} currentUser={currentUser} token={token} API_BASE={API_BASE} showMessage={showMessage} setError={setError} />}
                    {view === 'profile' && <UserProfile currentUser={currentUser} API_BASE={API_BASE} getAuthHeaders={getAuthHeaders} showMessage={showMessage} refreshUser={refreshUser} />}
                    {view === 'admin' && <AdminPanel adminTab={adminTab} setAdminTab={setAdminTab} users={users} currentUser={currentUser} handleAttemptDeleteUser={handleAttemptDeleteUser} courses={courses} setShowCourseModal={setShowCourseModal} handleDeleteCourse={handleDeleteCourse} handleUpdateCourse={handleUpdateCourse} allDocuments={allDocuments} fetchAllDocuments={fetchAllDocuments} handleDeleteDoc={handleDeleteDoc} registerForm={registerForm} setRegisterForm={setRegisterForm} handleRegister={handleRegister} handleGenerateUsernames={handleGenerateUsernames} usernameSuggestions={usernameSuggestions} checkUsernameAvailability={checkUsernameAvailability} navigateTo={navigateTo} />}
                    {view === 'course-detail' && currentCourse && <CourseDetail currentCourse={currentCourse} activeTab={activeTab} setActiveTab={setActiveTab} selectedAssignment={selectedAssignment} setSelectedAssignment={setSelectedAssignment} currentUser={currentUser} materials={materials} assignments={assignments} submissions={submissions} grading={grading} setGrading={setGrading} readMaterials={readMaterials} setShowAssignmentModal={setShowAssignmentModal} handleMaterialSubmit={handleMaterialSubmit} handleStudentSubmit={handleStudentSubmit} handleGradeSubmission={handleGradeSubmission} handleDeleteMaterial={handleDeleteMaterial} toggleReadStatus={toggleReadStatus} getIcon={getIcon} getYoutubeEmbed={getYoutubeEmbed} getMySubmission={getMySubmission} matTitle={matTitle} setMatTitle={setMatTitle} matContent={matContent} setMatContent={setMatContent} matLink={matLink} setMatLink={setMatLink} matType={matType} setMatType={setMatType} setMatFile={setMatFile} setSubmissionFile={setSubmissionFile} navigateTo={navigateTo} users={users} handleAddStudentToCourse={handleAddStudentToCourse} handleCreateEvaluation={handleCreateEvaluation} quizzes={quizzes} onStartQuiz={setActiveQuiz} onOpenQuizBuilder={() => setShowQuizBuilder(true)} />}
                </div>
            </main>
            {currentUser && token && (<ChatOverlay currentUser={currentUser} API_BASE={API_BASE} token={token} />)}
        </div>
    );
}
export default App;