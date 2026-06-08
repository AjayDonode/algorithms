'use client';
import { useCallback, useMemo } from 'react';
import CodeMirror, { EditorView, keymap } from '@uiw/react-codemirror';
import { java }       from '@codemirror/lang-java';
import { python }     from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

// ── Custom AlgoVerse syntax highlight ────────────────────────
// Orange accent keywords, green strings, blue types, yellow class names
const algoVerseHighlight = HighlightStyle.define([
  // Keywords: public, class, if, for, while, return, static, void, new, import…
  { tag: t.keyword,                    color: '#FF9500', fontWeight: '700' },
  { tag: t.modifier,                   color: '#FF9500', fontWeight: '600' },
  // Built-in types: int, String, boolean, double, List…
  { tag: t.typeName,                   color: '#64d2ff' },
  { tag: t.typeOperator,               color: '#64d2ff' },
  // Class names (definitions)
  { tag: t.className,                  color: '#ffd60a', fontWeight: '600' },
  { tag: t.definition(t.propertyName),  color: '#ffd60a' },
  // Method/function calls
  { tag: t.function(t.variableName),   color: '#5e9eff' },
  { tag: t.function(t.propertyName),   color: '#5e9eff' },
  // Strings
  { tag: t.string,                     color: '#a8ff60' },
  { tag: t.special(t.string),          color: '#a8ff60' },
  // Numbers & booleans
  { tag: t.number,                     color: '#ff9f0a' },
  { tag: t.bool,                       color: '#FF9500', fontWeight: '700' },
  // Comments — italic grey
  { tag: t.comment,                    color: '#636366', fontStyle: 'italic' },
  { tag: t.lineComment,                color: '#636366', fontStyle: 'italic' },
  { tag: t.blockComment,               color: '#636366', fontStyle: 'italic' },
  // Operators: + - * / = == != < >
  { tag: t.operator,                   color: '#ff6b81' },
  { tag: t.punctuation,                color: '#aeaeb2' },
  // Brackets and parens — colour-coded
  { tag: t.bracket,                    color: '#e5c07b' },
  { tag: t.squareBracket,              color: '#e5c07b' },
  { tag: t.paren,                      color: '#c678dd' },
  // Variables
  { tag: t.variableName,               color: '#d4d4d4' },
  { tag: t.propertyName,               color: '#abb2bf' },
  // Annotations: @Override, @param, @NotNull…
  { tag: t.annotation,                 color: '#56b6c2' },
  // null, None, this, self…
  { tag: t.null,                       color: '#56b6c2', fontStyle: 'italic' },
  { tag: t.self,                       color: '#e06c75', fontStyle: 'italic' },
  // String escape sequences (\n, \t…)
  { tag: t.escape,                     color: '#ff6b81' },
  // Python: import, from, as (namespace)
  { tag: t.namespace,                  color: '#64d2ff' },
  { tag: t.meta,                       color: '#FF9500' },
  // Errors
  { tag: t.invalid,                    color: '#ff453a', textDecoration: 'underline' },
]);

// ── Base theme — editor chrome (background, caret, gutter…) ──
const algoVerseBase = EditorView.theme({
  '&': {
    fontSize: '0.82rem',
    height: '100%',
    backgroundColor: '#1a1a1c',
    color: '#d4d4d4',
  },
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code', monospace",
    overflow: 'auto',
    height: '100%',
  },
  '.cm-content': {
    padding: '12px 0',
    caretColor: '#FF9500',
    minHeight: '100%',
  },
  '.cm-line': {
    padding: '0 16px',
    lineHeight: '1.65',
  },
  // Active line
  '.cm-activeLine': {
    backgroundColor: 'rgba(255,149,0,0.05)',
  },
  // Cursor
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#FF9500',
    borderLeftWidth: '2px',
  },
  // Selection
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'rgba(255,149,0,0.22)',
  },
  '::selection': {
    backgroundColor: 'rgba(255,149,0,0.22)',
  },
  // Gutter (line numbers)
  '.cm-gutters': {
    backgroundColor: '#161618',
    color: '#3a3a3c',
    border: 'none',
    borderRight: '1px solid #222224',
    minWidth: '42px',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 4px',
    minWidth: '42px',
    lineHeight: '1.65',
    fontSize: '0.75rem',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'rgba(255,149,0,0.07)',
    color: '#636366',
  },
  // Fold gutter
  '.cm-foldGutter .cm-gutterElement': {
    color: '#3a3a3c',
  },
  '.cm-foldGutter .cm-gutterElement:hover': {
    color: '#FF9500',
    cursor: 'pointer',
  },
  // Focus ring
  '&.cm-focused': {
    outline: 'none',
    boxShadow: 'inset 2px 0 0 #FF9500',
  },
  // Matching brackets
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(255,149,0,0.2)',
    outline: '1px solid rgba(255,149,0,0.5)',
    borderRadius: '2px',
  },
  '.cm-nonmatchingBracket': {
    backgroundColor: 'rgba(255,69,58,0.2)',
    outline: '1px solid rgba(255,69,58,0.4)',
    borderRadius: '2px',
  },
  // Search
  '.cm-searchMatch': {
    backgroundColor: 'rgba(255,214,0,0.2)',
    outline: '1px solid rgba(255,214,0,0.4)',
    borderRadius: '2px',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: 'rgba(255,149,0,0.3)',
  },
  // Autocomplete tooltip
  '.cm-tooltip': {
    backgroundColor: '#2c2c2e',
    border: '1px solid #3a3a3c',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  },
  '.cm-tooltip-autocomplete > ul > li': {
    padding: '3px 8px',
    color: '#aeaeb2',
  },
  '.cm-tooltip-autocomplete > ul > li[aria-selected]': {
    backgroundColor: 'rgba(255,149,0,0.15)',
    color: '#f5f5f7',
  },
  // Fold placeholder
  '.cm-foldPlaceholder': {
    backgroundColor: 'rgba(255,149,0,0.15)',
    border: '1px solid rgba(255,149,0,0.3)',
    borderRadius: '3px',
    color: '#FF9500',
    padding: '0 4px',
  },
  // Scrollbar
  '.cm-scroller::-webkit-scrollbar': {
    width: '5px',
    height: '5px',
  },
  '.cm-scroller::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '.cm-scroller::-webkit-scrollbar-thumb': {
    background: '#2d2d30',
    borderRadius: '3px',
  },
}, { dark: true });

// ── Language map ─────────────────────────────────────────────
type Lang = 'java' | 'python' | 'javascript';

function getLangExtension(lang: Lang) {
  switch (lang) {
    case 'java':       return [java()];
    case 'python':     return [python()];
    case 'javascript': return [javascript({ jsx: false, typescript: false })];
  }
}

// ── Props ─────────────────────────────────────────────────────
interface CodeEditorProps {
  lang: Lang;
  value: string;
  onChange: (val: string) => void;
  onRunShortcut?: () => void;
  readOnly?: boolean;
}

// ── Component ─────────────────────────────────────────────────
export function CodeEditor({ lang, value, onChange, onRunShortcut, readOnly }: CodeEditorProps) {
  const langExt = useMemo(() => getLangExtension(lang), [lang]);

  const runKeymap = useMemo(() => {
    if (!onRunShortcut) return [];
    return [keymap.of([{
      key: 'Mod-Enter',
      run: () => { onRunShortcut(); return true; },
    }])];
  }, [onRunShortcut]);

  const extensions = useMemo(() => [
    algoVerseBase,
    syntaxHighlighting(algoVerseHighlight),
    EditorView.lineWrapping,
    keymap.of([indentWithTab, ...defaultKeymap]),
    ...langExt,
    ...runKeymap,
  ], [langExt, runKeymap]);

  const handleChange = useCallback((val: string) => onChange(val), [onChange]);

  return (
    <CodeMirror
      value={value}
      onChange={handleChange}
      extensions={extensions}
      readOnly={readOnly}
      theme="none"         // suppress built-in theme — we supply our own
      basicSetup={{
        lineNumbers:               true,
        foldGutter:                true,
        highlightActiveLineGutter: true,
        highlightSpecialChars:     true,
        history:                   true,
        drawSelection:             true,
        dropCursor:                true,
        allowMultipleSelections:   true,
        indentOnInput:             true,
        syntaxHighlighting:        false, // we supply our own
        bracketMatching:           true,
        closeBrackets:             true,
        autocompletion:            true,
        rectangularSelection:      true,
        crosshairCursor:           false,
        highlightActiveLine:       true,
        highlightSelectionMatches: true,
        closeBracketsKeymap:       true,
        searchKeymap:              false,
        foldKeymap:                true,
        completionKeymap:          true,
        lintKeymap:                false,
      }}
      style={{ height: '100%', fontSize: '0.82rem' }}
    />
  );
}
