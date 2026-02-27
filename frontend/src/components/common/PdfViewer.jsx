import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, List, ZoomIn, ZoomOut, Download } from 'lucide-react';

const PdfViewer = ({ ebookId, title }) => {
    const [metadata, setMetadata] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const init = async () => {
            await fetchMetadata();
            await fetchProgress();
        };
        init();
    }, [ebookId]);

    const fetchMetadata = async () => {
        try {
            const response = await fetch(`/api/ebooks/${ebookId}/metadata`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setMetadata(data);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch PDF metadata:', error);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await fetch(`/api/ebooks/${ebookId}/progress`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.page) {
                    setCurrentPage(data.page);
                }
            }
        } catch (error) {
            console.error('Failed to fetch progress:', error);
        }
    };

    const saveProgress = async (page) => {
        try {
            await fetch(`/api/ebooks/${ebookId}/progress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    page: page,
                    percentage: metadata ? (page / metadata.pageCount) * 100 : 0
                })
            });
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage > 0 && metadata && newPage <= metadata.pageCount) {
            setCurrentPage(newPage);
            saveProgress(newPage);
        }
    };

    if (isLoading) {
        return <div className="h-full flex items-center justify-center text-white">Laddar dokument...</div>;
    }

    return (
        <div className="flex h-full bg-[#1e1e1e] text-gray-200">
            {/* Sidebar for TOC */}
            {isSidebarOpen && (
                <div className="w-64 border-r border-gray-800 bg-[#252526] flex flex-col">
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                        <span className="font-bold text-xs uppercase tracking-widest text-gray-500">Innehåll</span>
                        <button onClick={() => setIsSidebarOpen(false)} className="hover:text-white"><List size={18} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {metadata.chapters.map((chapter, idx) => (
                            <button
                                key={idx}
                                onClick={() => handlePageChange(chapter.pageNumber)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${currentPage === chapter.pageNumber ? 'bg-indigo-600 text-white' : 'hover:bg-gray-800 text-gray-400'
                                    }`}
                            >
                                <div className="flex justify-between gap-2">
                                    <span className="truncate">{chapter.title}</span>
                                    <span className="text-[10px] opacity-50">s.{chapter.pageNumber}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Viewer */}
            <div className="flex-1 flex flex-col relative">
                {/* Toolbar */}
                <div className="h-12 bg-[#2d2d2d] flex items-center justify-between px-4 shadow-md z-10">
                    <div className="flex items-center gap-2">
                        {!isSidebarOpen && (
                            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded">
                                <List size={18} />
                            </button>
                        )}
                        <h4 className="text-sm font-medium truncate max-w-xs">{title}</h4>
                    </div>

                    <div className="flex items-center gap-4 bg-[#1e1e1e] px-3 py-1 rounded-lg">
                        <button
                            disabled={currentPage <= 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="p-1 hover:text-white disabled:opacity-20"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-1 text-sm font-bold min-w-[60px] justify-center">
                            <input
                                type="number"
                                value={currentPage}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (val > 0 && val <= metadata.pageCount) handlePageChange(val);
                                }}
                                className="w-10 bg-transparent text-center border-b border-gray-600 focus:border-indigo-500 outline-none"
                            />
                            <span className="text-gray-500">/ {metadata.pageCount}</span>
                        </div>
                        <button
                            disabled={currentPage >= metadata.pageCount}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="p-1 hover:text-white disabled:opacity-20"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded" title="Zooma ut"><ZoomOut size={18} /></button>
                        <button className="p-2 hover:bg-white/10 rounded" title="Zooma in"><ZoomIn size={18} /></button>
                    </div>
                </div>

                {/* Page Canvas */}
                <div className="flex-1 overflow-auto p-8 flex justify-center bg-[#1e1e1e] scrollbar-thin scrollbar-thumb-gray-800">
                    <img
                        key={`${ebookId}-${currentPage}`}
                        src={`/api/ebooks/${ebookId}/page/${currentPage}`}
                        alt={`Page ${currentPage}`}
                        className="max-w-full h-auto shadow-2xl rounded-sm transition-opacity duration-300 animate-in fade-in"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/800x1100?text=Kunde+inte+ladda+sidan';
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PdfViewer;
