import React, { useState } from 'react';
import { File, Download, Trash2 } from 'lucide-react';

const DocumentManager = ({ documents, handleDocSubmit, handleDeleteDoc, currentUser, token, API_BASE, fetchDocuments, showMessage, setError }) => {
    // Lokalt state för formuläret
    const [docTitle, setDocTitle] = useState('');
    const [docType, setDocType] = useState('CV');
    const [docDesc, setDocDesc] = useState('');
    const [docFile, setDocFile] = useState(null);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!docFile) return setError("Välj en fil!");

        const formData = new FormData();
        formData.append("file", docFile);
        formData.append("title", docTitle);
        formData.append("type", docType);
        formData.append("description", docDesc);

        try {
            const res = await fetch(`${API_BASE}/documents/user/${currentUser.id}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                showMessage('Uppladdat!');
                setDocTitle('');
                setDocDesc('');
                setDocFile(null);
                document.getElementById('docFileInput').value = ""; // Återställ input
                fetchDocuments(currentUser.id);
            }
        } catch (err) {
            setError('Kunde inte ladda upp.');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
            <div className="bg-white p-6 rounded-xl border h-fit shadow-sm">
                <h3 className="font-bold mb-4">Ladda upp dokument</h3>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input
                        className="w-full px-4 py-2 border rounded-lg"
                        value={docTitle}
                        onChange={e => setDocTitle(e.target.value)}
                        placeholder="Titel"
                        required
                    />
                    <select
                        className="w-full px-4 py-2 border rounded-lg bg-white"
                        value={docType}
                        onChange={e => setDocType(e.target.value)}
                    >
                        <option value="CV">CV</option>
                        <option value="BETYG">Betyg</option>
                        <option value="INTYG">Intyg</option>
                    </select>
                    <textarea
                        className="w-full px-4 py-2 border rounded-lg"
                        placeholder="Beskrivning (valfritt)"
                        rows="3"
                        value={docDesc}
                        onChange={e => setDocDesc(e.target.value)}
                    />
                    <input
                        id="docFileInput"
                        type="file"
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        onChange={e => setDocFile(e.target.files[0])}
                    />
                    <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Spara</button>
                </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-gray-700 mb-4">Mina Filer ({documents.length})</h3>
                {documents.length === 0 && <p className="text-gray-500 italic">Inga dokument uppladdade.</p>}
                {documents.map(doc => (
                    <div key={doc.id} className="bg-white p-4 rounded-xl border flex justify-between items-center hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-50 rounded-lg text-green-600"><File size={20}/></div>
                            <div>
                                <div className="font-bold text-gray-800">{doc.title}</div>
                                <div className="text-xs text-gray-500 flex gap-2">
                                    <span className="bg-gray-100 px-2 rounded">{doc.type}</span>
                                    <span>{doc.uploadDate}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {doc.fileUrl && (
                                <a href={`http://127.0.0.1:8080${doc.fileUrl}`} target="_blank" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
                                    <Download size={18}/>
                                </a>
                            )}
                            <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DocumentManager;