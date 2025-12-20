import React, { useState, useEffect } from 'react';
import { Search, Bell, AlertTriangle, CheckCircle, Video, Link as LinkIcon, FileText, X, File } from 'lucide-react';

// Importerar från komponent-mappen
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import EvaluationModal from './components/EvaluationModal'; // NY!

// Importerar från sid-mappen
import AdminPanel from './pages/AdminPanel';
import CourseDetail from './pages/CourseDetail';
import Dashboard from './pages/Dashboard';
import CourseCatalog from './pages/CourseCatalog';
import DocumentManager from './pages/DocumentManager';
import UserProfile from './pages/UserProfile';
import CalendarView from './pages/CalendarView';

function App() {
    // --- AUTH STATE ---
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [authView, setAuthView] = useState('login');

    // --- APP STATE ---
    const [view, setView] = useState('dashboard');
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    // Dashboard & Kalender Data
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [ungradedSubmissions, setUngradedSubmissions] = useState([]);

    // Utvärderings-state (NYTT)
    const [pendingEvaluations, setPendingEvaluations] = useState([]);
    const [evaluationModalCourse, setEvaluationModalCourse] = useState(null);

    // Modals
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [pendingDeleteUser, setPendingDeleteUser] = useState(null);

    // Data
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

    // UI State
    const [activeTab, setActiveTab] = useState('material');
    const [adminTab, setAdminTab] = useState('users');
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // Auth Forms
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });

    // Registrerings-state (med uppdelad adress)
    const [registerForm, setRegisterForm] = useState({
        firstName: '', lastName: '', ssn: '',
        street: '', zip: '', city: '', country: '',
        phone: '', email: '',
        username: '', password: '', role: 'STUDENT'
    });

    const [usernameSuggestions, setUsernameSuggestions] = useState([]);

    // Course & Assignment Forms
    const [courseForm, setCourseForm] = useState({ name: '', courseCode: '', description: '', teacherId: '', startDate: '' });
    const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });

    // Material Form
    const [matTitle, setMatTitle] = useState('');
    const [matContent, setMatContent] = useState('');
    const [matLink, setMatLink] = useState('');
    const [matType, setMatType] = useState('TEXT');
    const [matFile, setMatFile] = useState(null);
    const [submissionFile, setSubmissionFile] = useState(null);
    const [grading, setGrading] = useState({});

    // Messages
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    const API_BASE = 'http://127.0.0.1:8080/api';

    // --- HELPER: AUTH HEADERS ---
    const getAuthHeaders = (contentType = 'application/json') => {
        const headers = { 'Authorization': `Bearer ${token}` };
        if (contentType) headers['Content-Type'] = contentType;
        return headers;
    };

    // --- HELPER: GET MY COURSES ---
    const myCourses = currentUser?.role === 'STUDENT'
        ? courses.filter(c => c.students?.some(s => s.id === currentUser.id))
        : courses;

    // --- EFFECTS ---
    useEffect(() => { if (token && currentUser) initData(); }, [token, currentUser]);

    useEffect(() => { if (view === 'course-detail' && selectedCourseId) { fetchCourseDetails(selectedCourseId); fetchAssignments(selectedCourseId); } }, [selectedCourseId, view]);
    useEffect(() => { if (selectedAssignment) fetchSubmissions(selectedAssignment.id); }, [selectedAssignment]);
    useEffect(() => { if (view === 'admin' && adminTab === 'docs') fetchAllDocuments(); }, [view, adminTab]);
    useEffect(() => { if (view === 'catalog') fetchAvailableCourses(); }, [view]);

    // Hämta data för Dashboard och Kalender
    useEffect(() => {
        if (myCourses.length > 0) {
            if (view === 'calendar') fetchAllCalendarData();
            if (view === 'dashboard') fetchDashboardData();
        }
    }, [view, myCourses]);

    const initData = async () => { setIsLoading(true); await fetchUsers(); await fetchCourses(); setIsLoading(false); };

    const refreshUser = async () => {
        if (!currentUser) return;
        try {
            const res = await fetch(`${API_BASE}/users/${currentUser.id}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const updatedUser = await res.json();
                setCurrentUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (err) {
            console.error("Kunde inte uppdatera användardata", err);
        }
    };

    // --- API CALLS ---
    const fetchUsers = async () => { try { const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() }); if (res.ok) setUsers(await res.json()); else if (res.status === 401) logout(); } catch (err) { setIsOffline(true); } };
    const fetchCourses = async () => { try { const res = await fetch(`${API_BASE}/courses`, { headers: getAuthHeaders() }); if(res.ok) setCourses(await res.json()); } catch (err) {} };
    const fetchAvailableCourses = async () => { try { const res = await fetch(`${API_BASE}/courses/available/${currentUser.id}`, { headers: getAuthHeaders() }); if (res.ok) setAvailableCourses(await res.json()); } catch (err) { setError("Kunde inte hämta kurskatalog."); } };
    const fetchCourseDetails = async (id) => { setCurrentCourse(null); setMaterials([]); try { const cRes = await fetch(`${API_BASE}/courses/${id}`, { headers: getAuthHeaders() }); if (cRes.ok) setCurrentCourse(await cRes.json()); const mRes = await fetch(`${API_BASE}/courses/${id}/materials`, { headers: getAuthHeaders() }); if (mRes.ok) setMaterials(await mRes.json()); } catch (err) { setError("Fel vid hämtning."); } };
    const fetchAssignments = async (cid) => { try { const res = await fetch(`${API_BASE}/courses/${cid}/assignments`, { headers: getAuthHeaders() }); if (res.ok) setAssignments(await res.json()); } catch (err) {} };
    const fetchSubmissions = async (aid) => { try { const res = await fetch(`${API_BASE}/assignments/${aid}/submissions`, { headers: getAuthHeaders() }); if (res.ok) setSubmissions(await res.json()); } catch (err) {} };
    const fetchDocuments = async (uid) => { try { const res = await fetch(`${API_BASE}/documents/user/${uid}`, { headers: getAuthHeaders() }); if (res.ok) setDocuments(await res.json()); } catch (err) {} };
    const fetchAllDocuments = async () => { try { const res = await fetch(`${API_BASE}/documents/all`, { headers: getAuthHeaders() }); if (res.ok) setAllDocuments(await res.json()); } catch (err) {} };

    const fetchAllCalendarData = async () => {
        try {
            const promises = myCourses.map(course =>
                fetch(`${API_BASE}/courses/${course.id}/assignments`, { headers: getAuthHeaders() })
                    .then(res => res.ok ? res.json() : [])
                    .then(data => data.map(a => ({ ...a, courseName: course.name, courseCode: course.courseCode, type: 'ASSIGNMENT' })))
            );
            const assignmentsResults = await Promise.all(promises);
            const allAssignments = assignmentsResults.flat();

            const courseStarts = myCourses.filter(c => c.startDate).map(c => ({
                id: `start-${c.id}`, title: `Kursstart: ${c.name}`, dueDate: c.startDate,
                courseName: c.name, courseCode: c.courseCode, type: 'COURSE_START'
            }));
            setCalendarEvents([...allAssignments, ...courseStarts]);
        } catch (err) { console.error("Kalenderfel", err); }
    };

    const fetchDashboardData = async () => {
        if (!currentUser) return;
        try {
            // Hämta assignments
            const promises = myCourses.map(course =>
                fetch(`${API_BASE}/courses/${course.id}/assignments`, { headers: getAuthHeaders() })
                    .then(res => res.ok ? res.json() : [])
                    .then(data => data.map(a => ({ ...a, courseName: course.name, courseId: course.id })))
            );
            const results = await Promise.all(promises);
            const allAssigns = results.flat();

            const future = allAssigns
                .filter(a => new Date(a.dueDate) > new Date())
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5);
            setUpcomingAssignments(future);

            if (currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') {
                const subPromises = allAssigns.map(assign =>
                    fetch(`${API_BASE}/assignments/${assign.id}/submissions`, { headers: getAuthHeaders() })
                        .then(res => res.ok ? res.json() : [])
                        .then(data => data.map(s => ({ ...s, assignmentTitle: assign.title, courseName: assign.courseName, assignmentId: assign.id })))
                );
                const subResults = await Promise.all(subPromises);
                const allSubs = subResults.flat();
                setUngradedSubmissions(allSubs.filter(s => !s.grade));
            }

            // NYTT: Hämta aktiva utvärderingar som eleven inte gjort än
            // (Vi filtrerar detta på frontend för enkelhetens skull, men normalt görs det i backend)
            const activeEvals = myCourses.filter(c => c.evaluation && c.evaluation.active);
            // I en riktig app: kolla om studenten redan har svarat via en endpoint.
            // Här visar vi alla aktiva kurser för demonstration.
            setPendingEvaluations(activeEvals);

        } catch (err) { console.error("Dashboardfel", err); }
    };

    const checkUsernameAvailability = async (username) => {
        if (!username) return false;
        try {
            const res = await fetch(`${API_BASE}/users/exists?username=${username}`);
            if (res.ok) return await res.json();
        } catch (err) { return false; }
        return false;
    };

    // --- AUTH ACTIONS ---
    const handleLogin = async (e) => { e.preventDefault(); setError(null); setIsLoading(true); try { const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) }); if (res.ok) { const data = await res.json(); setToken(data.token); const userObj = { id: data.id, username: data.username, fullName: data.fullName, role: data.role, profilePictureUrl: data.profilePictureUrl }; setCurrentUser(userObj); localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(userObj)); setLoginForm({ username: '', password: '' }); setIsOffline(false); } else setError("Fel inloggning."); } catch (err) { setError("Kunde inte nå servern."); } finally { setIsLoading(false); } };
    const handleGenerateUsernames = async () => { if (!registerForm.firstName || !registerForm.lastName || !registerForm.ssn) return setError("Fyll i uppgifter först."); try { const res = await fetch(`${API_BASE}/users/generate-usernames`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName: registerForm.firstName, lastName: registerForm.lastName, ssn: registerForm.ssn }) }); if (res.ok) setUsernameSuggestions(await res.json()); else setError("Kunde inte generera."); } catch (err) { setError("Nätverksfel."); } };
    const handleRegister = async (e) => { e.preventDefault(); if (!registerForm.username) return setError("Välj ett användarnamn!"); const fullAddress = `${registerForm.street}, ${registerForm.zip} ${registerForm.city}, ${registerForm.country}`; const payload = { ...registerForm, address: fullAddress }; delete payload.street; delete payload.zip; delete payload.city; delete payload.country; try { const headers = currentUser ? getAuthHeaders() : { 'Content-Type': 'application/json' }; const res = await fetch(`${API_BASE}/users/register`, { method: 'POST', headers: headers, body: JSON.stringify(payload) }); if (res.ok) { showMessage("Konto skapat!"); if (!currentUser) setAuthView('login'); else fetchUsers(); setRegisterForm({ firstName: '', lastName: '', ssn: '', street: '', zip: '', city: '', country: '', phone: '', email: '', username: '', password: '', role: 'STUDENT' }); setUsernameSuggestions([]); } else { const errText = await res.text(); setError(errText || "Kunde inte registrera användare."); } } catch (err) { setError("Nätverksfel vid registrering."); } };
    const logout = () => { setToken(null); setCurrentUser(null); localStorage.removeItem('token'); localStorage.removeItem('user'); setView('dashboard'); };

    // --- EVENT HANDLERS ---

    // NYTT: Hantera skapande av utvärdering (Lärare)
    const handleCreateEvaluation = async (questions) => {
        if (!questions || questions.length === 0) return setError("Minst en fråga krävs.");

        try {
            // Antar endpoint POST /courses/:id/evaluation
            const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/evaluation`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ questions, active: true })
            });

            if (res.ok) {
                showMessage("Utvärdering aktiverad!");
                fetchCourseDetails(selectedCourseId); // Uppdatera kursen så vi ser ändringen
            } else {
                setError("Kunde inte skapa utvärdering.");
            }
        } catch (err) {
            setError("Nätverksfel.");
        }
    };

    // NYTT: Hantera inskick av utvärdering (Student)
    const handleSubmitEvaluation = async (courseId, answers) => {
        try {
            // Antar endpoint POST /courses/:id/evaluation/submit
            const res = await fetch(`${API_BASE}/courses/${courseId}/evaluation/submit`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ answers })
            });

            if (res.ok) {
                showMessage("Tack för din feedback!");
                setEvaluationModalCourse(null); // Stäng modal
                // Ta bort från pending-listan lokalt
                setPendingEvaluations(prev => prev.filter(c => c.id !== courseId));
            } else {
                setError("Kunde inte skicka svar.");
            }
        } catch (err) {
            setError("Nätverksfel.");
        }
    };

    const handleAddStudentToCourse = async (studentId) => { if (!studentId) return setError("Välj en student."); try { const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/enroll/${studentId}`, { method: 'POST', headers: getAuthHeaders() }); if (res.ok) { showMessage("Student tillagd!"); fetchCourseDetails(selectedCourseId); } else setError("Kunde inte lägga till."); } catch (err) { setError("Nätverksfel."); } };
    const handleEnroll = async (courseId) => { if(!window.confirm("Gå med i kurs?")) return; try { const res = await fetch(`${API_BASE}/courses/${courseId}/enroll/${currentUser.id}`, { method: 'POST', headers: getAuthHeaders() }); if (res.ok) { showMessage("Du har gått med!"); setAvailableCourses(prev => prev.filter(c => c.id !== courseId)); fetchCourses(); } else setError("Kunde inte gå med."); } catch (err) { setError("Nätverksfel."); } };
    const handleCourseSubmit = async (e) => { e.preventDefault(); const payload = { name: courseForm.name, courseCode: courseForm.courseCode, description: courseForm.description, startDate: courseForm.startDate || null }; try { const res = await fetch(`${API_BASE}/courses?teacherId=${courseForm.teacherId}`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) }); if (res.ok) { showMessage('Kurs skapad!'); setShowCourseModal(false); fetchCourses(); } } catch (err) {} };
    const handleDeleteCourse = async (id, e) => { if (e) e.stopPropagation(); if(!window.confirm("Ta bort kurs? Allt material försvinner.")) return; try { const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE', headers: getAuthHeaders() }); if (res.ok) { showMessage('Raderad!'); fetchCourses(); if(selectedCourseId === id) navigateTo('courses'); } } catch (err) {} };
    const handleAttemptDeleteUser = async (user) => { try { const res = await fetch(`${API_BASE}/documents/user/${user.id}`, { headers: getAuthHeaders() }); if (res.ok) { const docs = await res.json(); if (docs.length > 0) setPendingDeleteUser({ user, docs }); else if(window.confirm(`Ta bort ${user.fullName}?`)) performDeleteUser(user.id); } } catch (err) { setError("Kontroll misslyckades."); } };
    const performDeleteUser = async (userId) => { try { if (pendingDeleteUser) for (const doc of pendingDeleteUser.docs) await fetch(`${API_BASE}/documents/${doc.id}`, { method: 'DELETE', headers: getAuthHeaders() }); const res = await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE', headers: getAuthHeaders() }); if (res.ok) { showMessage("Raderad."); setPendingDeleteUser(null); fetchUsers(); } else setError("Kunde inte radera."); } catch (err) { setError("Fel vid radering."); } };
    const handleDeleteDoc = async (id, refreshAll = false) => { if(!window.confirm("Ta bort fil?")) return; try { const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE', headers: getAuthHeaders() }); if (res.ok) { if (refreshAll) fetchAllDocuments(); else fetchDocuments(currentUser.id); } } catch (err) {} };
    const handleMaterialSubmit = async (e) => { e.preventDefault(); const formData = new FormData(); formData.append("title", matTitle); formData.append("content", matContent); formData.append("link", matLink); formData.append("type", matType); if (matFile) formData.append("file", matFile); try { const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/materials`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData }); if (res.ok) { showMessage('Material tillagt!'); setMatFile(null); fetchCourseDetails(selectedCourseId); } } catch (err) {} };
    const handleDeleteMaterial = async (matId) => { if(!window.confirm("Ta bort?")) return; try { const res = await fetch(`${API_BASE}/courses/materials/${matId}`, { method: 'DELETE', headers: getAuthHeaders() }); if(res.ok) fetchCourseDetails(selectedCourseId); } catch(e){} };
    const handleCreateAssignment = async (e) => { e.preventDefault(); try { const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/assignments`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(assignmentForm) }); if (res.ok) { showMessage("Uppgift skapad!"); setAssignmentForm({ title: '', description: '', dueDate: '' }); setShowAssignmentModal(false); fetchAssignments(selectedCourseId); } } catch (err) {} };
    const handleStudentSubmit = async (e) => { e.preventDefault(); if (!submissionFile) return setError("Välj fil!"); const formData = new FormData(); formData.append("file", submissionFile); try { const res = await fetch(`${API_BASE}/assignments/${selectedAssignment.id}/submit/${currentUser.id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData }); if (res.ok) { showMessage("Inlämnat!"); setSubmissionFile(null); fetchSubmissions(selectedAssignment.id); } } catch (err) { setError("Kunde inte skicka in."); } };
    const handleGradeSubmission = async (submissionId) => { const data = grading[submissionId]; try { const params = new URLSearchParams(); params.append('grade', data.grade); params.append('feedback', data.feedback); const res = await fetch(`${API_BASE}/submissions/${submissionId}/grade?${params.toString()}`, { method: 'POST', headers: getAuthHeaders() }); if (res.ok) { showMessage("Betyg sparat!"); fetchSubmissions(selectedAssignment.id); } } catch (err) {} };

    // UI Helpers
    const toggleReadStatus = (matId) => { setReadMaterials(prev => ({ ...prev, [matId]: !prev[matId] })); };
    const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };
    const navigateTo = (newView, courseId = null) => { setError(null); setSelectedCourseId(courseId); setView(newView); if (newView !== 'course-detail') { setCurrentCourse(null); setMaterials([]); setAssignments([]); setActiveTab('material'); setSelectedAssignment(null); }};
    const getYoutubeEmbed = (url) => { if (!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; };
    const teachers = users.filter(u => u.role === 'TEACHER' || u.role === 'ADMIN');
    const getIcon = (type) => { switch(type) { case 'VIDEO': return <Video size={20} className="text-red-500"/>; case 'LINK': return <LinkIcon size={20} className="text-blue-500"/>; default: return <FileText size={20} className="text-gray-500"/>; } };
    const getMySubmission = () => submissions.find(s => s.studentId === currentUser.id);

    if (!token || !currentUser) {
        return <Auth
            authView={authView} setAuthView={setAuthView}
            loginForm={loginForm} setLoginForm={setLoginForm}
            handleLogin={handleLogin} isLoading={isLoading}
            error={error} message={message}
            registerForm={registerForm} setRegisterForm={setRegisterForm}
            handleRegister={handleRegister}
            handleGenerateUsernames={handleGenerateUsernames}
            usernameSuggestions={usernameSuggestions}
            checkUsernameAvailability={checkUsernameAvailability}
        />;
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
            {/* --- MODALER --- */}

            {/* KURSUTVÄRDERINGS-MODAL (NY!) */}
            {evaluationModalCourse && (
                <EvaluationModal
                    course={evaluationModalCourse}
                    onClose={() => setEvaluationModalCourse(null)}
                    onSubmit={handleSubmitEvaluation}
                />
            )}

            {pendingDeleteUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in zoom-in">
                        <div className="flex items-center gap-3 text-red-600 mb-4"><AlertTriangle size={32}/><h2 className="text-xl font-bold">Varning! Filer finns.</h2></div>
                        <p className="mb-4 text-gray-700">Användaren <strong>{pendingDeleteUser.user.fullName}</strong> har filer. Dessa raderas permanent.</p>
                        <div className="bg-gray-50 border rounded-lg p-4 max-h-40 overflow-y-auto mb-6">{pendingDeleteUser.docs.map(doc => (<div key={doc.id} className="flex items-center gap-2 text-sm text-gray-600 mb-1"><File size={14}/> {doc.title}</div>))}</div>
                        <div className="flex justify-end gap-3"><button onClick={() => setPendingDeleteUser(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Avbryt</button><button onClick={() => performDeleteUser(pendingDeleteUser.user.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold">Radera allt</button></div>
                    </div>
                </div>
            )}
            {showCourseModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">Skapa Ny Kurs</h2><button onClick={() => setShowCourseModal(false)}><X/></button></div>
                        <form onSubmit={handleCourseSubmit} className="space-y-4">
                            <input className="w-full px-4 py-2 border rounded-lg" value={courseForm.name} onChange={e => setCourseForm({...courseForm, name: e.target.value})} placeholder="Kursnamn" />
                            <div className="grid grid-cols-2 gap-4"><input className="w-full px-4 py-2 border rounded-lg" value={courseForm.courseCode} onChange={e => setCourseForm({...courseForm, courseCode: e.target.value})} placeholder="Kurskod" /><input type="date" className="w-full px-4 py-2 border rounded-lg" value={courseForm.startDate} onChange={e => setCourseForm({...courseForm, startDate: e.target.value})} /></div>
                            <select className="w-full px-4 py-2 border rounded-lg bg-white" value={courseForm.teacherId} onChange={e => setCourseForm({...courseForm, teacherId: e.target.value})}><option value="">-- Välj lärare --</option>{teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}</select>
                            <textarea className="w-full px-4 py-2 border rounded-lg" rows="3" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} placeholder="Beskrivning..." />
                            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Spara Kurs</button>
                        </form>
                    </div>
                </div>
            )}
            {showAssignmentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Skapa Ny Uppgift</h2>
                            <button onClick={() => setShowAssignmentModal(false)}><X size={24} className="text-gray-400 hover:text-gray-600"/></button>
                        </div>
                        <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Titel</label><input className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} placeholder="t.ex. Inlämning 1" required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label><input type="datetime-local" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} required /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label><textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]" value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} placeholder="Vad ska göras?" /></div>
                            <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Publicera Uppgift</button>
                        </form>
                    </div>
                </div>
            )}

            <Sidebar view={view} navigateTo={navigateTo} currentUser={currentUser} logout={logout} />

            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
                    <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg w-96"><Search size={18} className="text-gray-400"/><input type="text" placeholder="Sök..." className="bg-transparent border-none outline-none text-sm w-full" /></div>
                    <div><Bell size={20} className="text-gray-400 hover:text-indigo-600 cursor-pointer"/></div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"><AlertTriangle size={20}/> {error}</div>}
                    {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"><CheckCircle size={20}/> {message}</div>}

                    {view === 'dashboard' && <Dashboard
                        currentUser={currentUser} myCourses={myCourses} documents={documents} navigateTo={navigateTo}
                        upcomingAssignments={upcomingAssignments} ungradedSubmissions={ungradedSubmissions}
                        pendingEvaluations={pendingEvaluations} // Skicka pending evals
                        openEvaluationModal={setEvaluationModalCourse} // Funktion för att öppna modal
                        setSelectedAssignment={setSelectedAssignment} fetchCourseDetails={fetchCourseDetails}
                    />}

                    {view === 'catalog' && <CourseCatalog availableCourses={availableCourses} handleEnroll={handleEnroll} />}
                    {view === 'calendar' && <CalendarView events={calendarEvents} navigateTo={navigateTo} />}
                    {view === 'documents' && <DocumentManager documents={documents} handleDeleteDoc={handleDeleteDoc} currentUser={currentUser} token={token} API_BASE={API_BASE} fetchDocuments={fetchDocuments} showMessage={showMessage} setError={setError} />}

                    {view === 'profile' && <UserProfile currentUser={currentUser} API_BASE={API_BASE} getAuthHeaders={getAuthHeaders} showMessage={showMessage} refreshUser={refreshUser} />}

                    {view === 'admin' && <AdminPanel adminTab={adminTab} setAdminTab={setAdminTab} users={users} currentUser={currentUser} handleAttemptDeleteUser={handleAttemptDeleteUser} courses={courses} setShowCourseModal={setShowCourseModal} handleDeleteCourse={handleDeleteCourse} allDocuments={allDocuments} fetchAllDocuments={fetchAllDocuments} handleDeleteDoc={handleDeleteDoc} registerForm={registerForm} setRegisterForm={setRegisterForm} handleRegister={handleRegister} handleGenerateUsernames={handleGenerateUsernames} usernameSuggestions={usernameSuggestions} checkUsernameAvailability={checkUsernameAvailability} />}

                    {view === 'course-detail' && currentCourse && <CourseDetail
                        currentCourse={currentCourse}
                        activeTab={activeTab} setActiveTab={setActiveTab}
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
                        // NY PROP:
                        handleCreateEvaluation={handleCreateEvaluation}
                    />}
                </div>
            </main>
        </div>
    );
}

export default App;