import React, { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // <--- IMPORT

// Services & Context
import { api } from './services/api';
import { AppProvider, useAppContext } from './context/AppContext';

// Layouts & Components
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboards';
import { QuizBuilderModal, QuizRunnerModal } from './components/QuizModals';
import LicenseLockScreen from './components/LicenseLockScreen';
import ChatOverlay from './components/ChatOverlay';

// Pages
import AdminPanel from './pages/AdminPanel';
import CourseDetail from './pages/CourseDetail';
import CourseCatalog from './pages/CourseCatalog';
import DocumentManager from './pages/DocumentManager';
import UserProfile from './pages/UserProfile';

const AppContent = () => {
    const { t, i18n } = useTranslation(); // <--- HOOK
    const {
        currentUser, token, login, licenseStatus, setLicenseStatus, systemSettings, fetchSystemSettings
    } = useAppContext();

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [licenseError, setLicenseError] = useState(null);

    // Data States
    const [myCourses, setMyCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [users, setUsers] = useState([]);
    const [upcomingAssignments, setUpcomingAssignments] = useState([]);
    const [ungradedSubmissions, setUngradedSubmissions] = useState([]);
    const [allAssignments, setAllAssignments] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [availableCourses, setAvailableCourses] = useState([]);

    // Auth Forms
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ firstName: '', lastName: '', ssn: '', email: '', username: '', password: '', role: 'STUDENT' });
    const [usernameSuggestions, setUsernameSuggestions] = useState([]);
    const [authView, setAuthView] = useState('login');

    const [adminTab, setAdminTab] = useState('users');

    // --- FIX: LANGUAGE PERSISTENCE ---
    useEffect(() => {
        if (currentUser && currentUser.language) {
            // Om användaren är inloggad, tvinga appen att använda deras språk
            if (i18n.language !== currentUser.language) {
                i18n.changeLanguage(currentUser.language);
            }
        }
    }, [currentUser, i18n]);

    // --- HANTERA MÖRKT LÄGE (DARK MODE) ---
    useEffect(() => {
        // Kontrollera systeminställningarna
        if (systemSettings && systemSettings['dark_mode_enabled'] === 'true') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [systemSettings]);

    useEffect(() => {
        if (licenseStatus === 'valid' && currentUser) {
            initData();
        }
    }, [licenseStatus, currentUser]);

    const initData = async () => {
        setIsLoading(true);
        try {
            const [usersData, coursesData] = await Promise.all([
                api.users.getAll(),
                api.courses.getAll()
            ]);
            setUsers(usersData || []);
            setAllCourses(coursesData || []);
            updateMyCourses(coursesData || []);

            if (currentUser.role === 'ADMIN') {
                const docs = await api.documents.getAll();
                setDocuments(docs || []);
            }
            if (currentUser.role === 'ADMIN' || currentUser.role === 'TEACHER') {
                await fetchAllLmsData();
            }
        } catch (e) {
            console.error("Init data error", e);
        } finally {
            setIsLoading(false);
        }
    };

    const updateMyCourses = (courses) => {
        if (!currentUser) return;
        if (currentUser.role === 'STUDENT') setMyCourses(courses.filter(c => c.students?.some(s => s.id === currentUser.id)));
        else if (currentUser.role === 'TEACHER') setMyCourses(courses.filter(c => c.teacher?.id === currentUser.id));
        else setMyCourses(courses);
    };

    const fetchAllLmsData = async () => {
        try {
            const courses = await api.courses.getAll();
            let allAss = [];
            let allSubs = [];
            for (const course of courses) {
                const assigns = await api.assignments.getByCourse(course.id);
                if(assigns) {
                    allAss = [...allAss, ...assigns.map(a => ({...a, courseId: course.id}))];
                    if (currentUser.role !== 'STUDENT') {
                        for (const assign of assigns) {
                            const subs = await api.assignments.getSubmissions(assign.id);
                            if(subs) allSubs = [...allSubs, ...subs.map(s => ({...s, assignmentId: assign.id}))];
                        }
                    }
                }
            }
            setAllAssignments(allAss);
            setAllSubmissions(allSubs);
        } catch (e) { console.error("LMS Data Error", e); }
    };

    const showMessage = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await api.auth.login(loginForm);
            if (data && data.token) {
                login({ id: data.id, username: data.username, fullName: data.fullName, role: data.role, language: data.language }, data.token);
            } else {
                setError(t('messages.login_failed'));
            }
        } catch (e) { setError(t('messages.login_error')); }
        finally { setIsLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const addr = `${registerForm.street}, ${registerForm.zip} ${registerForm.city}, ${registerForm.country}`;
            await api.users.register({ ...registerForm, address: addr });
            showMessage(t('messages.account_created'));
            setAuthView('login');
        } catch (e) { setError(t('messages.register_error')); }
    };

    const handleGenerateUsernames = async () => {
        try {
            const suggestions = await api.users.generateUsernames(registerForm);
            setUsernameSuggestions(suggestions);
        } catch { setError("Kunde inte generera användarnamn."); }
    };

    const handleActivateLicense = async (key) => {
        setIsLoading(true);
        try {
            const res = await api.system.activateLicense(key);
            if (res.message) {
                showMessage(t('messages.license_approved'));
                setLicenseStatus('valid');
            } else {
                setLicenseError(res.error);
            }
        } catch { setLicenseError(t('messages.license_error')); }
        finally { setIsLoading(false); }
    };

    const handleAdminUpload = async (file, title, description) => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", title);
        fd.append("type", "DOCUMENT");
        if(description) fd.append("description", description);
        try {
            await api.documents.upload(currentUser.id, fd);
            showMessage(t('messages.upload_success'));
            const docs = await api.documents.getAll();
            setDocuments(docs);
        } catch { setError(t('messages.upload_error')); }
    };

    const handleUpdateSetting = async (key, value) => {
        try {
            await api.settings.update(key, value);
            fetchSystemSettings();
            showMessage(t('messages.setting_saved'));
        } catch { setError(t('messages.setting_error')); }
    };

    const handleDeleteUser = async (u) => {
        if(!window.confirm(`Radera ${u.fullName}?`)) return;
        try {
            await api.users.delete(u.id);
            showMessage(t('messages.user_deleted'));
            const users = await api.users.getAll();
            setUsers(users);
        } catch { setError(t('messages.delete_error')); }
    };

    const handleDeleteCourse = async (id) => {
        if(!window.confirm("Radera kurs?")) return;
        try {
            await api.courses.delete(id);
            showMessage(t('messages.course_deleted'));
            const c = await api.courses.getAll();
            setAllCourses(c);
        } catch { setError(t('messages.course_delete_error')); }
    };

    const handleDeleteDoc = async (id) => {
        if(!window.confirm("Radera?")) return;
        try {
            await api.documents.delete(id);
            const d = await api.documents.getAll();
            setDocuments(d);
        } catch {}
    };

    if (licenseStatus === 'checking') return <div className="h-screen flex items-center justify-center bg-gray-900 text-white"><Loader2 className="animate-spin"/></div>;
    if (licenseStatus === 'locked') return <LicenseLockScreen onActivate={handleActivateLicense} error={licenseError} isLoading={isLoading} />;

    if (!token || !currentUser) {
        return <Auth
            authView={authView} setAuthView={setAuthView}
            loginForm={loginForm} setLoginForm={setLoginForm} handleLogin={handleLogin} error={error}
            registerForm={registerForm} setRegisterForm={setRegisterForm} handleRegister={handleRegister}
            handleGenerateUsernames={handleGenerateUsernames} usernameSuggestions={usernameSuggestions}
        />;
    }

    return (
        <BrowserRouter>
            <Layout>
                {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"><AlertTriangle size={20}/> {error}</div>}
                {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-3"><CheckCircle size={20}/> {message}</div>}

                <Routes>
                    <Route path="/" element={
                        <Dashboard
                            currentUser={currentUser} myCourses={myCourses} allCourses={allCourses} documents={documents}
                            users={users} upcomingAssignments={upcomingAssignments} ungradedSubmissions={ungradedSubmissions}
                            allAssignments={allAssignments} allSubmissions={allSubmissions}
                        />
                    }/>

                    <Route path="/admin" element={
                        currentUser.role === 'ADMIN' ? (
                            <AdminPanel
                                adminTab={adminTab} setAdminTab={setAdminTab}
                                users={users} currentUser={currentUser}
                                handleAttemptDeleteUser={handleDeleteUser}
                                courses={allCourses} handleDeleteCourse={handleDeleteCourse}
                                allDocuments={documents} fetchAllDocuments={async () => { const d = await api.documents.getAll(); setDocuments(d); }}
                                handleDeleteDoc={handleDeleteDoc}
                                handleAdminUpload={handleAdminUpload}
                                systemSettings={systemSettings} onUpdateSetting={handleUpdateSetting}
                                registerForm={registerForm} setRegisterForm={setRegisterForm} handleRegister={handleRegister}
                                handleGenerateUsernames={handleGenerateUsernames} usernameSuggestions={usernameSuggestions}
                            />
                        ) : <Navigate to="/" />
                    }/>

                    <Route path="/course/:id" element={
                        <CourseWrapper currentUser={currentUser} users={users} showMessage={showMessage} />
                    }/>

                    <Route path="/documents" element={
                        <DocumentManager
                            documents={documents}
                            handleUploadDoc={async (file) => { /* User upload logic if needed */ }}
                            handleDeleteDoc={async (id) => { /* User delete logic */ }}
                            currentUser={currentUser}
                        />
                    }/>

                    <Route path="/profile" element={
                        <UserProfile currentUser={currentUser} showMessage={showMessage} refreshUser={initData} API_BASE={'http://127.0.0.1:8080/api'} getAuthHeaders={() => ({ 'Authorization': `Bearer ${token}` })} />
                    }/>

                    <Route path="/catalog" element={
                        <CourseCatalog
                            availableCourses={availableCourses}
                            handleEnroll={async (cid) => { await api.courses.enroll(cid, currentUser.id); showMessage(t('messages.joined_course')); initData(); }}
                        />
                    }/>

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>

                {/* --- VILLKORLIG RENDERING AV CHATTEN --- */}
                {systemSettings['chat_enabled'] === 'true' && (
                    <ChatOverlay currentUser={currentUser} API_BASE={'http://127.0.0.1:8080/api'} token={token} />
                )}
            </Layout>
        </BrowserRouter>
    );
};

const CourseWrapper = ({ currentUser, users, showMessage }) => {
    const { id } = useParams();
    const { t } = useTranslation();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        if(id) {
            api.courses.getOne(id).then(setCourse);
        }
    }, [id]);

    if (!course) return <div>{t('messages.loading_course')}</div>;

    return (
        <CourseDetail
            currentUser={currentUser}
        />
    );
};

const App = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;