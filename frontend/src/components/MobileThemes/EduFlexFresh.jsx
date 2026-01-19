import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, BookOpen, Users, FolderOpen, Menu, X, LogOut, Search, Bell, ChevronRight, Play, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useBranding } from '../../context/BrandingContext';

// Import Shared Views
import MobileDashboardView from './views/MobileDashboardView';
import MobileCourseView from './views/MobileCourseView';
import MobileAvatar from './views/MobileAvatar';
import MobileThemeSelector from './mobilecomponents/MobileThemeSelector';
import MobileResourcesView from './views/MobileResourcesView';
import MobileAuthorizationView from './views/MobileAdminView'; // Using AdminView shared
import MobileCommunicationView from './views/MobileCommunicationView';
import MobileProfileView from './views/MobileProfileView';
import { MessageSquare } from 'lucide-react'; // Added MessageSquare

// --- HELPER COMPONENTS ---

const MobileFloatingNav = ({ currentView, setView, onMenuClick, unreadCount = 0 }) => (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-100 px-6 py-3 pb-6 flex justify-between items-center text-gray-400">
        <button onClick={() => setView('dashboard')} className={`flex flex-col items-center gap-1 ${currentView === 'dashboard' ? 'text-indigo-600' : ''}`}>
            <Home size={24} />
            <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => setView('courses')} className={`flex flex-col items-center gap-1 ${currentView === 'courses' ? 'text-indigo-600' : ''}`}>
            <BookOpen size={24} />
            <span className="text-[10px] font-medium">Courses</span>
        </button>
        <button onClick={() => setView('communication')} className={`relative flex flex-col items-center gap-1 ${currentView === 'communication' ? 'text-indigo-600' : ''}`}>
            <MessageSquare size={24} />
            <span className="text-[10px] font-medium">Chat</span>
            {unreadCount > 0 && (
                <span className="absolute top-0 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            )}
        </button>
        <button onClick={() => setView('resources')} className={`flex flex-col items-center gap-1 ${currentView === 'resources' ? 'text-indigo-600' : ''}`}>
            <FolderOpen size={24} />
            <span className="text-[10px] font-medium">Files</span>
        </button>
        <button onClick={onMenuClick} className="flex flex-col items-center gap-1">
            <Menu size={24} />
            <span className="text-[10px] font-medium">Menu</span>
        </button>
    </div>
);

const SimpleInternalMenu = ({ isOpen, onClose, onLogout, onThemeChange }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] bg-black/50 backdrop-blur-sm flex justify-end animate-in slide-in-from-right">
            <div className="bg-white w-3/4 max-w-sm h-full p-6 space-y-6 shadow-2xl">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">EduFlex Fresh</h3>
                    <button onClick={onClose}><X size={24} className="text-gray-400" /></button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <MobileThemeSelector />
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center gap-2 text-red-600 font-bold mt-4">
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 text-center text-red-600 bg-white min-h-screen pt-20">
                    <h1 className="text-2xl font-bold mb-4">App Error</h1>
                    <pre className="text-xs bg-red-50 p-4 rounded text-left overflow-auto max-w-sm mx-auto border border-red-100 text-red-800">
                        {this.state.error?.toString()}
                    </pre>
                    <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Reload</button>
                </div>
            );
        }
        return this.props.children;
    }
}

// --- SUB-VIEWS ---

const UsersView = ({ users }) => (
    <div className="px-6 pt-6 pb-32 animate-in fade-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">People</h2>
        <div className="space-y-4">
            {users.map((u, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-gray-100 pb-4">
                    <MobileAvatar user={u} className="w-10 h-10 rounded-full text-base" />
                    <div>
                        <h3 className="font-bold text-gray-900">{u.fullName || u.name}</h3>
                        <p className="text-xs text-gray-500 capitalize">{u.role?.name || u.role}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const CoursesView = ({ courses, onCourseClick }) => (
    <div className="px-6 pt-6 pb-32 animate-in fade-in">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All Courses</h2>
        <div className="grid grid-cols-1 gap-4">
            {courses.map((c, i) => (
                <div key={i} onClick={() => onCourseClick(c)} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm active:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={20} /></div>
                        <span className="text-xs font-bold text-gray-400">{c.code}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{c.name}</h3>
                    <p className="text-sm text-gray-500">View details →</p>
                </div>
            ))}
        </div>
    </div>
);

// --- MAIN COMPONENT ---

const EduFlexFresh = ({ currentUser }) => {
    const navigate = useNavigate();
    const { getCustomTheme, updateBranding } = useBranding();

    // State
    const [view, setView] = useState('dashboard');
    const [localMenuOpen, setLocalMenuOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Data
    const [allUsers, setAllUsers] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ unreadMessages: 0 });

    useEffect(() => {
        const load = async () => {
            if (!currentUser) return;
            try {
                const isStudent = currentUser?.role === 'STUDENT' || currentUser?.role?.name === 'STUDENT';
                const [users, courses, unread] = await Promise.all([
                    api.users.getAll(0, 100),
                    isStudent ? api.courses.getMyCourses(currentUser.id) : api.courses.getAll(),
                    api.messages.getUnreadCount()
                ]);

                // Safe Array Handling
                setAllUsers(users?.content || users || []);
                setAllCourses(Array.isArray(courses) ? courses : (courses?.content || []));
                setStats({ unreadMessages: unread || 0 });
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        load();
    }, [currentUser]);

    const handleThemeChange = async (newThemeId) => {
        try {
            const currentTheme = getCustomTheme() || {};
            const updatedTheme = { ...currentTheme, mobile: { ...currentTheme.mobile, id: newThemeId } };
            await updateBranding({ customTheme: JSON.stringify(updatedTheme) });
            window.location.reload();
        } catch (e) { console.error(e); }
    };

    const handleCourseClick = (c) => {
        setSelectedCourse(c);
        setView('course');
    };

    return (
        <ErrorBoundary>
            <div className="bg-white min-h-screen text-gray-900 font-sans selection:bg-indigo-100 pb-20">

                <SimpleInternalMenu
                    isOpen={localMenuOpen}
                    onClose={() => setLocalMenuOpen(false)}
                    onLogout={() => navigate('/login')}
                    onThemeChange={handleThemeChange}
                />

                {/* Header removed - using StandardLayout's MobileHeader instead */}

                {/* Views */}
                {view === 'users' && <UsersView users={allUsers} />}
                {view === 'courses' && <CoursesView courses={allCourses} onCourseClick={handleCourseClick} />}
                {view === 'course' && <MobileCourseView course={selectedCourse} onBack={() => setView('courses')} />}

                {view === 'resources' && <MobileResourcesView currentUser={currentUser} themeMode="light" />}
                {view === 'communication' && <MobileCommunicationView currentUser={currentUser} themeMode="light" />}
                {view === 'profile' && <MobileProfileView currentUser={currentUser} onLogout={() => navigate('/login')} />}

                {view === 'dashboard' && <MobileDashboardView currentUser={currentUser} setView={setView} themeMode="light" />}

                {/* Grading/Applications redirect handled by DashboardView, ensure simple containers exist if needed or let standard views handle it */}
                {view === 'grading' && (
                    <div className="px-6 pt-6 pb-32 animate-in fade-in">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Grading</h2>
                        <button onClick={() => setView('dashboard')} className="text-indigo-600 font-bold">Back</button>
                    </div>
                )}
                {view === 'applications' && (
                    <div className="px-6 pt-6 pb-32 animate-in fade-in">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Applications</h2>
                        <button onClick={() => setView('dashboard')} className="text-indigo-600 font-bold">Back</button>
                    </div>
                )}

                <MobileFloatingNav currentView={view} setView={setView} onMenuClick={() => setLocalMenuOpen(true)} unreadCount={stats.unreadMessages} />
            </div>
        </ErrorBoundary>
    );
};

export default EduFlexFresh;
