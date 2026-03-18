
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisibleButtons = 5;

        if (totalPages <= maxVisibleButtons) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Always show first, last, and current range
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border-main)] sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                        Visar sida <span className="font-medium text-[var(--text-primary)]">{currentPage}</span> av <span className="font-medium text-[var(--text-primary)]">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-[var(--border-main)] bg-[var(--bg-card)] text-sm font-medium ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors'}`}
                        >
                            <span className="sr-only">Föregående</span>
                            <ChevronLeft size={16} />
                        </button>

                        {getPageNumbers().map((page, idx) => (
                            <button
                                key={idx}
                                onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                                disabled={typeof page !== 'number'}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all ${page === currentPage
                                    ? 'z-10 bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-secondary)] hover:bg-[var(--bg-input)]'
                                    } ${typeof page !== 'number' ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-[var(--border-main)] bg-[var(--bg-card)] text-sm font-medium ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-input)] transition-colors'}`}
                        >
                            <span className="sr-only">Nästa</span>
                            <ChevronRight size={16} />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
