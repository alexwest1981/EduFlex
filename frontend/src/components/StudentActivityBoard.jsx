import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Loader2, Search, Filter, Eye, Download, Video, Calendar, User as UserIcon } from 'lucide-react';

const StudentActivityBoard = ({ courseId }) => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    useEffect(() => {
        loadLogs();
    }, [courseId]);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const data = await api.activity.getCourseLogs(courseId);
            setLogs(data);
        } catch (error) {
            console.error("Failed to load activity logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'VIEW_LESSON': return <Eye size={16} className="text-blue-500" />;
            case 'DOWNLOAD_FILE': return <Download size={16} className="text-green-500" />;
            case 'WATCH_VIDEO': return <Video size={16} className="text-red-500" />;
            default: return <Calendar size={16} className="text-gray-500" />;
        }
    };

    const formatType = (type) => {
        switch (type) {
            case 'VIEW_LESSON': return 'Öppnat lektion';
            case 'DOWNLOAD_FILE': return 'Laddat ner fil';
            case 'WATCH_VIDEO': return 'Tittat på video';
            case 'COURSE_ACCESS': return 'Gått in i kursen';
            default: return type;
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.materialTitle && log.materialTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesType = filterType === 'ALL' || log.activityType === filterType;

        return matchesSearch && matchesType;
    });

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1E1F20] p-4 rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Calendar className="text-indigo-600" size={20} />
                        Aktivitetslogg
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Se vad dina elever gör i kursen i realtid.</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-[#131314] dark:border-[#3c4043] dark:text-white"
                            placeholder="Sök student eller material..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="border dark:border-[#3c4043] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#131314] text-gray-900 dark:text-white"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="ALL">Alla Aktivitetstyper</option>
                        <option value="VIEW_LESSON">Öppnat Lektion</option>
                        <option value="DOWNLOAD_FILE">Laddat ner Fil</option>
                        <option value="WATCH_VIDEO">Tittat på Video</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1E1F20] rounded-xl border border-gray-200 dark:border-[#3c4043] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-[#131314] text-gray-500 dark:text-gray-400 border-b dark:border-[#3c4043]">
                            <tr>
                                <th className="p-4">Tidpunkt</th>
                                <th className="p-4">Student</th>
                                <th className="p-4">Händelse</th>
                                <th className="p-4">Material / Detaljer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-[#3c4043]">
                            {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-[#282a2c] transition-colors">
                                    <td className="p-4 font-mono text-gray-500 dark:text-gray-400 text-xs">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                                                {log.userName.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{log.userName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {getIcon(log.activityType)}
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{formatType(log.activityType)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-400">
                                        {log.materialTitle ? (
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{log.materialTitle}</span>
                                        ) : (
                                            <span className="italic text-gray-400">{log.details || '-'}</span>
                                        )}
                                        {log.details && log.materialTitle && <span className="text-xs text-gray-400 ml-2">({log.details})</span>}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 italic">Inga aktiviteter hittades.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentActivityBoard;
