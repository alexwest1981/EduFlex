import React from 'react';
import { Hash, Zap, BookOpen, MessageCircle, Plus } from 'lucide-react';

const ForumSidebar = ({ categories, activeCategory, onSelectCategory, isTeacher, onCreateCategory }) => {
    return (
        <div className="w-64 border-r border-border h-[calc(100vh-6rem)] overflow-y-auto p-4 flex flex-col gap-6">

            {/* Categories */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Kategorier
                    </h3>
                    {isTeacher && (
                        <button onClick={onCreateCategory} className="text-muted-foreground hover:text-primary transition-colors" title="Skapa ny kategori">
                            <Plus size={14} />
                        </button>
                    )}
                </div>
                <div className="space-y-1">
                    <button
                        onClick={() => onSelectCategory(null)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${!activeCategory
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-accent text-foreground/80'
                            }`}
                    >
                        <Hash size={16} />
                        Alla trådar
                    </button>

                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat)}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${activeCategory?.id === cat.id
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'hover:bg-accent text-foreground/80'
                                }`}
                        >
                            {cat.teacherOnly ? <BookOpen size={16} className="text-amber-500" /> : <MessageCircle size={16} />}
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trending / Hot */}
            <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap size={12} className="text-yellow-500" /> Trendar just nu
                </h3>
                <div className="space-y-3">
                    <p className="text-xs text-muted-foreground italic">
                        Inga trendande trådar just nu.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForumSidebar;
