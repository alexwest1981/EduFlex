import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { api } from '../services/api';

const SkolverketCourseSelector = ({ onSelect, onClose }) => {
    const [courses, setCourses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSubjects();
        loadCourses();
    }, []);

    const loadSubjects = async () => {
        try {
            const data = await api.get('/skolverket/subjects');
            setSubjects(data);
        } catch (error) {
            console.error('Failed to load subjects', error);
        }
    };

    const loadCourses = async () => {
        setLoading(true);
        try {
            const data = await api.get('/skolverket/courses');
            setCourses(data);
        } catch (error) {
            console.error('Failed to load courses', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm && !selectedSubject) {
            loadCourses();
            return;
        }

        setLoading(true);
        try {
            let data;
            if (selectedSubject) {
                data = await api.get(`/skolverket/courses/subject/${selectedSubject}`);
            } else if (searchTerm) {
                data = await api.get(`/skolverket/courses/search?q=${searchTerm}`);
            }
            setCourses(data);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedSubject]);

    const handleSelectCourse = (course) => {
        onSelect(course);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#1E1F20] w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-[#3c4043] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-[#3c4043] flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Välj Skolverkskurs</h3>
                    <button onClick={onClose}><X className="text-gray-500" size={20} /></button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Sök kurskod eller kursnamn..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg dark:bg-[#131314] dark:text-white"
                            />
                        </div>
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="px-4 py-2 border border-gray-300 dark:border-[#3c4043] rounded-lg dark:bg-[#131314] dark:text-white"
                        >
                            <option value="">Alla ämnen</option>
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Laddar kurser...</div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Inga kurser hittades</div>
                        ) : (
                            courses.map(course => (
                                <button
                                    key={course.id}
                                    onClick={() => handleSelectCourse(course)}
                                    className="w-full p-4 text-left border border-gray-200 dark:border-[#3c4043] rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                    {course.courseCode}
                                                </span>
                                                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    {course.points}p
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">{course.courseName}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{course.subject}</p>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SkolverketCourseSelector;
