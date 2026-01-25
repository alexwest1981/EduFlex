import React from 'react';
import { PackageOpen } from 'lucide-react';
import CommunityCard from './CommunityCard';

const ContentGrid = ({ items, onSelectItem }) => {
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-gray-100 dark:bg-[#282a2c] rounded-full flex items-center justify-center mb-4">
                    <PackageOpen className="text-gray-400" size={40} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Inget innehåll hittades
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Prova att ändra dina filter eller sök efter något annat.
                    Var först med att dela material i denna kategori!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item) => (
                <CommunityCard
                    key={item.id}
                    item={item}
                    onClick={() => onSelectItem(item)}
                />
            ))}
        </div>
    );
};

export default ContentGrid;
