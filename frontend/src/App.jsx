import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ModuleProvider } from './context/ModuleContext';

// --- LAYOUT ---
import Layout from './components/Layout';

// --- FEATURES ---
import Login from './features/auth/Login';
import Dashboard from './features/dashboard/Dashboard';
import CourseDetail from './features/courses/CourseDetail';
import CalendarView from './features/calendar/CalendarView';
import LicenseLockScreen from './features/auth/LicenseLockScreen';

// --- DE RIKTIGA SIDORNA ---
import UserProfile from './features/profile/UserProfile';
import CourseCatalog from './features/catalog/CourseCatalog';
import DocumentManager from './features/documents/DocumentManager';
// FIX: Ändrad sökväg eftersom AdminDashboard ligger i dashboard-mappen
import AdminDashboard from './features/dashboard/AdminDashboard';

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children, roles }) => {
    const { currentUser, licenseStatus } = useAppContext();

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
        const activateLicense = async (key) => {
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
                        <AdminDashboard />
                    </Layout>
                </ProtectedRoute>
            } />

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
            <ModuleProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </ModuleProvider>
        </AppProvider>
    );
};

export default App;