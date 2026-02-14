import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const MarkdownRenderer = ({ content, isDocument = false }) => {
    if (!content) return null;

    // Defines base text colors based on mode
    const textColor = isDocument ? "text-slate-900" : "text-gray-900 dark:text-white";
    const subTextColor = isDocument ? "text-slate-700" : "text-gray-600 dark:text-gray-300";
    const borderColor = isDocument ? "border-slate-200" : "border-gray-100 dark:border-gray-800";
    const bgCode = isDocument ? "bg-slate-100 text-slate-800" : "bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400";
    const blockQuoteColor = isDocument ? "border-slate-400 bg-slate-50 text-slate-700" : "border-indigo-500 bg-gray-50 dark:bg-gray-800/50";

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
                h1: ({ node, ...props }) => <h1 className={`text-3xl mb-4 font-black tracking-tight ${textColor}`} {...props} />,
                h2: ({ node, ...props }) => <h2 className={`text-2xl mt-8 mb-4 border-b pb-2 font-bold tracking-tight ${borderColor} ${textColor}`} {...props} />,
                h3: ({ node, ...props }) => <h3 className={`text-xl mt-6 mb-3 font-bold ${textColor}`} {...props} />,
                ul: ({ node, ...props }) => <ul className={`list-disc pl-5 my-4 space-y-1 ${subTextColor}`} {...props} />,
                ol: ({ node, ...props }) => <ol className={`list-decimal pl-5 my-4 space-y-1 ${subTextColor}`} {...props} />,
                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                p: ({ node, ...props }) => <p className={`my-4 leading-relaxed ${subTextColor}`} {...props} />,
                strong: ({ node, ...props }) => <strong className={`font-bold ${textColor}`} {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className={`border-l-4 pl-4 py-1 my-4 rounded-r-lg italic ${blockQuoteColor}`} {...props} />,
                code: ({ node, inline, className, children, ...props }) => {
                    return inline ? (
                        <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${bgCode}`} {...props}>
                            {children}
                        </code>
                    ) : (
                        <div className="overflow-x-auto my-4 rounded-lg">
                            <code className="block bg-slate-900 text-slate-100 p-4 text-sm font-mono" {...props}>
                                {children}
                            </code>
                        </div>
                    );
                },
                table: ({ node, ...props }) => <div className={`overflow-x-auto my-6 border rounded-lg ${borderColor}`}><table className="w-full text-sm text-left" {...props} /></div>,
                thead: ({ node, ...props }) => <thead className={isDocument ? "bg-slate-50" : "bg-gray-50 dark:bg-gray-800"} {...props} />,
                th: ({ node, ...props }) => <th className={`px-6 py-3 font-bold border-b ${borderColor} ${textColor}`} {...props} />,
                td: ({ node, ...props }) => <td className={`px-6 py-4 border-b last:border-0 ${borderColor}`} {...props} />,
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownRenderer;
