import React, { useState } from 'react';
import { Search, BookOpen, User, Calendar, PlusCircle, Lock, AlertCircle } from 'lucide-react';

const CourseCatalog = ({ availableCourses, handleEnroll }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCourses = availableCourses.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-in fade-in space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Kurskatalog</h1>
                    <p className="text-gray-500">Hitta och anmäl dig till nya kurser.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                    <input
                        type="text"
                        placeholder="Sök kurser..."
                        className="pl-10 pr-4 py-2 border rounded-xl w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-gray-500 italic">Inga kurser hittades.</div>
                ) : (
                    filteredCourses.map(course => (
                        <div key={course.id} className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-all flex flex-col justify-between group ${!course.isOpen ? 'opacity-80' : ''}`}>
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.isOpen ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                                        {course.courseCode}
                                    </span>
                                    {!course.isOpen && <Lock size={20} className="text-red-400"/>}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{course.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <User size={16}/> <span>{course.teacher?.fullName || 'Ingen lärare'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Calendar size={16}/> <span>Start: {course.startDate ? new Date(course.startDate).toLocaleDateString() : 'Ej satt'}</span>
                                    </div>
                                </div>
                            </div>

                            {course.isOpen ? (
                                <button
                                    onClick={() => handleEnroll(course.id)}
                                    className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <PlusCircle size={20}/> Gå med i kurs
                                </button>
                            ) : (
                                <div className="w-full bg-gray-100 text-gray-500 py-2.5 rounded-lg font-bold border border-gray-200 flex items-center justify-center gap-2 cursor-not-allowed">
                                    <AlertCircle size={18}/> Kursen ej öppen för ansökan än
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseCatalog;