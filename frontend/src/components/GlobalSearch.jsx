import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, BookOpen, FileText, Calendar, X, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const GlobalSearch = ({ className = "", inputClassName = "bg-gray-100 dark:bg-[#282a2c]" }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ users: [], courses: [], documents: [], events: [] });
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsLoading(true);
                try {
                    const response = await api.search.global(query);
                    setResults(response || { users: [], courses: [], documents: [], events: [] });
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search failed:", error);
                    setResults({ users: [], courses: [], documents: [], events: [] });
                } finally {
                    setIsLoading(false);
                }
            } else {
                setResults({ users: [], courses: [], documents: [], events: [] });
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !inputRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const allResults = [
        ...results.users.map(u => ({ ...u, type: 'user' })),
        ...results.courses.map(c => ({ ...c, type: 'course' })),
        ...results.documents.map(d => ({ ...d, type: 'document' })),
        ...results.events.map(e => ({ ...e, type: 'event' }))
    ];

    const hasResults = allResults.length > 0;

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev < allResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < allResults.length) {
                handleSelect(allResults[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleSelect = (item) => {
        if (item.type === 'user') navigate(`/profile/${item.id}`);
        else if (item.type === 'course') navigate(`/courses/${item.id}`);
        else if (item.type === 'document') window.open(item.url, '_blank');
        else if (item.type === 'event') navigate(`/calendar?event=${item.id}`);

        setIsOpen(false);
        setQuery('');
    };

    const getIcon = (type) => {
        switch (type) {
            case 'user': return <User size={16} className="text-blue-500" />;
            case 'course': return <BookOpen size={16} className="text-orange-500" />;
            case 'document': return <FileText size={16} className="text-green-500" />;
            case 'event': return <Calendar size={16} className="text-purple-500" />;
            default: return <Search size={16} />;
        }
    };

    const getLabel = (type) => {
        switch (type) {
            case 'user': return 'Användare';
            case 'course': return 'Kurs';
            case 'document': return 'Dokument';
            case 'event': return 'Händelse';
            default: return 'Resultat';
        }
    };

    const getName = (item) => {
        if (item.type === 'user') return `${item.firstName} ${item.lastName}`;
        return item.title || item.name;
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && hasResults && setIsOpen(true)}
                    placeholder="Sök..."
                    className={`w-full border-none rounded-2xl pl-5 pr-14 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-opacity-20 transition-all ${inputClassName}`}
                />
                <Search size={18} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${inputClassName.includes('text-white') || inputClassName.includes('text-black') ? 'opacity-50 inherit' : 'text-gray-400'}`} />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setIsOpen(false); }}
                        className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X size={16} />
                    </button>
                )}
                {isLoading && (
                    <Loader2 size={16} className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1F20] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 max-h-96 overflow-y-auto"
                >
                    {!hasResults && !isLoading && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            Inga resultat för "{query}"
                        </div>
                    )}

                    {hasResults && (
                        <div className="py-2">
                            {allResults.map((item, index) => (
                                <button
                                    key={`${item.type}-${item.id}`}
                                    onClick={() => handleSelect(item)}
                                    className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${index === activeIndex
                                        ? 'bg-gray-100 dark:bg-[#282a2c]'
                                        : 'hover:bg-gray-50 dark:hover:bg-[#282a2c]'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#282a2c] flex items-center justify-center">
                                        {getIcon(item.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {getName(item)}
                                        </p>
                                        <p className="text-xs text-gray-500">{getLabel(item.type)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {hasResults && (
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-400">
                                Tryck ↑↓ för att navigera, Enter för att välja, Esc för att stänga
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;
