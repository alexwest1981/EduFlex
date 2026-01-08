import React from 'react';
import { BookOpen, Users, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';

const TeacherStats = ({ myCourses, allStudents, applications, ungradedSubmissions, setActiveTab }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Aktiva Kurser */}
            <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                <div className="flex justify-between items-start">
                    <div><p className="text-gray-500 text-xs font-bold uppercase">Aktiva Kurser</p><h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{myCourses.length}</h3></div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600"><BookOpen size={24}/></div>
                </div>
            </div>

            {/* Studenter */}
            <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                <div className="flex justify-between items-start">
                    <div><p className="text-gray-500 text-xs font-bold uppercase">Mina Studenter</p><h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{allStudents.length}</h3></div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><Users size={24}/></div>
                </div>
            </div>

            {/* Att Rätta (Klickbar) */}
            <div onClick={() => setActiveTab('GRADING')} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm cursor-pointer hover:border-orange-300 transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase">Att Rätta</p>
                        <h3 className={`text-3xl font-black mt-1 ${ungradedSubmissions.length > 0 ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>{ungradedSubmissions.length}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600"><CheckCircle size={24}/></div>
                </div>
            </div>

            {/* Ansökningar / Risk (Växlar beroende på om det finns ansökningar) */}
            {applications.length > 0 ? (
                <div onClick={() => setActiveTab('APPLICATIONS')} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm cursor-pointer hover:border-purple-300 transition-colors">
                    <div className="flex justify-between items-start">
                        <div><p className="text-gray-500 text-xs font-bold uppercase">Ansökningar</p><h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{applications.length}</h3></div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600"><UserPlus size={24}/></div>
                    </div>
                </div>
            ) : (
                <div onClick={() => setActiveTab('STUDENTS')} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm cursor-pointer hover:border-red-300 transition-colors">
                    <div className="flex justify-between items-start">
                        <div><p className="text-gray-500 text-xs font-bold uppercase">Riskzon</p><h3 className="text-3xl font-black text-red-600 mt-1">{allStudents.filter(s => s.riskLevel === 'HIGH').length}</h3></div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600"><AlertTriangle size={24}/></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherStats;