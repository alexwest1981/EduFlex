import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';

// --- LAYOUT ---
import Layout from './components/Layout';

// --- FEATURES ---
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import CourseDetail from './features/courses/CourseDetail';
import AdminPanel from './features/admin/AdminPanel';
import CalendarView from './features/calendar/CalendarView';
import LicenseLockScreen from './features/auth/LicenseLockScreen'; // Försäkra dig om att denna import stämmer

// --- DE RIKTIGA SIDORNA ---
import UserProfile from './features/profile/UserProfile';
import CourseCatalog from './features/catalog/CourseCatalog';
import DocumentManager from './features/documents/DocumentManager';

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children, roles }) => {
    const { currentUser, licenseStatus, api } = useAppContext();

    // Hantera licenslåsning
    const handleActivate = async (key) => {
        try {
            // Vi använder api direkt här, eller skickar ner funktionen till LicenseLockScreen
            // Men LicenseLockScreen i din fil använder 'onActivate' prop
            // Så logiken för aktivering ligger egentligen i LicenseLockScreen eller AppContext
            // Här renderar vi bara vyn.
        } catch (e) {
            console.error(e);
        }
    };

    // Om vi fortfarande kollar status
    if (licenseStatus === 'checking') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#131314] text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                Laddar systemstatus...
            </div>
        );
    }

    // Om licensen är ogiltig eller saknas -> Visa Låsskärm
    if (licenseStatus === 'locked' || licenseStatus === 'invalid') {
        // Vi behöver skicka en aktiveringsfunktion till LicenseLockScreen
        // Eftersom LicenseLockScreen gör API-anropet själv i din kod (via api.system.activateLicense),
        // behöver vi bara en callback för att ladda om sidan vid succé.
        const onActivateSuccess = () => {
            window.location.reload();
        };

        // OBS: Din LicenseLockScreen tar 'onActivate' som en funktion som tar en key och gör api-anropet?
        // Tittar på din bifogade LicenseLockScreen: Den tar `onActivate` och anropar den med `keyInput`.
        // Då måste vi definiera onActivate här.

        const activateLicense = async (key) => {
            // Här måste vi importera 'api' eller använda fetch direkt
            // Eftersom vi inte har 'api' i scope här (bara via hook), gör vi en fetch
            try {
                const res = await fetch('http://127.0.0.1:8080/api/system/license/activate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key })
                });
                if (res.ok) {
                    alert("Licens aktiverad! Startar om...");
                    window.location.reload();
                } else {
                    alert("Ogiltig licensnyckel.");
                }
            } catch (e) {
                alert("Kunde inte ansluta till servern.");
            }
        };

        return <LicenseLockScreen onActivate={activateLicense} />;
    }

    // Om ingen användare är inloggad -> Gå till login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Roll-kontroll
    if (roles && !roles.includes(currentUser.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// --- DATA WRAPPERS ---
const AdminWrapper = ({ currentUser }) => {
    const [adminTab, setAdminTab] = React.useState('users');
    return (
        <AdminPanel
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            currentUser={currentUser}
            users={[]}
            courses={[]}
            allDocuments={[]}
        />
    );
};

const DashboardWrapper = ({ currentUser }) => {
    return (
        <Dashboard
            currentUser={currentUser}
            myCourses={currentUser?.courses || []}
            upcomingAssignments={[]}
            users={[]}
            allCourses={[]}
            documents={[]}
            ungradedSubmissions={[]}
            handleToggleCourseStatus={()=>{}}
        />
    );
};

const AppRoutes = () => {
    const { currentUser, logout } = useAppContext();

    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
                <ProtectedRoute>
                    <Layout currentUser={currentUser} handleLogout={logout}>
                        <DashboardWrapper currentUser={currentUser} />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/course/:id" element={
                <ProtectedRoute>
                    <Layout currentUser={currentUser} handleLogout={logout}>
                        <CourseDetail currentUser={currentUser} />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/admin" element={
                <ProtectedRoute roles={['ADMIN']}>
                    <Layout currentUser={currentUser} handleLogout={logout}>
                        <AdminWrapper currentUser={currentUser} />
                    </Layout>
                </ProtectedRoute>
            } />

            {/* --- SIDOR --- */}
            <Route path="/calendar" element={
                <ProtectedRoute>
                    <Layout currentUser={currentUser} handleLogout={logout}>
                        <CalendarView />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/catalog" element={
                <ProtectedRoute>
                    <Layout currentUser={currentUser} handleLogout={logout}>
                        <CourseCatalog />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/documents" element={
                <ProtectedRoute>
                    <Layout currentUser={currentUser} handleLogout={logout}>
                        <DocumentManager currentUser={currentUser} />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <Layout currentUser={currentUser} handleLogout={logout}>
                        <UserProfile currentUser={currentUser} showMessage={(msg)=>alert(msg)} refreshUser={()=>{}} />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App = () => {
    return (
        <AppProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AppProvider>
    );
};

export default App;