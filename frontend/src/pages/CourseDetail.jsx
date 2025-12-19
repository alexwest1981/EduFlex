import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, BookOpen, FileText, Settings, LogOut, Plus, Search, Bell,
    User, Download, Trash2, Video, Link as LinkIcon, File, Briefcase,
    Users, UserPlus, ArrowLeft, CheckCircle, Eye, EyeOff, Youtube, Image as ImageIcon,
    WifiOff, Calendar, X, AlertTriangle, Loader2, Clock, CheckSquare, Upload, GraduationCap, ChevronRight,
    Lock, LogIn, FolderOpen, Edit, RefreshCw, UserCheck
} from 'lucide-react';

// --- KOMPONENT: RegistrationForm ---
const RegistrationForm = ({ isAdminContext, registerForm, setRegisterForm, handleRegister, handleGenerateUsernames, usernameSuggestions }) => (
    <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Förnamn</label>
                <input
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.firstName}
                    onChange={e => setRegisterForm(prev => ({...prev, firstName: e.target.value}))}
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Efternamn</label>
                <input
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.lastName}
                    onChange={e => setRegisterForm(prev => ({...prev, lastName: e.target.value}))}
                    required
                />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Personnummer (YYYYMMDD-XXXX)</label>
            <input
                className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                value={registerForm.ssn}
                onChange={e => setRegisterForm(prev => ({...prev, ssn: e.target.value}))}
                placeholder="19900101-1234"
                required
            />
        </div>

        {/* GENERATE USERNAME SECTION */}
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <label className="block text-xs font-bold text-indigo-700 mb-2">Välj Användarnamn</label>
            <div className="flex gap-2 mb-3">
                <button type="button" onClick={handleGenerateUsernames} className="bg-indigo-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-700 flex items-center gap-1 transition-colors">
                    <RefreshCw size={12}/> Generera förslag
                </button>
            </div>

            {usernameSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {usernameSuggestions.map(uname => (
                        <button
                            key={uname} type="button"
                            onClick={() => setRegisterForm(prev => ({...prev, username: uname}))}
                            className={`px-3 py-1 rounded-full text-xs border transition-colors ${registerForm.username === uname ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'}`}
                        >
                            {uname}
                        </button>
                    ))}
                </div>
            )}
            <input
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Valt användarnamn"
                value={registerForm.username}
                readOnly
                required
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Lösenord</label>
                <input
                    type="password"
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.password}
                    onChange={e => setRegisterForm(prev => ({...prev, password: e.target.value}))}
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Roll</label>
                <select
                    className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.role}
                    onChange={e => setRegisterForm(prev => ({...prev, role: e.target.value}))}
                >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Lärare</option>
                    <option value="ADMIN">Admin</option>
                </select>
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
            <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                value={registerForm.email}
                onChange={e => setRegisterForm(prev => ({...prev, email: e.target.value}))}
                required
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Telefon</label>
                <input
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.phone}
                    onChange={e => setRegisterForm(prev => ({...prev, phone: e.target.value}))}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Adress</label>
                <input
                    className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={registerForm.address}
                    onChange={e => setRegisterForm(prev => ({...prev, address: e.target.value}))}
                />
            </div>
        </div>

        <button className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 mt-4 transition-colors">
            {isAdminContext ? 'Registrera Användare' : 'Skapa Mitt Konto'}
        </button>
    </form>
);

// --- KOMPONENT: Auth ---
const Auth = ({ authView, setAuthView, loginForm, setLoginForm, handleLogin, isLoading, error, message, ...registerProps }) => {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-100 font-sans">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg animate-in fade-in zoom-in duration-300 max-h-screen overflow-y-auto">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                        <Lock size={32} />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">EduFlex</h1>
                <p className="text-center text-gray-500 mb-8">{authView === 'login' ? 'Logga in' : 'Registrering'}</p>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"><AlertTriangle size={16}/>{error}</div>}
                {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"><CheckCircle size={16}/>{message}</div>}

                {authView === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Användarnamn"
                            value={loginForm.username}
                            onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                            autoFocus required
                        />
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Lösenord"
                            value={loginForm.password}
                            onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                            required
                        />
                        <button disabled={isLoading} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2">
                            {isLoading ? <Loader2 className="animate-spin" /> : <><LogIn size={20}/> Logga In</>}
                        </button>
                        <p className="text-center text-sm text-gray-500 mt-4">Inget konto? <button type="button" onClick={() => setAuthView('register')} className="text-indigo-600 font-bold hover:underline">Registrera</button></p>
                    </form>
                ) : (
                    <div>
                        {/* Vi skickar med alla props till RegistrationForm */}
                        <RegistrationForm isAdminContext={false} {...registerProps} />
                        <p className="text-center text-sm text-gray-500 mt-4">Har du konto? <button type="button" onClick={() => setAuthView('login')} className="text-indigo-600 font-bold hover:underline">Logga in</button></p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- KOMPONENT: Sidebar ---
const Sidebar = ({ view, navigateTo, currentUser, logout }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Översikt' },
        { id: 'courses', icon: BookOpen, label: 'Kurser' },
        { id: 'documents', icon: Briefcase, label: 'Dokument' },
    ];

    if (currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') {
        menuItems.push({ id: 'admin', icon: Settings, label: 'Admin' });
    }

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
            <div className="p-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">E</div>
                <span className="text-xl font-bold text-gray-800 tracking-tight">EduFlex</span>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${view === item.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <item.icon size={20} className={view === item.id ? 'text-indigo-600' : 'text-gray-400'}/>
                        {item.label}
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <div className="bg-gray-50 rounded-xl p-4 mb-2">
                    <div className="font-semibold text-sm truncate">{currentUser.fullName}</div>
                    <div className="text-xs text-gray-500">{currentUser.role}</div>
                </div>
                <button onClick={logout} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 p-2 rounded-lg text-sm transition-colors">
                    <LogOut size={16}/> Logga Ut
                </button>
            </div>
        </aside>
    );
};

// --- KOMPONENT: AdminPanel ---
const AdminPanel = ({
    adminTab, setAdminTab, users, currentUser, handleAttemptDeleteUser,
    courses, setShowCourseModal, handleDeleteCourse,
    allDocuments, fetchAllDocuments, handleDeleteDoc,
    // Props för RegistrationForm
    registerForm, setRegisterForm, handleRegister, handleGenerateUsernames, usernameSuggestions
}) => {

    return (
        <div className="animate-in fade-in">
            <h1 className="text-3xl font-bold mb-6">Systemadministration</h1>
            <div className="flex border-b border-gray-200 mb-6 space-x-6">
                {['users', 'courses', 'docs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setAdminTab(tab)}
                        className={`pb-3 font-medium transition-colors border-b-2 ${adminTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab === 'users' ? 'Användare' : tab === 'courses' ? 'Kurser' : 'Dokumentarkiv'}
                    </button>
                ))}
            </div>

            {/* USERS TAB */}
            {adminTab === 'users' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl border h-fit">
                        <h3 className="font-bold mb-4">Registrera Ny Användare</h3>
                        <RegistrationForm
                            isAdminContext={true}
                            registerForm={registerForm}
                            setRegisterForm={setRegisterForm}
                            handleRegister={handleRegister}
                            handleGenerateUsernames={handleGenerateUsernames}
                            usernameSuggestions={usernameSuggestions}
                        />
                    </div>
                    <div className="bg-white p-6 rounded-xl border h-fit">
                        <h3 className="font-bold mb-4">Alla Användare ({users.length})</h3>
                        <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                            {users.map(u => (
                                <div key={u.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'TEACHER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {u.role[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold">{u.fullName}</div>
                                            <div className="text-xs text-gray-500">{u.username}</div>
                                        </div>
                                    </div>
                                    {u.id !== currentUser.id && (
                                        <button onClick={() => handleAttemptDeleteUser(u)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors">
                                            <Trash2 size={18}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* COURSES TAB */}
            {adminTab === 'courses' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-500">Hantera alla kurser i systemet.</p>
                        <button onClick={() => setShowCourseModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-all">
                            <Plus size={18}/> Skapa Ny Kurs
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(c => (
                            <div key={c.id} className="bg-white p-6 rounded-xl border shadow-sm relative group hover:shadow-md transition-shadow">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => handleDeleteCourse(c.id, e)} className="p-2 bg-white text-red-500 shadow-sm border rounded-lg hover:bg-red-50 transition-colors" title="Radera kurs">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{c.courseCode}</span>
                                <h3 className="text-lg font-bold mt-2">{c.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">Lärare: {c.teacher?.fullName}</p>
                                <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">Startdatum: {c.startDate || 'Ej satt'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DOCS TAB */}
            {adminTab === 'docs' && (
                <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold">Systemarkiv ({allDocuments.length} filer)</h3>
                        <button onClick={fetchAllDocuments} className="text-sm text-indigo-600 hover:underline font-medium">Uppdatera lista</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3">Filnamn</th>
                                    <th className="px-6 py-3">Ägare</th>
                                    <th className="px-6 py-3">Typ</th>
                                    <th className="px-6 py-3">Datum</th>
                                    <th className="px-6 py-3 text-right">Åtgärd</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allDocuments.map(doc => (
                                    <tr key={doc.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                                            <File size={16} className="text-gray-400"/>
                                            {doc.fileName || doc.title}
                                        </td>
                                        <td className="px-6 py-4">{doc.owner?.fullName || "Okänd"}</td>
                                        <td className="px-6 py-4"><span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">{doc.type}</span></td>
                                        <td className="px-6 py-4 text-gray-500">{doc.uploadDate}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <a href={`http://127.0.0.1:8080${doc.fileUrl}`} target="_blank" className="text-indigo-600 hover:text-indigo-800 font-medium">Ladda ner</a>
                                                <button onClick={() => handleDeleteDoc(doc.id, true)} className="text-red-500 hover:text-red-700 font-medium">Ta bort</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {allDocuments.length === 0 && <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">Inga filer i systemet.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

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

    const [registerForm, setRegisterForm] = useState({
        firstName: '', lastName: '', ssn: '', address: '', phone: '', email: '',
        username: '', password: '', role: 'STUDENT'
    });
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
    useEffect(() => {
        if (token && currentUser) {
            initData();
        }
    }, [token, currentUser]);

    useEffect(() => {
        if (view === 'course-detail' && selectedCourseId) {
            fetchCourseDetails(selectedCourseId);
            fetchAssignments(selectedCourseId);
        }
    }, [selectedCourseId, view]);

    useEffect(() => {
        if (selectedAssignment) fetchSubmissions(selectedAssignment.id);
    }, [selectedAssignment]);

    useEffect(() => {
        if (view === 'admin' && adminTab === 'docs') fetchAllDocuments();
    }, [view, adminTab]);

    const initData = async () => {
        setIsLoading(true);
        await fetchUsers();
        await fetchCourses();
        setIsLoading(false);
    };

    // --- AUTH ACTIONS ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginForm)
            });
            if (res.ok) {
                const data = await res.json();
                setToken(data.token);
                const userObj = { id: data.id, username: data.username, fullName: data.fullName, role: data.role };
                setCurrentUser(userObj);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(userObj));
                setLoginForm({ username: '', password: '' });
                setIsOffline(false);
            } else setError("Fel användarnamn eller lösenord.");
        } catch (err) { setError("Kunde inte nå servern."); }
        finally { setIsLoading(false); }
    };

    const handleGenerateUsernames = async () => {
        if (!registerForm.firstName || !registerForm.lastName || !registerForm.ssn) {
            setError("Fyll i Förnamn, Efternamn och Personnummer först.");
            return;
        }
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/users/generate-usernames`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: registerForm.firstName,
                    lastName: registerForm.lastName,
                    ssn: registerForm.ssn
                })
            });
            if (res.ok) {
                const suggestions = await res.json();
                setUsernameSuggestions(suggestions);
            } else {
                setError("Kunde inte generera förslag.");
            }
        } catch (err) {
            setError("Nätverksfel vid generering.");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!registerForm.username) return setError("Välj ett användarnamn!");
        setError(null);
        try {
            const headers = currentUser ? getAuthHeaders() : { 'Content-Type': 'application/json' };
            const res = await fetch(`${API_BASE}/users/register`, { method: 'POST', headers: headers, body: JSON.stringify(registerForm) });
            if (res.ok) {
                showMessage("Konto skapat!");
                if (!currentUser) setAuthView('login'); else fetchUsers();
                setRegisterForm({ firstName: '', lastName: '', ssn: '', address: '', phone: '', email: '', username: '', password: '', role: 'STUDENT' });
                setUsernameSuggestions([]);
            } else setError("Kunde inte registrera användare.");
        } catch (err) { setError("Nätverksfel vid registrering."); }
    };

    const logout = () => {
        setToken(null); setCurrentUser(null);
        localStorage.removeItem('token'); localStorage.removeItem('user');
        setView('dashboard');
    };

    // --- API CALLS ---
    const fetchUsers = async () => {
        try { const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() }); if (res.ok) setUsers(await res.json()); else if (res.status === 401) logout(); } catch (err) { setIsOffline(true); }
    };
    const fetchCourses = async () => {
        try { const res = await fetch(`${API_BASE}/courses`, { headers: getAuthHeaders() }); if(res.ok) setCourses(await res.json()); } catch (err) {}
    };
    const fetchCourseDetails = async (id) => {
        setCurrentCourse(null); setMaterials([]);
        try {
            const cRes = await fetch(`${API_BASE}/courses/${id}`, { headers: getAuthHeaders() });
            if (cRes.ok) setCurrentCourse(await cRes.json());
            const mRes = await fetch(`${API_BASE}/courses/${id}/materials`, { headers: getAuthHeaders() });
            if (mRes.ok) setMaterials(await mRes.json());
        } catch (err) { setError("Fel vid hämtning."); }
    };
    const fetchAssignments = async (cid) => {
        try { const res = await fetch(`${API_BASE}/courses/${cid}/assignments`, { headers: getAuthHeaders() }); if (res.ok) setAssignments(await res.json()); } catch (err) {}
    };
    const fetchSubmissions = async (aid) => {
        try { const res = await fetch(`${API_BASE}/assignments/${aid}/submissions`, { headers: getAuthHeaders() }); if (res.ok) setSubmissions(await res.json()); } catch (err) {}
    };
    const fetchDocuments = async (uid) => {
        try { const res = await fetch(`${API_BASE}/documents/user/${uid}`, { headers: getAuthHeaders() }); if (res.ok) setDocuments(await res.json()); } catch (err) {}
    };
    const fetchAllDocuments = async () => {
        try { const res = await fetch(`${API_BASE}/documents/all`, { headers: getAuthHeaders() }); if (res.ok) setAllDocuments(await res.json()); } catch (err) {}
    };

    // --- ACTION HANDLERS ---
    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        const payload = { name: courseForm.name, courseCode: courseForm.courseCode, description: courseForm.description, startDate: courseForm.startDate || null };
        try {
            const res = await fetch(`${API_BASE}/courses?teacherId=${courseForm.teacherId}`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload) });
            if (res.ok) { showMessage('Kurs skapad!'); setShowCourseModal(false); fetchCourses(); }
        } catch (err) {}
    };
    const handleDeleteCourse = async (id, e) => {
        if (e) e.stopPropagation();
        if(!window.confirm("Ta bort kurs? Allt material försvinner.")) return;
        try {
            const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (res.ok) { showMessage('Kurs borttagen!'); fetchCourses(); if(selectedCourseId === id) navigateTo('courses'); }
        } catch (err) {}
    };
    const handleAttemptDeleteUser = async (user) => {
        try {
            const res = await fetch(`${API_BASE}/documents/user/${user.id}`, { headers: getAuthHeaders() });
            if (res.ok) {
                const docs = await res.json();
                if (docs.length > 0) setPendingDeleteUser({ user, docs });
                else if(window.confirm(`Ta bort ${user.fullName}?`)) performDeleteUser(user.id);
            }
        } catch (err) { setError("Kunde inte kontrollera filer."); }
    };
    const performDeleteUser = async (userId) => {
        try {
            if (pendingDeleteUser) for (const doc of pendingDeleteUser.docs) await fetch(`${API_BASE}/documents/${doc.id}`, { method: 'DELETE', headers: getAuthHeaders() });
            const res = await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (res.ok) { showMessage("Användare raderad."); setPendingDeleteUser(null); fetchUsers(); }
        } catch (err) { setError("Fel vid radering."); }
    };
    const handleDocSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(); formData.append("file", docFile); formData.append("title", docTitle); formData.append("type", docType); formData.append("description", docDesc);
        try {
            const res = await fetch(`${API_BASE}/documents/user/${currentUser.id}`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            if (res.ok) { showMessage('Uppladdat!'); setDocFile(null); fetchDocuments(currentUser.id); }
        } catch (err) {}
    };
    const handleDeleteDoc = async (id, refreshAll = false) => {
        if(!window.confirm("Ta bort filen?")) return;
        try {
            const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
            if (res.ok) { if (refreshAll) fetchAllDocuments(); else fetchDocuments(currentUser.id); }
        } catch (err) {}
    };
    const handleMaterialSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(); formData.append("title", matTitle); formData.append("content", matContent); formData.append("link", matLink); formData.append("type", matType); if (matFile) formData.append("file", matFile);
        try {
            const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/materials`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
            if (res.ok) { showMessage('Material tillagt!'); setMatFile(null); fetchCourseDetails(selectedCourseId); }
        } catch (err) {}
    };
    const handleDeleteMaterial = async (matId) => {
        if(!window.confirm("Ta bort?")) return;
        try { const res = await fetch(`${API_BASE}/courses/materials/${matId}`, { method: 'DELETE', headers: getAuthHeaders() }); if(res.ok) fetchCourseDetails(selectedCourseId); } catch(e){}
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/courses/${selectedCourseId}/assignments`, {
                method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(assignmentForm)
            });
            if (res.ok) { showMessage("Uppgift skapad!"); setAssignmentForm({ title: '', description: '', dueDate: '' }); setShowAssignmentModal(false); fetchAssignments(selectedCourseId); }
        } catch (err) {}
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        if (!submissionFile) return setError("Välj fil!");
        const formData = new FormData(); formData.append("file", submissionFile);
        try {
            const res = await fetch(`${API_BASE}/assignments/${selectedAssignment.id}/submit/${currentUser.id}`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
            });
            if (res.ok) { showMessage("Inlämnat!"); setSubmissionFile(null); fetchSubmissions(selectedAssignment.id); }
        } catch (err) { setError("Kunde inte skicka in."); }
    };

    const handleGradeSubmission = async (submissionId) => {
        const data = grading[submissionId];
        try {
            const params = new URLSearchParams(); params.append('grade', data.grade); params.append('feedback', data.feedback);
            const res = await fetch(`${API_BASE}/submissions/${submissionId}/grade?${params.toString()}`, { method: 'POST', headers: getAuthHeaders() });
            if (res.ok) { showMessage("Betyg sparat!"); fetchSubmissions(selectedAssignment.id); }
        } catch (err) {}
    };

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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                                <input className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                       value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} placeholder="t.ex. Inlämning 1" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                <input type="datetime-local" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                       value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
                                <textarea className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                                          value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} placeholder="Vad ska göras?" />
                            </div>
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

                    {/* DASHBOARD (Kan också brytas ut om du vill) */}
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

                    {/* COURSES (Kan brytas ut) */}
                    {view === 'courses' && (
                        <div>
                            <h1 className="text-3xl font-bold mb-6">Alla Kurser</h1>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{courses.map(c => (<div key={c.id} onClick={() => navigateTo('course-detail', c.id)} className="bg-white p-6 rounded-xl border hover:shadow-lg cursor-pointer transition-all"><h3 className="text-lg font-bold">{c.name}</h3><div className="text-sm text-gray-500">{c.courseCode}</div></div>))}</div>
                        </div>
                    )}

                    {/* DOCUMENTS (Kan brytas ut) */}
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

                    {/* COURSE DETAIL - Lämnar kvar för stunden (det är en komplex vy) */}
                    {view === 'course-detail' && currentCourse && (
                        <div className="animate-in slide-in-from-right-4 duration-500">
                            <button onClick={() => navigateTo('courses')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-6"><ArrowLeft size={18}/> Tillbaka</button>
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-l-4 border-l-indigo-600 mb-8"><span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{currentCourse.courseCode}</span><h1 className="text-4xl font-bold mt-4 mb-2">{currentCourse.name}</h1><p className="text-gray-600">{currentCourse.description}</p></div>
                            <div className="flex border-b border-gray-200 mb-6"><button onClick={() => { setActiveTab('material'); setSelectedAssignment(null); }} className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'material' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Kursmaterial</button><button onClick={() => { setActiveTab('assignments'); setSelectedAssignment(null); }} className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'assignments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Uppgifter</button></div>

                            {activeTab === 'material' && (
                                <div className="space-y-8">
                                    {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && (
                                        <div className="bg-gray-50 border border-dashed p-6 rounded-xl"><h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Nytt Material</h3><form onSubmit={handleMaterialSubmit} className="space-y-4"><div className="grid grid-cols-2 gap-4"><input className="border rounded-lg px-4 py-2" placeholder="Titel" value={matTitle} onChange={e => setMatTitle(e.target.value)} /><select className="border rounded-lg px-4 py-2 bg-white" value={matType} onChange={e => setMatType(e.target.value)}><option value="TEXT">Text</option><option value="VIDEO">Video</option><option value="FILE">Fil</option><option value="LINK">Länk</option></select></div><textarea className="border rounded-lg w-full px-4 py-2" placeholder="Innehåll..." value={matContent} onChange={e => setMatContent(e.target.value)} />{(matType === 'VIDEO' || matType === 'LINK') && <input className="border rounded-lg w-full px-4 py-2" placeholder="Länk..." value={matLink} onChange={e => setMatLink(e.target.value)} />}{matType === 'FILE' && <input id="matFileInput" type="file" onChange={e => setMatFile(e.target.files[0])} />}<button className="bg-indigo-600 text-white px-6 py-2 rounded-lg">Publicera</button></form></div>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{materials.map(mat => { const youtubeId = getYoutubeEmbed(mat.link); const isRead = readMaterials[mat.id]; return (<div key={mat.id} className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-lg ${isRead ? 'border-green-200 bg-green-50/30' : ''}`}><div className="flex justify-between items-start mb-4"><div className="p-2 bg-gray-50 rounded-lg border">{getIcon(mat.type)}</div><div className="flex gap-1"><button onClick={() => toggleReadStatus(mat.id)} className={`p-1.5 rounded-full ${isRead ? 'text-green-600 bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}>{isRead ? <CheckCircle size={18}/> : <Eye size={18}/>}</button>{(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && <button onClick={() => handleDeleteMaterial(mat.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>}</div></div><h3 className="font-bold mb-2">{mat.title}</h3>{youtubeId && <iframe className="w-full h-40 rounded-lg mb-4" src={`https://www.youtube.com/embed/${youtubeId}`} frameBorder="0" allowFullScreen></iframe>}<p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{mat.content}</p>{mat.fileUrl ? <a href={`http://127.0.0.1:8080${mat.fileUrl}`} target="_blank" className="text-xs font-bold text-indigo-600 flex items-center gap-1"><Download size={14}/> Ladda ner</a> : null}{mat.link && !youtubeId && <a href={mat.link} target="_blank" className="text-xs font-bold text-blue-600 flex items-center gap-1"><LinkIcon size={14}/> Öppna länk</a>}</div>)})}</div>
                                </div>
                            )}

                            {activeTab === 'assignments' && (
                                <div>
                                    {!selectedAssignment ? (
                                        <div className="space-y-6">
                                            {(currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') && (<button onClick={() => setShowAssignmentModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"><Plus size={18}/> Skapa Ny Uppgift</button>)}
                                            <div className="grid gap-4">{assignments.map(assign => (<div key={assign.id} onClick={() => setSelectedAssignment(assign)} className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md cursor-pointer transition-all flex justify-between items-center group"><div><h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{assign.title}</h3><div className="flex items-center gap-4 mt-1 text-sm text-gray-500"><span className="flex items-center gap-1"><Clock size={14}/> Deadline: {new Date(assign.dueDate).toLocaleString()}</span></div></div><ChevronRight className="text-gray-300 group-hover:text-indigo-500"/></div>))}</div>
                                        </div>
                                    ) : (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <button onClick={() => setSelectedAssignment(null)} className="text-sm text-gray-500 hover:text-indigo-600 mb-4 flex items-center gap-1"><ArrowLeft size={14}/> Tillbaka</button>
                                            <div className="bg-white rounded-xl border p-8 mb-8"><div className="flex justify-between items-start mb-6"><div><h2 className="text-2xl font-bold text-gray-900">{selectedAssignment.title}</h2><div className="flex items-center gap-2 text-indigo-600 mt-2 font-medium"><Clock size={18}/><span>Deadline: {new Date(selectedAssignment.dueDate).toLocaleString()}</span></div></div><div className="p-3 bg-indigo-50 rounded-full text-indigo-600"><CheckSquare size={24}/></div></div><div className="prose text-gray-600 max-w-none whitespace-pre-wrap">{selectedAssignment.description}</div></div>
                                            {currentUser.role === 'STUDENT' && (<div className="bg-white rounded-xl border p-6"><h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Upload size={20}/> Din Inlämning</h3>{getMySubmission() ? (<div className="bg-green-50 border border-green-200 rounded-lg p-4"><div className="flex items-center gap-3 text-green-800 font-bold mb-2"><CheckCircle size={20}/> Inlämnad</div><p className="text-sm text-green-700">Fil: <strong>{getMySubmission().fileName}</strong></p><p className="text-xs text-green-600 mt-1">{new Date(getMySubmission().submittedAt).toLocaleString()}</p>{getMySubmission().grade && (<div className="mt-4 pt-4 border-t border-green-200"><div className="flex items-center gap-2 mb-2"><GraduationCap size={20} className="text-indigo-600"/><span className="font-bold text-gray-800">Betyg: {getMySubmission().grade}</span></div>{getMySubmission().feedback && (<p className="text-sm text-gray-600 italic">"{getMySubmission().feedback}"</p>)}</div>)}</div>) : (<form onSubmit={handleStudentSubmit} className="space-y-4"><div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500"><input type="file" onChange={e => setSubmissionFile(e.target.files[0])} className="mb-4"/><p className="text-sm">Välj en fil att ladda upp.</p></div><button className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Lämna In</button></form>)}</div>)}
                                            {(currentUser.role === 'TEACHER' || currentUser.role === 'ADMIN') && (<div className="bg-white rounded-xl border overflow-hidden"><div className="p-6 border-b bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-gray-800">Inlämningar ({submissions.length})</h3></div><div className="divide-y">{submissions.map(sub => (<div key={sub.id} className="p-6 hover:bg-gray-50 transition-colors"><div className="flex justify-between items-start mb-4"><div><h4 className="font-bold text-gray-800 text-lg">{sub.studentName}</h4><div className="flex items-center gap-2 text-sm text-gray-500 mt-1"><span>{new Date(sub.submittedAt).toLocaleString()}</span><span>•</span><a href={`http://127.0.0.1:8080${sub.fileUrl}`} target="_blank" className="text-indigo-600 hover:underline flex items-center gap-1"><File size={14}/> {sub.fileName}</a></div></div>{sub.grade ? (<span className={`px-3 py-1 rounded-full text-sm font-bold ${sub.grade === 'IG' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>Betyg: {sub.grade}</span>) : <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Ej Rättad</span>}</div><div className="bg-gray-50 p-4 rounded-lg border"><div className="flex gap-4 mb-3"><div className="w-32"><label className="block text-xs font-bold text-gray-500 mb-1">Betyg</label><select className="w-full border rounded p-1 bg-white" value={grading[sub.id]?.grade || 'G'} onChange={e => setGrading({...grading, [sub.id]: { ...grading[sub.id], grade: e.target.value }})}><option value="IG">IG</option><option value="G">G</option><option value="VG">VG</option></select></div><div className="flex-1"><label className="block text-xs font-bold text-gray-500 mb-1">Feedback</label><input className="w-full border rounded p-1 bg-white" placeholder="Kommentar..." value={grading[sub.id]?.feedback || ''} onChange={e => setGrading({...grading, [sub.id]: { ...grading[sub.id], feedback: e.target.value }})} /></div></div><div className="text-right"><button onClick={() => handleGradeSubmission(sub.id)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 font-medium">Spara</button></div></div></div>))}</div></div>)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;