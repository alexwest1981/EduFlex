import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, AlertTriangle, Info, Terminal } from 'lucide-react';
import { api } from '../../services/api';

const LogDashboard = () => {
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [lines, setLines] = useState(100);
    const [logContent, setLogContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchFiles();
    }, []);

    useEffect(() => {
        if (selectedFile) {
            fetchLogContent();
        }
    }, [selectedFile, lines]);

    const fetchFiles = async () => {
        try {
            const fileList = await api.logs.getFiles();
            setFiles(fileList);
            if (fileList.length > 0 && !selectedFile) {
                setSelectedFile(fileList[0]);
            }
        } catch (error) {
            console.error("Failed to fetch log files", error);
        }
    };

    const fetchLogContent = async () => {
        if (!selectedFile) return;
        setLoading(true);
        try {
            const content = await api.logs.getContent(selectedFile, lines);
            setLogContent(content);
        } catch (error) {
            setLogContent(["Error loading logs: " + error.message]);
        } finally {
            setLoading(false);
        }
    };

    const getLogColor = (line) => {
        if (line.includes('ERROR')) return 'text-red-500';
        if (line.includes('WARN')) return 'text-yellow-500';
        if (line.includes('INFO')) return 'text-blue-500 dark:text-blue-400';
        if (line.includes('DEBUG')) return 'text-gray-500';
        return 'text-gray-800 dark:text-gray-300';
    };

    const filteredContent = logContent.filter(line =>
        line.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-[#1e2022] rounded-lg border border-gray-200 dark:border-[#3c4043]">
                <div className="flex gap-4 items-center w-full sm:w-auto">
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <select
                            value={selectedFile}
                            onChange={(e) => setSelectedFile(e.target.value)}
                            className="pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-[#282a2c] dark:border-gray-700"
                        >
                            {files.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    <select
                        value={lines}
                        onChange={(e) => setLines(Number(e.target.value))}
                        className="py-2 px-3 border rounded-lg bg-gray-50 dark:bg-[#282a2c] dark:border-gray-700"
                    >
                        <option value={100}>100 rader</option>
                        <option value={500}>500 rader</option>
                        <option value={1000}>1000 rader</option>
                    </select>

                    <button
                        onClick={fetchLogContent}
                        className={`p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 ${loading ? 'animate-spin' : ''}`}
                        title="Uppdatera"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Sök i loggar..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 border rounded-lg bg-gray-50 dark:bg-[#282a2c] dark:border-gray-700"
                />
            </div>

            <div className="bg-[#1e1e1e] text-gray-300 p-4 rounded-lg font-mono text-xs sm:text-sm overflow-auto h-[600px] border border-gray-800 shadow-inner">
                {filteredContent.length === 0 ? (
                    <div className="text-gray-500 italic text-center mt-20">Inga loggar att visa...</div>
                ) : (
                    filteredContent.map((line, i) => (
                        <div key={i} className={`whitespace-pre-wrap border-b border-gray-800/50 py-0.5 hover:bg-white/5 ${getLogColor(line)}`}>
                            {line}
                        </div>
                    ))
                )}
            </div>
            <div className="text-xs text-gray-500 text-right">
                Visar {filteredContent.length} av {logContent.length} rader
            </div>
        </div>
    );
};

export default LogDashboard;
