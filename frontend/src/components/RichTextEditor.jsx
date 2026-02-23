import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';

// ---------------------------------------------------------
// RichTextEditor baserad på TipTap – stödjer tabeller,
// fetstil, kursiv, listor, länk, textjustering m.m.
// Samma value/onChange-interface som react-quill-varianten.
// ---------------------------------------------------------

// Liten toolbar-knapp
const ToolbarButton = ({ onClick, active, title, children }) => (
    <button
        type="button"
        title={title}
        onMouseDown={e => { e.preventDefault(); onClick(); }}
        className={`px-2 py-1 rounded text-sm transition-colors ${active
            ? 'bg-indigo-600 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#282a2c]'
            }`}
    >
        {children}
    </button>
);

const Divider = () => (
    <div className="w-px h-5 bg-gray-200 dark:bg-[#3c4043] mx-1 self-center" />
);

const RichTextEditor = ({ value, onChange, placeholder, style }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                // Inaktivera link i StarterKit – vi registrerar vår egen Link-extension nedan
                link: false,
                codeBlock: { HTMLAttributes: { class: 'ql-syntax' } },
            }),
            Table.configure({ resizable: false, HTMLAttributes: { class: 'tiptap-table' } }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-indigo-500 underline' } }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: placeholder || 'Skriv här...' }),
        ],
        content: value || '',
        onUpdate: ({ editor: e }) => {
            const html = e.getHTML();
            // Behandla tom editor (bara <p></p>) som tom sträng
            onChange(html === '<p></p>' ? '' : html);
        },
        editorProps: {
            attributes: { class: 'tiptap-editor focus:outline-none' },
        },
    });

    // Synka externt value om det ändras (t.ex. vid reset av formulär)
    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        const incoming = value || '';
        if (current !== incoming) {
            editor.commands.setContent(incoming, false);
        }
    }, [value, editor]);

    // Infoga tabell
    const insertTable = useCallback((rows, cols) => {
        if (!editor) return;
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    }, [editor]);

    // Lägg till/sätt länk
    const setLink = useCallback(() => {
        if (!editor) return;
        const prev = editor.getAttributes('link').href;
        const url = window.prompt('Länk URL:', prev || 'https://');
        if (url === null) return;
        if (url === '') { editor.chain().focus().unsetLink().run(); return; }
        editor.chain().focus().setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    const isActive = (name, attrs) => editor.isActive(name, attrs);
    const inTable = editor.isActive('table');

    return (
        <div
            className="rich-text-editor-wrapper bg-white dark:bg-[#131314] rounded-lg border border-gray-300 dark:border-[#3c4043] overflow-visible focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all"
            style={style}
        >
            {/* ─── Toolbar ─────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-[#3c4043] bg-gray-50 dark:bg-[#1e1f20]">

                {/* Rubrik */}
                <select
                    value={
                        isActive('heading', { level: 1 }) ? '1'
                            : isActive('heading', { level: 2 }) ? '2'
                                : isActive('heading', { level: 3 }) ? '3'
                                    : ''
                    }
                    onMouseDown={e => e.preventDefault()}
                    onChange={e => {
                        const v = e.target.value;
                        if (v === '') editor.chain().focus().setParagraph().run();
                        else editor.chain().focus().toggleHeading({ level: parseInt(v) }).run();
                    }}
                    className="text-xs border border-gray-200 dark:border-[#3c4043] rounded px-1 py-0.5 bg-white dark:bg-[#282a2c] text-gray-700 dark:text-gray-300"
                >
                    <option value="">Normal</option>
                    <option value="1">Rubrik 1</option>
                    <option value="2">Rubrik 2</option>
                    <option value="3">Rubrik 3</option>
                </select>

                <Divider />

                {/* Formatering */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={isActive('bold')} title="Fet">B</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={isActive('italic')} title="Kursiv"><em>I</em></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline?.() || editor.chain().focus().run()} active={isActive('underline')} title="Understruken"><u>U</u></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={isActive('strike')} title="Genomstruken"><s>S</s></ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={isActive('blockquote')} title="Citat">❝</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={isActive('codeBlock')} title="Kodblock">{'</>'}</ToolbarButton>

                <Divider />

                {/* Listor */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={isActive('bulletList')} title="Punktlista">• Lista</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={isActive('orderedList')} title="Numrerad lista">1. Lista</ToolbarButton>

                <Divider />

                {/* Justering */}
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={isActive({ textAlign: 'left' })} title="Vänster">⟵</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={isActive({ textAlign: 'center' })} title="Centrerat">⟺</ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={isActive({ textAlign: 'right' })} title="Höger">⟶</ToolbarButton>

                <Divider />

                {/* Länk */}
                <ToolbarButton onClick={setLink} active={isActive('link')} title="Länk">🔗</ToolbarButton>

                <Divider />

                {/* Tabell – infoga */}
                <ToolbarButton onClick={() => insertTable(3, 3)} active={false} title="Infoga 3×3 tabell">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="inline mr-1">
                        <rect x="1" y="1" width="6" height="3" rx="1" />
                        <rect x="9" y="1" width="6" height="3" rx="1" />
                        <rect x="1" y="6" width="6" height="3" rx="1" opacity="0.7" />
                        <rect x="9" y="6" width="6" height="3" rx="1" opacity="0.7" />
                        <rect x="1" y="11" width="6" height="3" rx="1" opacity="0.4" />
                        <rect x="9" y="11" width="6" height="3" rx="1" opacity="0.4" />
                    </svg>
                    Tabell
                </ToolbarButton>

                {/* Tabell-operationer – visas bara när cursor är i en tabell */}
                {inTable && (
                    <>
                        <Divider />
                        <ToolbarButton onClick={() => editor.chain().focus().addColumnBefore().run()} active={false} title="Kolumn vänster">+Kol↑</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().addColumnAfter().run()} active={false} title="Kolumn höger">+Kol↓</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().deleteColumn().run()} active={false} title="Ta bort kolumn">−Kol</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().addRowBefore().run()} active={false} title="Rad ovan">+Rad↑</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().addRowAfter().run()} active={false} title="Rad nedan">+Rad↓</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().deleteRow().run()} active={false} title="Ta bort rad">−Rad</ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().deleteTable().run()} active={false} title="Ta bort tabell">✕ Tabell</ToolbarButton>
                    </>
                )}

                <Divider />
                <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} active={false} title="Rensa formatering">✕ Format</ToolbarButton>
            </div>

            {/* ─── Editor ──────────────────────────────────────── */}
            <EditorContent editor={editor} />

            <style>{`
                /* Editor-yta */
                .tiptap-editor {
                    padding: 0.75rem 1rem;
                    min-height: 150px;
                    font-family: inherit;
                    font-size: 0.875rem;
                    line-height: 1.6;
                    color: #111827;
                }
                .dark .tiptap-editor { color: #e2e8f0; }

                /* Placeholder */
                .tiptap-editor p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    float: left;
                    pointer-events: none;
                    height: 0;
                }

                /* Rubriker */
                .tiptap-editor h1 { font-size: 1.5rem; font-weight: 800; margin: 0.75rem 0 0.4rem; }
                .tiptap-editor h2 { font-size: 1.25rem; font-weight: 700; margin: 0.6rem 0 0.35rem; }
                .tiptap-editor h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.3rem; }

                /* Listor */
                .tiptap-editor ul { list-style: disc; margin: 0.4rem 0 0.4rem 1.5rem; }
                .tiptap-editor ol { list-style: decimal; margin: 0.4rem 0 0.4rem 1.5rem; }
                .tiptap-editor li { margin: 0.15rem 0; }

                /* Blockquote */
                .tiptap-editor blockquote {
                    border-left: 4px solid #818cf8;
                    padding: 0.25rem 0.75rem;
                    background: #eef2ff;
                    border-radius: 0 0.375rem 0.375rem 0;
                    margin: 0.5rem 0;
                }
                .dark .tiptap-editor blockquote { background: #1e1b4b30; }

                /* Kod */
                .tiptap-editor pre.ql-syntax,
                .tiptap-editor pre code {
                    background: #1e1e1e;
                    color: #d4d4d4;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    display: block;
                    overflow-x: auto;
                    font-size: 0.8rem;
                }
                .tiptap-editor code:not(pre code) {
                    background: #f1f5f9;
                    padding: 0.1rem 0.3rem;
                    border-radius: 0.25rem;
                    font-size: 0.8rem;
                }
                .dark .tiptap-editor code:not(pre code) { background: #282a2c; color: #e2e8f0; }

                /* Tabeller */
                .tiptap-editor table.tiptap-table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 0.75rem 0;
                    overflow: hidden;
                    border-radius: 0.5rem;
                    border: 1px solid #d1d5db;
                }
                .tiptap-editor table td,
                .tiptap-editor table th {
                    border: 1px solid #d1d5db;
                    padding: 0.45rem 0.7rem;
                    text-align: left;
                    vertical-align: top;
                    min-width: 60px;
                    position: relative;
                }
                .tiptap-editor table th {
                    background: #f3f4f6;
                    font-weight: 700;
                    color: #374151;
                }
                .tiptap-editor table tr:nth-child(even) td { background: #f9fafb; }
                .dark .tiptap-editor table.tiptap-table { border-color: #3c4043; }
                .dark .tiptap-editor table td,
                .dark .tiptap-editor table th { border-color: #3c4043; }
                .dark .tiptap-editor table th { background: #282a2c; color: #e2e8f0; }
                .dark .tiptap-editor table tr:nth-child(even) td { background: #1e1f20; }

                /* Markerad cell */
                .tiptap-editor table .selectedCell { background: #e0e7ff !important; }
                .dark .tiptap-editor table .selectedCell { background: #312e81 !important; }

                /* Länk */
                .tiptap-editor a { color: #6366f1; text-decoration: underline; }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
