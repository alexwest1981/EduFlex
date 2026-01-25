import React from 'react';
import { Star, Download, FileQuestion, ClipboardList, BookOpen } from 'lucide-react';
import SubjectIcon from './SubjectIcon';

const typeConfig = {
    QUIZ: {
        label: 'Quiz',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        icon: FileQuestion
    },
    ASSIGNMENT: {
        label: 'Uppgift',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        icon: ClipboardList
    },
    LESSON: {
        label: 'Lektion',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        icon: BookOpen
    }
};

const CommunityCard = ({ item, onClick }) => {
    const type = typeConfig[item.contentType] || typeConfig.QUIZ;
    const TypeIcon = type.icon;

    return (
        <div
            onClick={onClick}
            className="bg-white dark:bg-[#1E1F20] rounded-2xl border border-gray-200
                     dark:border-[#3c4043] overflow-hidden hover:shadow-xl
                     transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        >
            {/* Subject Header */}
            <div
                className="h-12 p-3 flex items-center gap-2"
                style={{ backgroundColor: item.subjectColor || '#6366F1' }}
            >
                <SubjectIcon iconName={item.subjectIcon} color="white" size={20} />
                <span className="text-white font-semibold text-sm truncate">
                    {item.subjectDisplayName || item.subject || 'Övrigt'}
                </span>
            </div>

            <div className="p-4">
                {/* Type Badge */}
                <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${type.color}`}>
                        <TypeIcon size={12} />
                        {type.label}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    {item.description}
                </p>

                {/* Author */}
                <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-[#3c4043] rounded-full flex items-center justify-center overflow-hidden">
                        {item.authorProfilePictureUrl ? (
                            <img src={item.authorProfilePictureUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] font-bold text-gray-500">
                                {item.authorName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        )}
                    </div>
                    <span className="truncate">{item.authorName}</span>
                    {item.authorTenantName && (
                        <>
                            <span>•</span>
                            <span className="truncate">{item.authorTenantName}</span>
                        </>
                    )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#3c4043]">
                    <div className="flex items-center gap-1">
                        <Star className="text-yellow-400 fill-yellow-400" size={14} />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {(item.averageRating || 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                            ({item.ratingCount || 0})
                        </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-400">
                        <Download size={14} />
                        <span className="text-xs">{item.downloadCount || 0}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityCard;
