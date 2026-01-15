import React, { useMemo } from 'react';
import ReactQuill from 'react-quill-new'; // <--- ÄNDRAT HÄR
import 'react-quill-new/dist/quill.snow.css'; // <--- ÄNDRAT HÄR

const RichTextEditor = ({ value, onChange, placeholder, style }) => {
    // useMemo förhindrar oändliga loopar
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    }), []);

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list',
        'link'
    ];

    return (
        <div className="rich-text-editor-wrapper bg-white rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all" style={style}>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="h-full"
            />
            <style>{`
                .ql-container { 
                    min-height: 150px; 
                    font-family: inherit; 
                    font-size: 0.875rem; 
                }
                .ql-toolbar { 
                    background: #f9fafb; 
                    border-bottom: 1px solid #e5e7eb !important;
                    border-top: none !important;
                    border-left: none !important;
                    border-right: none !important;
                }
                .ql-container.ql-snow {
                    border: none !important;
                }
                .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #9ca3af;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;