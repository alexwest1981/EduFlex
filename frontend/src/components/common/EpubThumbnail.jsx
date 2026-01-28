import React, { useState, useEffect } from 'react';
import ePub from 'epubjs';
import { Book } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EpubThumbnail = ({ epubUrl, title }) => {
    const [cover, setCover] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        let book = null;
        let isMounted = true;

        const loadCover = async () => {
            if (!epubUrl) {
                setLoading(false);
                return;
            }

            try {
                // If the URL is protected, we might need to fetch it as a blob first
                // Check if it's a relative URL (which gets proxied) or absolute
                // Ideally, we fetch with auth headers if needed, but let's try direct load first
                // as epub.js might not support custom headers easily without a custom requester
                // However, since we are using relative URLs '/api/ebooks/...' the existing session cookie should theoretically work
                // if the browser handles cookies for XHR. But we use Bearer tokens.

                // Workaround for Bearer token: Fetch as blob using our api client or simple fetch
                const response = await fetch(epubUrl, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });

                if (!response.ok) throw new Error('Failed to fetch epub');

                const blob = await response.blob();
                if (!isMounted) return;

                // Load book from blob/arraybuffer
                book = ePub(blob);

                await book.ready;
                const coverUrl = await book.coverUrl();

                if (isMounted) {
                    if (coverUrl) {
                        setCover(coverUrl);
                    } else {
                        // Try to find image with id 'cover' manually if coverUrl() fails
                        // logical... 
                        setError(true);
                    }
                }
            } catch (err) {
                console.error("Failed to extract cover from EPUB:", err);
                if (isMounted) setError(true);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadCover();

        return () => {
            isMounted = false;
            if (book) {
                book.destroy();
            }
        };
    }, [epubUrl]);

    if (loading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse text-gray-400">
                <Book size={32} />
                <span className="text-[10px] mt-2 font-medium">Laddar...</span>
            </div>
        );
    }

    if (error || !cover) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                <Book size={48} strokeWidth={1} />
                <span className="text-xs mt-2 uppercase tracking-widest font-bold text-center px-2">
                    {title || t('library.no_cover')}
                </span>
            </div>
        );
    }

    return (
        <img
            src={cover}
            alt={`Cover for ${title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setError(true)}
        />
    );
};

export default EpubThumbnail;
