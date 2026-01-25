import React from 'react';
import SubjectIcon from './SubjectIcon';

const SubjectSidebar = ({ subjects, selectedSubject, onSelectSubject }) => {
    // Calculate total count
    const totalCount = subjects.reduce((sum, s) => sum + (s.itemCount || 0), 0);

    return (
        <div className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200 dark:border-[#3c4043] p-4 sticky top-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-lg">Ämnen</span>
            </h3>

            <div className="space-y-1">
                {/* All Subjects */}
                <button
                    onClick={() => onSelectSubject('ALL')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                        selectedSubject === 'ALL'
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'hover:bg-gray-50 dark:hover:bg-[#282a2c] text-gray-700 dark:text-gray-300'
                    }`}
                >
                    <span className="font-medium">Alla ämnen</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                        selectedSubject === 'ALL'
                            ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200'
                            : 'bg-gray-100 dark:bg-[#3c4043] text-gray-500'
                    }`}>
                        {totalCount}
                    </span>
                </button>

                {/* Subject List */}
                {subjects.map((subject) => (
                    <button
                        key={subject.name}
                        onClick={() => onSelectSubject(subject.name)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                            selectedSubject === subject.name
                                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                : 'hover:bg-gray-50 dark:hover:bg-[#282a2c] text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            <SubjectIcon
                                iconName={subject.iconName}
                                color={subject.color}
                                size={16}
                            />
                            <span className="font-medium text-sm">{subject.displayName}</span>
                        </div>
                        {subject.itemCount > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                                selectedSubject === subject.name
                                    ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200'
                                    : 'bg-gray-100 dark:bg-[#3c4043] text-gray-500'
                            }`}>
                                {subject.itemCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SubjectSidebar;
