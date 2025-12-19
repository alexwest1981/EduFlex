import React, { useState, useEffect } from 'react';
import { Search, Bell, AlertTriangle, CheckCircle, WifiOff, File, X, Video, Link as LinkIcon, FileText } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import AdminPanel from './pages/AdminPanel';
import CourseDetail from './pages/CourseDetail';

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

    // UI State
    const [activeTab, setActiveTab] = useState('material');
    const [adminTab, setAdminTab] = useState('users');
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    // Forms
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', ssn: '', address: '', phone: '', email: '', username: '', password: '', role: 'STUDENT' });
    const [usernameSuggestions, setUsernameSuggestions] = useState([]);

    const [courseForm, setCourseForm] = useState({ name: '', courseCode: '', description: '', teacherId: '', startDate: '' });
    const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '' });
    const [formErrors, setFormErrors] = useState({});

    const [matTitle, setMatTitle] = useState('');
    const [matContent, setMatContent] = useState('');
    const [matLink, setMatLink] = useState('');
    const [matType, setMatType] = useState('TEXT');
    const [matFile, setMatFile] = useState(null);

    const [docTitle, setDocTitle] = useState('');
    const [docType, setDocType] = useState('CV');
    const [docDesc, setDocDesc] = useState('');
    const [docFile, setDocFile] = useState(null);

    const [submissionFile, setSubmissionFile] = useState(null);
    const [grading, setGrading] = useState({});

    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    const API_BASE = 'http://127.0.0.1:8080/api';

    // --- HELPER: AUTH HEADERS ---
    const getAuthHeaders = (contentType = 'application/json') => {
        const headers = { 'Authorization': `Bearer ${token}` };
        if (contentType) headers['Content-Type'] = contentType;
        return headers;
    };

    // --- EFFECTS ---
    useEffect(() => { if (token && currentUser) initData(); }, [token, currentUser]);
    useEffect(() => { if (view === 'course-detail' && selectedCourseId) { fetchCourseDetails(selectedCourseId); fetchAssignments(selectedCourseId); } }, [selectedCourseId, view]);
    useEffect(() => { if (selectedAssignment) fetchSubmissions(selectedAssignment.id); }, [selectedAssignment]);
    useEffect(() => { if (view === 'admin' && adminTab === 'docs') fetchAllDocuments(); }, [view, adminTab]);

    const initData = async () => { setIsLoading(true); await fetchUsers(); await fetchCourses(); setIsLoading(false); };

    // --- AUTH ACTIONS ---
    const handleLogin = async (e) => {
        e.preventDefault(); setError(null); setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) });
            if (res.ok) {
                const data = await res.json();
                setToken(data.token);
                const userObj = { id: data.id, username: data.username, fullName: data.fullName, role: data.role };
                setCurrentUser(userObj);
                localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(userObj));
                setLoginForm({ username: '', password: '' }); setIsOffline(false);
            } else setError("Fel användarnamn eller lösenord.");
        } catch (err) { setError("Kunde inte nå servern."); } finally { setIsLoading(false); }
    };
    const handleGenerateUsernames = async () => {
        if (!registerForm.firstName || !registerForm.lastName || !registerForm.ssn) return setError("Fyll i Förnamn, Efternamn och Personnummer först.");
        try {
            const res = await fetch(`${API_BASE}/users/generate-usernames`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName: registerForm.firstName, lastName: registerForm.lastName, ssn: registerForm.ssn }) });
            if (res.ok) setUsernameSuggestions(await res.json()); else setError("Kunde inte generera förslag.");
        } catch (err) { setError("Nätverksfel vid generering."); }
    };
    const handleRegister = async (e) => {
        e.preventDefault(); if (!registerForm.username) return setError("Välj ett användarnamn!");
        try {
            const headers = currentUser ? getAuthHeaders() : { 'Content-Type': 'application/json' };
            const res = await fetch(`${API_BASE}/users/register`, { method: 'POST', headers: headers, body: JSON.stringify(registerForm) });
            if (res.ok) { showMessage("Konto skapat!"); if (!currentUser) setAuthView('login'); else fetchUsers(); setRegisterForm({ firstName: '', lastName: '', ssn: '', address: '', phone: '', email: '', username: '', password: '', role: 'STUDENT' }); setUsernameSuggestions([]); } else setError("Kunde inte registrera användare.");
        } catch (err) { setError("Nätverksfel vid registrering."); }
    };
    const logout = () => { setToken(null); setCurrentUser(null); localStorage.removeItem('token'); localStorage.removeItem('user'); setView('dashboard'); };

    // --- API CALLS ---
    const fetchUsers = async () => { try { const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() }); if (res.ok) setUsers(await res.json()); else if (res.status === 401) logout(); } catch (err) { setIsOffline(true); } };
    const fetchCourses = async () => { try { const res = await fetch(`${API_BASE}/courses`, { headers: getAuthHeaders() }); if(res.ok) setCourses(await res.json()); } catch (err) {} };
    const fetchCourseDetails = async (id) => { setCurrentCourse(null); setMaterials([]); try { const cRes = await fetch(`${API_BASE}/courses/${id}`, { headers: getAuthHeaders() }); if (cRes.ok) setCurrentCourse(await cRes.json()); const mRes = await fetch(`${API_BASE}/courses/${id}/materials`, { headers: getAuthHeaders() }); if (mRes.ok) setMaterials(await mRes.json()); } catch (err) { setError("Fel vid hämtning."); } };
    const fetchAssignments = async (cid) => { try { const res = await fetch(`${API_BASE}/courses/${cid}/assignments`, { headers: getAuthHeaders() }); if (res.ok) setAssignments(await res.json()); } catch (err) {} };
    const fetchSubmissions = async (aid) => { try { const res = await fetch(`${API_BASE}/assignments/${aid}/submissions`, { headers: getAuthHeaders() }); if (res.ok) setSubmissions(await res.json()); } catch (err) {} };
    const fetchDocuments = async (uid) => { try { const res = await fetch(`${API_BASE}/documents/user/${uid}`, { headers: getAuthHeaders() }); if (res.ok) setDocuments(await res.json()); } catch (err) {} };
    const fetchAllDocuments = async () => { try { const res = await fetch(`${API_BASE}/documents/all`, { headers: getAuthHeaders() }); if (res.ok) setAllDocuments(await res.json()); } catch (err) {} };

    // --- ACTION HANDLERS ---
    const handleCourseSubmit = async (e) => { e.preventDefault(); const payload = { name: courseForm.name, courseCode: courseForm.courseCode, description: courseForm.description, startDate: courseForm.startDate || null }; try { const res = await fetch(`${API_BASE}/courses?teacherId=${courseForm.teacherId}`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) }); if (res.ok) { showMessage('Kurs skapad!'); setShowCourseModal(false); fetchCourses(); } } catch (err) {} };
    const handleDeleteCourse = async (id, e) => { if (e) e.stopPropagation(); if(!window.confirm("Ta bort kurs? Allt material försvinner.")) return; try { const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE', headers: getAuthHeaders() }); if (res.ok) { showMessage('Kurs borttagen!'); fetchCourses(); if(selectedCourseId === id) navigateTo('courses'); } } catch (err) {} };
    const handleAttemptDeleteUser = async (user) => { try { const res = await fetch(`${API_BASE}/documents/user/${user.id}`, { headers: getAuthHeaders() }); if (res.ok) { const docs = await res.json(); if (docs.length > 0) setPendingDeleteUser({ user, docs }); else if(window.confirm(`Ta bort ${user.fullName}?`)) performDeleteUser(user.id); } } catch (err) { setError("Kunde inte kontrollera filer."); } };
    const performDeleteUser = async (userId) => { try { if (pendingDeleteUser) for (const doc of pendingDeleteUser.docs) await fetch(`${API_BASE}/documents/${doc.id}`, { method: 'DELETE', headers: getAuthHeaders() }); const res = await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE', headers: getAuthHeaders() }); if (res.ok) { showMessage("Användare raderad."); setPendingDeleteUser(null); fetchUsers(); } else setError("Kunde inte radera."); } catch (err) { setError("Fel vid radering."); } };
    const handleDocSubmit = async (e) => { e.preventDefault(); const formData = new FormData(); formData.append("file", docFile); formData.append("title", docTitle); formData.append("type", docType); formData.append("description", docDesc); try { const res = await fetch(`${API_BASE}/documents/user/${currentUser.id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData }); if (res.ok) { showMessage('Uppladdat!'); setDocFile(null); fetchDocuments(currentUser.id); } } catch (err) {} };
    const handleDeleteDoc = async (id, refreshAll = false) => { if(!window.confirm("Ta bort filen?")) return; try { const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE', headers: getAuthHeaders() }); if (res.ok) { if (refreshAll) fetchAllDocuments(); else fetchDocuments(currentUser.id); } } catch (err) {} };
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
    const myCourses = currentUser?.role === 'STUDENT' ? courses.filter(c => c.students?.some(s => s.id === currentUser.id)) : courses;
    const getIcon = (type) => { switch(type) { case 'VIDEO': return <Video size={20} className="text-red-500"/>; case 'LINK': return <LinkIcon size={20} className="text-blue-500"/>; default: return <FileText size={20} className="text-gray-500"/>; } };
    const getMySubmission = () => submissions.find(s => s.studentId === currentUser.id);

    if (!token || !currentUser) {
        return <Auth authView={authView} setAuthView={setAuthView} loginForm={loginForm} setLoginForm={setLoginForm} handleLogin={handleLogin} isLoading={isLoading} error={error} message={message}
                     registerForm={registerForm} setRegisterForm={setRegisterForm} handleRegister={handleRegister} handleGenerateUsernames={handleGenerateUsernames} usernameSuggestions={usernameSuggestions} />;
    }

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
            {/* MODALS */}
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

            {/* SIDEBAR */}
            <Sidebar view={view} navigateTo={navigateTo} currentUser={currentUser} logout={logout} />

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
                    <div className="flex items-center gap-4 bg-gray-100 px-4 py-2 rounded-lg w-96"><Search size={18} className="text-gray-400"/><input type="text" placeholder="Sök..." className="bg-transparent border-none outline-none text-sm w-full" /></div>
                    <div><Bell size={20} className="text-gray-400 hover:text-indigo-600 cursor-pointer"/></div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
                    {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"><AlertTriangle size={20}/> {error}</div>}
                    {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"><CheckCircle size={20}/> {message}</div>}

                    {/* ADMIN VIEW - BRÖTS UT */}
                    {view === 'admin' && (
                        <AdminPanel
                            adminTab={adminTab} setAdminTab={setAdminTab} users={users} currentUser={currentUser} handleAttemptDeleteUser={handleAttemptDeleteUser}
                            courses={courses} setShowCourseModal={setShowCourseModal} handleDeleteCourse={handleDeleteCourse}
                            allDocuments={allDocuments} fetchAllDocuments={fetchAllDocuments} handleDeleteDoc={handleDeleteDoc}
                            registerForm={registerForm} setRegisterForm={setRegisterForm} handleRegister={handleRegister} handleGenerateUsernames={handleGenerateUsernames} usernameSuggestions={usernameSuggestions}
                        />
                    )}

                    {/* DASHBOARD */}
                    {view === 'dashboard' && (
                        <div className="animate-in fade-in">
                            <h1 className="text-3xl font-bold text-gray-800 mb-6">Översikt</h1>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-6 shadow-lg h-40 flex flex-col justify-between"><div><h1 className="text-2xl font-bold">Hej {currentUser.fullName?.split(' ')[0]}!</h1></div><p className="text-indigo-100 text-sm">Välkommen.</p></div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border h-40 flex flex-col justify-between"><h3 className="text-gray-500 font-medium">Kurser</h3><h1 className="text-4xl font-bold text-gray-800">{myCourses.length}</h1></div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm border h-40 flex flex-col justify-between"><h3 className="text-gray-500 font-medium">Dokument</h3><h1 className="text-4xl font-bold text-gray-800">{documents.length}</h1></div>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Mina Kurser</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{myCourses.map(c => (<div key={c.id} onClick={() => navigateTo('course-detail', c.id)} className="bg-white p-6 rounded-xl border hover:shadow-lg cursor-pointer transition-all"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{c.courseCode}</span><h3 className="text-lg font-bold mt-2">{c.name}</h3><p className="text-sm text-gray-500">{c.teacher?.fullName}</p></div>))}</div>
                        </div>
                    )}

                    {/* COURSES */}
                    {view === 'courses' && (
                        <div>
                            <h1 className="text-3xl font-bold mb-6">Alla Kurser</h1>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{courses.map(c => (<div key={c.id} onClick={() => navigateTo('course-detail', c.id)} className="bg-white p-6 rounded-xl border hover:shadow-lg cursor-pointer transition-all"><h3 className="text-lg font-bold">{c.name}</h3><div className="text-sm text-gray-500">{c.courseCode}</div></div>))}</div>
                        </div>
                    )}

                    {/* DOCUMENTS */}
                    {view === 'documents' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-6 rounded-xl border h-fit">
                                <h3 className="font-bold mb-4">Ladda upp</h3>
                                <form onSubmit={handleDocSubmit} className="space-y-4">
                                    <input className="w-full px-4 py-2 border rounded-lg" value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="Titel" required />
                                    <select className="w-full px-4 py-2 border rounded-lg bg-white" value={docType} onChange={e => setDocType(e.target.value)}><option value="CV">CV</option><option value="BETYG">Betyg</option></select>
                                    <input type="file" className="text-sm" onChange={e => setDocFile(e.target.files[0])} />
                                    <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Spara</button>
                                </form>
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                {documents.map(doc => (<div key={doc.id} className="bg-white p-4 rounded-xl border flex justify-between items-center"><div className="flex items-center gap-4"><div className="p-3 bg-green-50 rounded-lg text-green-600"><File size={20}/></div><div><div className="font-bold">{doc.title}</div><div className="text-xs text-gray-500">{doc.type}</div></div></div><div className="flex gap-2">{doc.fileUrl && <a href={`http://127.0.0.1:8080${doc.fileUrl}`} target="_blank" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"><Download size={18}/></a>}<button onClick={() => handleDeleteDoc(doc.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full"><Trash2 size={18}/></button></div></div>))}
                            </div>
                        </div>
                    )}

                    {/* COURSE DETAIL - BRÖTS UT TILL EGEN KOMPONENT */}
                    {view === 'course-detail' && currentCourse && (
                        <CourseDetail
                            currentCourse={currentCourse} activeTab={activeTab} setActiveTab={setActiveTab} selectedAssignment={selectedAssignment} setSelectedAssignment={setSelectedAssignment}
                            currentUser={currentUser} materials={materials} assignments={assignments} submissions={submissions} grading={grading} setGrading={setGrading} readMaterials={readMaterials}
                            setShowAssignmentModal={setShowAssignmentModal} handleMaterialSubmit={handleMaterialSubmit} handleStudentSubmit={handleStudentSubmit} handleGradeSubmission={handleGradeSubmission}
                            handleDeleteMaterial={handleDeleteMaterial} toggleReadStatus={toggleReadStatus} getIcon={getIcon} getYoutubeEmbed={getYoutubeEmbed} getMySubmission={getMySubmission}
                            matTitle={matTitle} setMatTitle={setMatTitle} matContent={matContent} setMatContent={setMatContent} matLink={matLink} setMatLink={setMatLink} matType={matType} setMatType={setMatType} setMatFile={setMatFile} setSubmissionFile={setSubmissionFile}
                            navigateTo={navigateTo}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;