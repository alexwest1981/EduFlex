import React, { useState, Suspense } from 'react';
import { Briefcase, Target } from 'lucide-react';

const CareerDashboard = React.lazy(() => import('./CareerDashboard'));
const EduCareerPortal = React.lazy(() => import('./EduCareerPortal'));

const TABS = [
    { id: 'edujob', label: 'EduJob', icon: <Briefcase size={16} /> },
    { id: 'lia', label: 'LIA & Praktik', icon: <Target size={16} /> },
];

const LoadingSpinner = () => (
    <div className="h-full flex flex-col items-center justify-center py-24 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3" />
        <span className="text-sm">Laddar...</span>
    </div>
);

const EduCareerPage = () => {
    const [activeTab, setActiveTab] = useState('edujob');

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0C10]">
            {/* Tab bar */}
            <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center gap-1 py-1">
                        <div className="flex items-center gap-1.5 mr-4 py-2">
                            <div className="p-1.5 bg-indigo-600 rounded-md text-white">
                                <Briefcase size={14} />
                            </div>
                            <span className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">EduCareer</span>
                        </div>
                        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mr-3" />
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {activeTab === tab.id && (
                                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab content */}
            <Suspense fallback={<LoadingSpinner />}>
                <div style={{ display: activeTab === 'edujob' ? 'block' : 'none' }}>
                    <CareerDashboard />
                </div>
                <div style={{ display: activeTab === 'lia' ? 'block' : 'none' }}>
                    <EduCareerPortal />
                </div>
            </Suspense>
        </div>
    );
};

export default EduCareerPage;
