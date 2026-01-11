import React from 'react';
import { BookOpen, Users, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';

export const ActiveCoursesCard = ({ count }) => (
    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex-1 min-w-[200px]">
        <div className="flex justify-between items-start">
            <div><p className="text-gray-500 text-xs font-bold uppercase">Aktiva Kurser</p><h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{count}</h3></div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600"><BookOpen size={24} /></div>
        </div>
    </div>
);

export const MyStudentsCard = ({ count }) => (
    <div className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm flex-1 min-w-[200px]">
        <div className="flex justify-between items-start">
            <div><p className="text-gray-500 text-xs font-bold uppercase">Mina Studenter</p><h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{count}</h3></div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600"><Users size={24} /></div>
        </div>
    </div>
);

export const GradingCard = ({ count, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm cursor-pointer hover:border-orange-300 transition-colors flex-1 min-w-[200px]">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-xs font-bold uppercase">Att Rätta</p>
                <h3 className={`text-3xl font-black mt-1 ${count > 0 ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>{count}</h3>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600"><CheckCircle size={24} /></div>
        </div>
    </div>
);

export const ApplicationsCard = ({ count, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm cursor-pointer hover:border-purple-300 transition-colors flex-1 min-w-[200px]">
        <div className="flex justify-between items-start">
            <div><p className="text-gray-500 text-xs font-bold uppercase">Ansökningar</p><h3 className="text-3xl font-black text-gray-900 dark:text-white mt-1">{count}</h3></div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600"><UserPlus size={24} /></div>
        </div>
    </div>
);

export const RiskCard = ({ count, onClick }) => (
    <div onClick={onClick} className="bg-white dark:bg-[#1E1F20] p-6 rounded-2xl border border-gray-200 dark:border-[#3c4043] shadow-sm cursor-pointer hover:border-red-300 transition-colors flex-1 min-w-[200px]">
        <div className="flex justify-between items-start">
            <div><p className="text-gray-500 text-xs font-bold uppercase">Riskzon</p><h3 className="text-3xl font-black text-red-600 mt-1">{count}</h3></div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600"><AlertTriangle size={24} /></div>
        </div>
    </div>
);
