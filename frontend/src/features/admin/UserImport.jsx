import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, X, Download } from 'lucide-react';
import { api } from '../../services/api';

const UserImport = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'text/csv') {
            setFile(selected);
            setError(null);
        } else {
            setFile(null);
            setError("Endast .csv-filer stöds.");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.admin.importUsers(formData);
            setResult(response);
            if (response.successCount > 0) {
                onSuccess();
            }
        } catch (err) {
            console.error(err);
            setError("Uppladdningen misslyckades. Kontrollera filen och försök igen.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type === 'text/csv') {
            setFile(dropped);
            setError(null);
        } else {
            setError("Endast .csv-filer stöds.");
        }
    };

    return (
        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-4 mb-6">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-bold text-indigo-900 dark:text-indigo-200">Massimportera Användare</h3>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">Ladda upp en CSV-fil för att skapa flera användare samtidigt.</p>
                </div>
                <button onClick={onClose} className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-200"><X size={20} /></button>
            </div>

            {!result ? (
                <div className="space-y-4">
                    <div
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${file ? 'border-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/20' : 'border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100/30 dark:hover:bg-indigo-900/20'}`}
                    >
                        <input type="file" id="csvInput" accept=".csv" className="hidden" onChange={handleFileChange} />
                        <label htmlFor="csvInput" className="cursor-pointer block">
                            {file ? (
                                <div>
                                    <FileText size={48} className="mx-auto text-indigo-600 mb-2" />
                                    <p className="font-bold text-indigo-900 dark:text-indigo-200">{file.name}</p>
                                    <p className="text-sm text-indigo-600">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={48} className="mx-auto text-indigo-300 mb-2" />
                                    <p className="font-bold text-indigo-900 dark:text-indigo-200">Klicka eller dra CSV-fil hit</p>
                                    <p className="text-sm text-indigo-500">Format: username, email, firstname, lastname, role</p>
                                </div>
                            )}
                        </label>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm font-medium">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button type="button" className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
                            <Download size={14} /> Ladda ner mall
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={!file || isUploading}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isUploading ? 'Importerar...' : 'Starta Import'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white dark:bg-[#1E1F20] p-4 rounded-xl border border-gray-200 dark:border-[#3c4043]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <Check size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Import Slutförd</h4>
                                <p className="text-sm text-gray-500">{result.successCount} användare skapades.</p>
                            </div>
                        </div>

                        {result.errors && result.errors.length > 0 && (
                            <div className="mt-4">
                                <h5 className="text-sm font-bold text-red-600 mb-2">Fel ({result.errors.length})</h5>
                                <div className="max-h-40 overflow-y-auto bg-red-50 dark:bg-red-900/10 p-3 rounded-lg text-xs font-mono text-red-800 dark:text-red-300 space-y-1">
                                    {result.errors.map((err, i) => (
                                        <div key={i}>{err}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button onClick={() => { setFile(null); setResult(null); onClose(); }} className="w-full bg-gray-200 dark:bg-[#3c4043] text-gray-800 dark:text-white py-2 rounded-lg font-bold hover:bg-gray-300">
                        Stäng
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserImport;
