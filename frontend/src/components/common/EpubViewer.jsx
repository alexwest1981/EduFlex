import React, { useState } from 'react';
import { ReactReader } from 'react-reader';

const EpubViewer = ({ ebookId, url, title }) => {
    const [size, setSize] = useState(100);
    const [lastLocation, setLastLocation] = useState(null);

    React.useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await fetch(`/api/ebooks/${ebookId}/progress`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.lastLocation) {
                        setLastLocation(data.lastLocation);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch progress:', error);
            }
        };
        fetchProgress();
    }, [ebookId]);

    const handleLocationChange = (newLocation) => {
        setLastLocation(newLocation);
        saveProgress(newLocation);
    };

    const saveProgress = async (locationCfi) => {
        try {
            await fetch(`/api/ebooks/${ebookId}/progress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lastLocation: locationCfi
                })
            });
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    };

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
                    location={lastLocation}
                    locationChanged={handleLocationChange}
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
