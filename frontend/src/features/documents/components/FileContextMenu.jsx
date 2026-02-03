import React, { useEffect, useRef } from 'react';
import {
    Share2,
    Download,
    Trash2,
    Edit,
    Link as LinkIcon,
    Info,
    ExternalLink,
    FolderOpen
} from 'lucide-react';

const FileContextMenu = ({ x, y, item, onClose, onAction }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const actions = item.type === 'folder'
        ? [
            { id: 'open', label: 'Öppna', icon: FolderOpen },
            { id: 'rename', label: 'Byt namn', icon: Edit },
            { id: 'share', label: 'Dela mapp', icon: Share2 },
            { id: 'delete', label: 'Radera', icon: Trash2, danger: true },
        ]
        : [
            { id: 'open', label: 'Öppna', icon: ExternalLink },
            { id: 'download', label: 'Ladda ner', icon: Download },
            { id: 'share', label: 'Dela', icon: Share2 },
            { id: 'link', label: 'Kopiera länk', icon: LinkIcon },
            { id: 'edit', label: 'Redigera', icon: Edit },
            { id: 'info', label: 'Detaljer', icon: Info },
            { id: 'delete', label: 'Radera', icon: Trash2, danger: true },
        ];

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in duration-100"
            style={{ left: x, top: y }}
        >
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                    {item.name || item.fileName}
                </p>
            </div>

            {actions.map((action) => (
                <button
                    key={action.id}
                    onClick={(e) => {
                        e.stopPropagation();
                        onAction(action.id, item);
                        onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${action.danger
                            ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    <action.icon size={18} />
                    <span>{action.label}</span>
                </button>
            ))}
        </div>
    );
};

export default FileContextMenu;
