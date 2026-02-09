import React from 'react';
import {
    HardDrive,
    Users,
    Trash2,
    Clock,
    Star,
    Plus,
    FolderPlus,
    ArrowLeft,
    GraduationCap,
    Award,
    BookOpen
} from 'lucide-react';

const FileSidebar = ({
    currentView,
    onViewChange,
    onNewFolder,
    onUpload,
    folderPath = [],
    storageUsage = null
}) => {
    const formatBytes = (bytes, decimals = 1) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const used = storageUsage?.used || 0;
    const quota = storageUsage?.quota || 1073741824;
    const percent = Math.min(100, Math.round((used / quota) * 100));
    const menuItems = [
        { id: 'my-drive', label: 'Min Drive', icon: HardDrive },
        { id: 'shared', label: 'Delat med mig', icon: Users },
        { id: 'grades', label: 'Betyg', icon: GraduationCap },
        { id: 'certificates', label: 'Intyg', icon: Award },
        { id: 'manuals', label: 'Dokumentbank', icon: BookOpen },
        { id: 'recent', label: 'Senaste', icon: Clock },
        { id: 'starred', label: 'Stjärnmärkta', icon: Star },
        { id: 'trash', label: 'Papperskorg', icon: Trash2 },
    ];


    return (
        <div className="w-64 flex-shrink-0 bg-white dark:bg-slate-900 p-4 h-full flex flex-col">
            <div className="mb-6 space-y-2">
                <button
                    onClick={onUpload}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 shadow-sm transition-all font-medium"
                >
                    <Plus size={20} />
                    <span>Ladda upp</span>
                </button>

                <button
                    onClick={onNewFolder}
                    className="w-full flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                    <FolderPlus size={18} />
                    <span>Ny mapp</span>
                </button>
            </div>

            <nav className="flex-1 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${currentView === item.id
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>Lagring</span>
                        <span>{percent}% använd</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                        {formatBytes(used)} av {formatBytes(quota)} används
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FileSidebar;
