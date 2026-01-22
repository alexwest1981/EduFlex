import React, { useState } from 'react';
import { HelpCircle, FileText, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';

// Modules (Now supporting mode="GLOBAL")
import QuizModule from '../../modules/quiz-runner/QuizModule';
import AssignmentsModule from '../../modules/assignments/AssignmentsModule';
import CourseContentModule from '../../modules/course-content/CourseContentModule';

const ResourceBank = () => {
    const { t } = useTranslation();
    const { currentUser } = useAppContext();
    const [activeTab, setActiveTab] = useState('quiz');

    const [selectedCourse, setSelectedCourse] = useState('ALL');
    const [courses, setCourses] = useState([]);

    // Normalisera rollnamnet (kan vara sträng eller objekt)
    const roleName = currentUser?.role?.name || currentUser?.role;

    React.useEffect(() => {
        // Fetch courses for the dropdown
        import('../../services/api').then(({ api }) => {
            api.courses.getAll().then(data => {
                // If teacher, filter for own courses? Or just show all? 
                // Using getAll for now, usually limiting to my courses is better UX
                setCourses(data);
            });
        });
    }, []);

    const tabs = [
        { key: 'quiz', label: 'Mina Quiz', icon: <HelpCircle size={18} /> },
        { key: 'assignments', label: 'Mina Uppgifter', icon: <FileText size={18} /> },
        { key: 'lessons', label: 'Mina Lektioner', icon: <BookOpen size={18} /> }
    ];

    // Helper to determine mode
    const viewingMode = selectedCourse === 'ALL' ? 'GLOBAL' : 'COURSE';
    const viewingCourseId = selectedCourse === 'ALL' ? null : selectedCourse;

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in">
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resursbank</h1>
                    <p className="text-gray-500 dark:text-gray-400">Hantera ditt undervisningsmaterial samlat på ett ställe.</p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-[#1E1F20] p-1 rounded-lg border border-gray-200 dark:border-[#3c4043] shadow-sm">
                    <span className="text-xs font-bold text-gray-500 px-2 uppercase">Visar för:</span>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="bg-gray-50 dark:bg-[#131314] border-none text-sm font-bold text-gray-900 dark:text-white rounded-md py-1.5 pl-2 pr-8 focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="ALL">Alla Kurser (Globalt)</option>
                        {courses.filter(c => roleName === 'ADMIN' || (c.teacherId === currentUser.id || c.teacher?.id === currentUser.id)).map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* TAB NAVIGATION */}
            <div className="flex gap-6 border-b border-gray-200 dark:border-[#3c4043] mb-8 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`pb-3 flex items-center gap-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap capitalize ${activeTab === tab.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="min-h-[500px]">
                {activeTab === 'quiz' && (
                    <QuizModule
                        courseId={viewingCourseId}
                        currentUser={currentUser}
                        isTeacher={true}
                        mode={viewingMode}
                    />
                )}
                {activeTab === 'assignments' && (
                    <AssignmentsModule
                        courseId={viewingCourseId}
                        currentUser={currentUser}
                        isTeacher={true}
                        mode={viewingMode}
                    />
                )}
                {activeTab === 'lessons' && (
                    <CourseContentModule
                        courseId={viewingCourseId}
                        isTeacher={true}
                        currentUser={currentUser}
                        mode={viewingMode}
                    />
                )}
            </div>
        </div>
    );
};

export default ResourceBank;
