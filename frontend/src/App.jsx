import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { ModuleProvider } from './context/ModuleContext';
import { GamificationProvider } from './context/GamificationContext';
import { BrandingProvider } from './context/BrandingContext';
import { DesignSystemProvider } from './context/DesignSystemContext';
import ErrorBoundary from './components/common/ErrorBoundary';

// --- LAYOUT ---
import Layout from './components/Layout';

// --- FEATURES ---
import LandingPage from './features/landing/LandingPage';
import Login from './features/auth/Login';
import RegisterOrganization from './features/auth/RegisterOrganization';
import OAuth2Callback from './features/auth/OAuth2Callback';
import LtiSuccess from './features/auth/LtiSuccess';
import Dashboard from './features/dashboard/Dashboard';
import CourseDetail from './features/courses/CourseDetail';
import CalendarView from './features/calendar/CalendarView';

// --- SYSTEM ---
import LicenseLock from './features/system/LicenseLock';
import SystemSettings from './features/system/SystemSettings';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import AchievementToast from './components/gamification/AchievementToast';

// --- DE RIKTIGA SIDORNA ---
import UserProfile from './features/profile/UserProfile';
import PublicProfile from './features/profile/PublicProfile';
import CourseCatalog from './features/catalog/CourseCatalog';
import DocumentManager from './features/documents/DocumentManager';
import AdminAdministrationPage from './features/dashboard/AdminAdministrationPage';
import ResourceBank from './features/resources/ResourceBank';
import AnalyticsDashboard from './features/analytics/AnalyticsDashboard';
import CertificateView from './features/certificates/CertificateView';
import EnterpriseWhitelabel from './features/admin/EnterpriseWhitelabel';
import SkolverketModule from './modules/skolverket/SkolverketModule';
import SupportPage from './features/support/SupportPage';
import CommunityHub from './features/community/CommunityHub';
import CommunityAdmin from './features/community/CommunityAdmin';

// --- PROTECTED ROUTE ---
const ProtectedRoute = ({ children, roles }) => {
    const { currentUser, licenseStatus } = useAppContext();

    // Om vi fortfarande kollar status
    if (licenseStatus === 'checking') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#131314] text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                <span className="text-sm">Verifierar sytemstatus...</span>
            </div>
        );
    }

    // Om ingen användare är inloggad -> Gå till login
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // Roll-kontroll
    // Roll-kontroll
    const userRole = currentUser.role?.name || currentUser.role;
    if (roles && !roles.includes(userRole)) {
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
            handleToggleCourseStatus={() => { }}
        />
    );
};

const AppRoutes = () => {
    const { currentUser, logout, licenseLocked, licenseStatus, refreshUser } = useAppContext();

    // 1. GLOBAL LICENSE LOCK (Triggered by 402 or explicit lock)
    if (licenseLocked || licenseStatus === 'locked') {
        return <LicenseLock />;
    }

    return (
        <ThemeProvider currentUser={currentUser}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register-org" element={<RegisterOrganization />} />
                <Route path="/oauth2/callback" element={<OAuth2Callback />} />
                <Route path="/lti-success" element={<LtiSuccess />} />

                {/* ROOT ROUTE: Landing for Guests / Dashboard for Users */}
                <Route path="/" element={
                    currentUser ? (
                        <ProtectedRoute>
                            <Layout currentUser={currentUser} handleLogout={logout}>
                                <DashboardWrapper currentUser={currentUser} />
                            </Layout>
                        </ProtectedRoute>
                    ) : (
                        <LandingPage />
                    )
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
                            <AdminAdministrationPage />
                        </Layout>
                    </ProtectedRoute>
                } />

                {/* SYSTEM SETTINGS for PRO/ENTERPRISE */}
                <Route path="/system" element={
                    <ProtectedRoute roles={['ADMIN', 'TEACHER']}>
                        <Layout currentUser={currentUser} handleLogout={logout}>
                            <SystemSettings />
                        </Layout>
                    </ProtectedRoute>
                } />

                {/* ENTERPRISE WHITELABEL (ADMIN ONLY) */}
                <Route path="/enterprise/whitelabel" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <Layout currentUser={currentUser} handleLogout={logout}>
                            <EnterpriseWhitelabel />
                        </Layout>
                    </ProtectedRoute>
                } />

                {/* COMMUNITY MODERATION (ADMIN ONLY) */}
                <Route path="/admin/community" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <Layout currentUser={currentUser} handleLogout={logout}>
                            <CommunityAdmin />
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

                <Route path="/analytics" element={
                    <ProtectedRoute roles={['ADMIN']}>
                        <Layout currentUser={currentUser} handleLogout={logout}>
                            <AnalyticsDashboard />
                        </Layout>
                    </ProtectedRoute>
                } />

                <Route path="/resources" element={
                    <ProtectedRoute roles={['TEACHER', 'ADMIN']}>
                        <Layout currentUser={currentUser} handleLogout={logout}>
                            <ResourceBank />
                        </Layout>
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <Layout currentUser={currentUser} handleLogout={logout}>
                            <UserProfile currentUser={currentUser} showMessage={(msg) => alert(msg)} refreshUser={refreshUser} />
                        </Layout>
                    </ProtectedRoute>
                } />

                <Route path="/profile/:userId" element={
                    <ProtectedRoute>
                        <Layout currentUser={currentUser} handleLogout={logout}>
                            <PublicProfile currentUser={currentUser} showMessage={(msg) => alert(msg)} />
                        </Layout>
                    </ProtectedRoute>
                } />

                <Route path="/certificate/:courseId" element={
                    <ProtectedRoute>
                        <CertificateView />
                    </ProtectedRoute>
                } />

                <Route path="/support" element={
                    <ProtectedRoute>
                        <Layout currentUser={currentUser} handleLogout={logout}>
                            <SupportPage currentUser={currentUser} />
                        </Layout>
                    </ProtectedRoute>
                } />

                {/* Community redirects to ResourceBank with community tab */}
                <Route path="/community" element={
                    <Navigate to="/resources?tab=community" replace />
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ThemeProvider>
    );
};

const App = () => {
    return (
        <AppProvider>
            <BrandingProvider>
                <DesignSystemProvider>
                    <ModuleProvider>
                        <GamificationProvider>
                            <ErrorBoundary>
                                <Toaster position="top-right" />
                                <AchievementToast />
                                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                                    <AppRoutes />
                                </Router>
                            </ErrorBoundary>
                        </GamificationProvider>
                    </ModuleProvider>
                </DesignSystemProvider>
            </BrandingProvider>
        </AppProvider>
    );
};

export default App;