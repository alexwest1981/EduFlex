import React, { useState } from 'react';
import { ReactReader } from 'react-reader';

const EpubViewer = ({ url, title, location, onLocationChange }) => {
    const [size, setSize] = useState(100);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">{title}</h3>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                    <span>Textstorlek: {size}%</span>
                    <div className="flex gap-1">
                        <button onClick={() => setSize(s => Math.max(80, s - 10))} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">-</button>
                        <button onClick={() => setSize(s => Math.min(200, s + 10))} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">+</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 relative">
                <ReactReader
                    url={url}
                    title={title}
                    location={location}
                    locationChanged={onLocationChange}
                    getRendition={(rendition) => {
                        rendition.themes.fontSize(`${size}%`);
                    }}
                    swipeable={true}
                    epubOptions={{
                        flow: 'paginated', // or scrolled
                        manager: 'default',
                        allowScriptedContent: true,
                        allowPopups: true,
                        requestHeaders: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }}
                    loadingView={<div className="h-full flex items-center justify-center">Laddar e-bok...</div>}
                />
            </div>
        </div>
    );
};

export default EpubViewer;
