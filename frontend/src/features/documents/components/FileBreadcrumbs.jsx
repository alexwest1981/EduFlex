import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const FileBreadcrumbs = ({ path = [], onNavigate }) => {
    return (
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <button
                onClick={() => onNavigate(null)}
                className="hover:text-blue-600 flex items-center gap-1.5 transition-colors"
            >
                <Home size={16} />
                <span className="font-medium">Min Drive</span>
            </button>

            {path.map((folder, index) => (
                <React.Fragment key={folder.id}>
                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                    <button
                        onClick={() => onNavigate(folder)}
                        className={`hover:text-blue-600 transition-colors ${index === path.length - 1 ? 'font-bold text-slate-900 dark:text-white' : 'font-medium'
                            }`}
                    >
                        {folder.name}
                    </button>
                </React.Fragment>
            ))}
        </nav>
    );
};

export default FileBreadcrumbs;
