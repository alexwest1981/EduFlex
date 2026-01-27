import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

const StudentCourseGrid = ({ courses, navigate }) => {
    return (
        <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="text-indigo-600" /> Mina Kurser
            </h3>

            {courses.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-[#1E1F20] rounded-xl border border-dashed border-gray-300 dark:border-[#3c4043]">
                    <BookOpen size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500">Du är inte registrerad på några kurser.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-6">
                    {courses.map(course => (
                        <div key={course.id} onClick={() => navigate(`/course/${course.slug || course.id}`)} className="bg-white dark:bg-[#1E1F20] p-5 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group flex flex-col justify-between h-full">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${course.isOpen ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300' : 'bg-red-50 text-red-600'}`}>
                                        {course.courseCode || 'Kurs'}
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                                </div>
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{course.name}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{course.description}</p>
                            </div>

                            <div className="space-y-3">
                                {/* Fake Progress för visuellt djup (kan kopplas till riktig data sen) */}
                                <div className="w-full bg-gray-100 dark:bg-[#3c4043] h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[15%]"></div>
                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-[#3c4043]">
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-[#3c4043] flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                        {course.teacher?.firstName?.charAt(0) || 'L'}
                                    </div>
                                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{course.teacher?.fullName || 'Okänd lärare'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentCourseGrid;
