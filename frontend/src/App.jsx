import React, { useState, useEffect } from 'react';
import {
    Search, Bell, AlertTriangle, CheckCircle, Video, Link as LinkIcon,
    FileText, X, File, Shield, Key, Lock, Unlock, Loader2, Info, Calendar, User
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import EvaluationModal from './components/EvaluationModal';
import ChatOverlay from './components/ChatOverlay'; // VIKTIGT: Importera chatten

import AdminPanel from './pages/AdminPanel';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import CourseCatalog from './pages/CourseCatalog';
import DocumentManager from './pages/DocumentManager';
import UserProfile from './pages/UserProfile';
import CalendarView from './pages/CalendarView';

// --- KOMPONENT: LICENS-LÅSSKÄRM ---
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
    // State
    const [licenseStatus, setLicenseStatus] = useState('checking');
    const [licenseError, setLicenseError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [authView, setAuthView] = useState('login');
    const [view, setView] = useState('dashboard');
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    // Data
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [ungradedSubmissions, setUngradedSubmissions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const [pendingEvaluations, setPendingEvaluations] = useState([]);
    const [evaluationModalCourse, setEvaluationModalCourse] = useState(null);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [allDocuments, setAllDocuments] = useState([]);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [readMaterials, setReadMaterials] = useState({});
    const [availableCourses, setAvailableCourses] = useState([]);

    // UI
    const [activeTab, setActiveTab] = useState('material');
    const [adminTab, setAdminTab] = useState('users');
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    // Forms
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', ssn: '', street: '', zip: '', city: '', country: '', phone: '', email: '', username: '', password: '', role: 'STUDENT' });
    const [usernameSuggestions, setUsernameSuggestions] = useState([]);

    // Kursformulär
    const [courseForm, setCourseForm] = useState({
        name: '', courseCode: '', description: '', teacherId: '', startDate: '', endDate: ''
    });

    const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });
    const [matTitle, setMatTitle] = useState('');
    const [matContent, setMatContent] = useState('');
    const [matLink, setMatLink] = useState('');
    const [matType, setMatType] = useState('TEXT');
    const [matFile, setMatFile] = useState(null);
    const [submissionFile, setSubmissionFile] = useState(null);
    const [grading, setGrading] = useState({});

    const API_BASE = 'http://127.0.0.1:8080/api';
    const getAuthHeaders = (contentType = 'application/json') => {
        const headers = { 'Authorization': `Bearer ${token}` };
        if (contentType) headers['Content-Type'] = contentType;
        return headers;
    };

    const myCourses = React.useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'STUDENT') return courses.filter(c => c.students?.some(s => s.id === currentUser.id));
        if (currentUser.role === 'TEACHER') return courses.filter(c => c.teacher?.id === currentUser.id);
        return courses;
    }, [currentUser, courses]);

    // Effects
    useEffect(() => { checkSystemLicense(); }, []);
    useEffect(() => {
        if (licenseStatus === 'valid' && token && currentUser) {
            initData();
            const interval = setInterval(fetchNotifications, 30000);
            fetchNotifications();
            return () => clearInterval(interval);
        }
    }, [token, currentUser, licenseStatus]);

    useEffect(() => { if (view === 'course-detail' && selectedCourseId) { fetchCourseDetails(selectedCourseId); fetchAssignments(selectedCourseId); } }, [selectedCourseId, view]);
    useEffect(() => { if (selectedAssignment) fetchSubmissions(selectedAssignment.id); }, [selectedAssignment]);
    useEffect(() => { if (view === 'admin' && adminTab === 'docs') fetchAllDocuments(); }, [view, adminTab]);
    useEffect(() => { if (view === 'catalog') fetchAvailableCourses(); }, [view]);
    useEffect(() => { if ((myCourses.length > 0 || currentUser?.role === 'ADMIN') && licenseStatus === 'valid') { if (view === 'calendar') fetchAllCalendarData(); if (view === 'dashboard') fetchDashboardData(); } }, [view, myCourses, licenseStatus]);

    // Fetching logic
    const checkSystemLicense = async () => { try { const res = await fetch(`${API_BASE}/system/license/status`); if (res.ok) setLicenseStatus((await res.json()).status); else setLicenseStatus('locked'); } catch { setLicenseStatus('locked'); setLicenseError("Kunde inte nå servern."); } };
    const handleActivateLicense = async (key) => { setIsLoading(true); try { const res = await fetch(`${API_BASE}/system/license/activate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) }); if (res.ok) { showMessage("Licens godkänd!"); setLicenseStatus('valid'); if (token) initData(); } else setLicenseError((await res.json()).error); } catch { setLicenseError("Nätverksfel."); } finally { setIsLoading(false); } };
    const initData = async () => { setIsLoading(true); await fetchUsers(); await fetchCourses(); setIsLoading(false); };
    const fetchNotifications = async () => { if (!currentUser) return; try { const res = await fetch(`${API_BASE}/notifications/user/${currentUser.id}`, { headers: getAuthHeaders() }); if (res.ok) setNotifications(await res.json()); } catch {} };
    const markNotificationAsRead = async (id) => { try { await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT', headers: getAuthHeaders() }); setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); } catch {} };
    const refreshUser = async () => { if (currentUser) { const res = await fetch(`${API_BASE}/users/${currentUser.id}`, { headers: getAuthHeaders() }); if (res.ok) { const u = await res.json(); setCurrentUser(u); localStorage.setItem('user', JSON.stringify(u)); } } };
    const fetchUsers = async () => { try { const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() }); if (res.ok) setUsers(await res.json()); else if (res.status === 401) logout(); } catch { setIsOffline(true); } };
    const fetchCourses = async () => { try { const res = await fetch(`${API_BASE}/courses`, { headers: getAuthHeaders() }); if(res.ok) setCourses(await res.json()); } catch {} };
    const fetchAvailableCourses = async () => { try { const res = await fetch(`${API_BASE}/courses/available/${currentUser.id}`, { headers: getAuthHeaders() }); if (res.ok) setAvailableCourses(await res.json()); } catch {} };
    const fetchCourseDetails = async (id) => { setCurrentCourse(null); setMaterials([]); try { const cRes = await fetch(`${API_BASE}/courses/${id}`, { headers: getAuthHeaders() }); if (cRes.ok) setCurrentCourse(await cRes.json()); const mRes = await fetch(`${API_BASE}/courses/${id}/materials`, { headers: getAuthHeaders() }); if (mRes.ok) setMaterials(await mRes.json()); } catch {} };
    const fetchAssignments = async (cid) => { try { const res = await fetch(`${API_BASE}/courses/${cid}/assignments`, { headers: getAuthHeaders() }); if (res.ok) setAssignments(await res.json()); } catch {} };
    const fetchSubmissions = async (aid) => { try { const res = await fetch(`${API_BASE}/assignments/${aid}/submissions`, { headers: getAuthHeaders() }); if (res.ok) setSubmissions(await res.json()); } catch {} };
    const fetchDocuments = async (uid) => { try { const res = await fetch(`${API_BASE}/documents/user/${uid}`, { headers: getAuthHeaders() }); if (res.ok) setDocuments(await res.json()); } catch {} };
    const fetchAllDocuments = async () => { try { const res = await fetch(`${API_BASE}/documents/all`, { headers: getAuthHeaders() }); if (res.ok) setAllDocuments(await res.json()); } catch {} };

    const fetchAllCalendarData = async () => { try { const promises = myCourses.map(c => fetch(`${API_BASE}/courses/${c.id}/assignments`, { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : []).then(d => d.map(a => ({ ...a, courseName: c.name, courseCode: c.courseCode, type: 'ASSIGNMENT' })))); const allAssignments = (await Promise.all(promises)).flat(); const courseStarts = myCourses.filter(c => c.startDate).map(c => ({ id: `start-${c.id}`, title: `Kursstart: ${c.name}`, dueDate: c.startDate, courseName: c.name, courseCode: c.courseCode, type: 'COURSE_START' })); setCalendarEvents([...allAssignments, ...courseStarts]); } catch {} };
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

    // --- SKAPA KURS ---
    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: courseForm.name,
            courseCode: courseForm.courseCode,
            description: courseForm.description,
            startDate: courseForm.startDate || null,
            endDate: courseForm.endDate || null
        };
        try {
            const res = await fetch(`${API_BASE}/courses?teacherId=${courseForm.teacherId}`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
            if (res.ok) {
                showMessage('Kurs skapad!');
                setShowCourseModal(false);
                fetchCourses();
                setCourseForm({ name: '', courseCode: '', description: '', teacherId: '', startDate: '', endDate: '' });
            }
        } catch {}
    };

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

            {showCourseModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white shrink-0">
                            <h2 className="text-2xl font-bold">Skapa Ny Kurs</h2>
                            <button onClick={() => setShowCourseModal(false)} className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors"><X size={24}/></button>
                        </div>
                        <div className="p-8 overflow-y-auto">
                            <form id="courseForm" onSubmit={handleCourseSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Kursnamn</label>
                                        <input className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} placeholder="T.ex. Objektorienterad Programmering" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Kurskod</label>
                                        <input className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm uppercase" value={courseForm.courseCode} onChange={e => setCourseForm({...courseForm, courseCode: e.target.value.toUpperCase()})} placeholder="JAV23" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><Calendar size={16}/> Startdatum</label><input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={courseForm.startDate} onChange={e => setCourseForm({...courseForm, startDate: e.target.value})} required /></div>
                                    <div><label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><Calendar size={16}/> Slutdatum</label><input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={courseForm.endDate} onChange={e => setCourseForm({...courseForm, endDate: e.target.value})} required /></div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2"><User size={16}/> Ansvarig Lärare</label>
                                    <div className="relative">
                                        <select className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none" value={courseForm.teacherId} onChange={e => setCourseForm({...courseForm, teacherId: e.target.value})} required>
                                            <option value="">-- Välj lärare --</option>
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName} ({t.username})</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Kursbeskrivning</label>
                                    <textarea
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-48 resize-none"
                                        value={courseForm.description}
                                        onChange={e => setCourseForm({...courseForm, description: e.target.value})}
                                        placeholder="Beskriv kursen..."
                                        required
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button onClick={() => setShowCourseModal(false)} className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">Avbryt</button>
                            <button form="courseForm" className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:scale-105">Spara Kurs</button>
                        </div>
                    </div>
                </div>
            )}

            {showAssignmentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"><div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"><h2 className="mb-4 text-xl font-bold">Ny Uppgift</h2><form onSubmit={handleCreateAssignment}><input className="w-full border p-2 mb-4" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} placeholder="Titel"/><button className="w-full bg-indigo-600 text-white p-2">Spara</button></form><button onClick={() => setShowAssignmentModal(false)} className="mt-4 text-gray-500">Avbryt</button></div></div>
            )}

            <Sidebar view={view} navigateTo={navigateTo} currentUser={currentUser} logout={logout} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-20">
                    <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg w-96"><Search size={18} className="text-gray-400"/><input type="text" placeholder="Sök..." className="bg-transparent border-none outline-none text-sm w-full" /></div>
                    <div className="relative">
                        <div className="relative cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowNotifDropdown(!showNotifDropdown); }}>
                            <Bell size={20} className="text-gray-400 hover:text-indigo-600"/>{unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white">{unreadCount}</span>}
                        </div>
                        {showNotifDropdown && <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}><div className="p-3 border-b bg-gray-50"><h3 className="font-bold text-gray-700 text-sm">Notifieringar</h3></div><div className="max-h-80 overflow-y-auto">{notifications.length === 0 ? <div className="p-6 text-center text-sm text-gray-400">Inga nya notiser.</div> : notifications.map(n => <div key={n.id} onClick={() => markNotificationAsRead(n.id)} className={`p-4 text-sm cursor-pointer border-b ${n.read ? 'opacity-50' : 'bg-blue-50'}`}>{n.message}</div>)}</div></div>}
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"><AlertTriangle size={20}/> {error}</div>}
                    {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"><CheckCircle size={20}/> {message}</div>}

                    {view === 'dashboard' && <Dashboard
                        currentUser={currentUser} myCourses={myCourses} allCourses={courses} documents={documents} navigateTo={navigateTo}
                        upcomingAssignments={upcomingAssignments} ungradedSubmissions={ungradedSubmissions}
                        pendingEvaluations={pendingEvaluations} openEvaluationModal={setEvaluationModalCourse}
                        setSelectedAssignment={setSelectedAssignment} fetchCourseDetails={fetchCourseDetails}
                        handleToggleCourseStatus={handleToggleCourseStatus}
                    />}

                    {view === 'catalog' && <CourseCatalog availableCourses={availableCourses} handleEnroll={handleEnroll} />}
                    {view === 'calendar' && <CalendarView events={calendarEvents} navigateTo={navigateTo} />}
                    {view === 'documents' && <DocumentManager documents={documents} handleDeleteDoc={handleDeleteDoc} currentUser={currentUser} token={token} API_BASE={API_BASE} fetchDocuments={fetchDocuments} showMessage={showMessage} setError={setError} />}
                    {view === 'profile' && <UserProfile currentUser={currentUser} API_BASE={API_BASE} getAuthHeaders={getAuthHeaders} showMessage={showMessage} refreshUser={refreshUser} />}
                    {view === 'admin' && <AdminPanel adminTab={adminTab} setAdminTab={setAdminTab} users={users} currentUser={currentUser} handleAttemptDeleteUser={handleAttemptDeleteUser} courses={courses} setShowCourseModal={setShowCourseModal} handleDeleteCourse={handleDeleteCourse} allDocuments={allDocuments} fetchAllDocuments={fetchAllDocuments} handleDeleteDoc={handleDeleteDoc} registerForm={registerForm} setRegisterForm={setRegisterForm} handleRegister={handleRegister} handleGenerateUsernames={handleGenerateUsernames} usernameSuggestions={usernameSuggestions} checkUsernameAvailability={checkUsernameAvailability} />}

                    {view === 'course-detail' && currentCourse && <CourseDetail
                        currentCourse={currentCourse} activeTab={activeTab} setActiveTab={setActiveTab}
                        selectedAssignment={selectedAssignment} setSelectedAssignment={setSelectedAssignment}
                        currentUser={currentUser} materials={materials} assignments={assignments}
                        submissions={submissions} grading={grading} setGrading={setGrading}
                        readMaterials={readMaterials} setShowAssignmentModal={setShowAssignmentModal}
                        handleMaterialSubmit={handleMaterialSubmit} handleStudentSubmit={handleStudentSubmit}
                        handleGradeSubmission={handleGradeSubmission} handleDeleteMaterial={handleDeleteMaterial}
                        toggleReadStatus={toggleReadStatus} getIcon={getIcon} getYoutubeEmbed={getYoutubeEmbed}
                        getMySubmission={getMySubmission} matTitle={matTitle} setMatTitle={setMatTitle}
                        matContent={matContent} setMatContent={setMatContent} matLink={matLink}
                        setMatLink={setMatLink} matType={matType} setMatType={setMatType}
                        setMatFile={setMatFile} setSubmissionFile={setSubmissionFile} navigateTo={navigateTo}
                        users={users} handleAddStudentToCourse={handleAddStudentToCourse}
                        handleCreateEvaluation={handleCreateEvaluation}
                    />}
                </div>
            </main>

            {/* CHATT OVERLAY */}
            {currentUser && token && (
                <ChatOverlay
                    currentUser={currentUser}
                    API_BASE={API_BASE}
                    token={token}
                />
            )}
        </div>
    );
}
export default App;