import React from 'react';
import { Pin, PinOff, Trash2, Lock } from 'lucide-react';
import GlossaryHighlighter from './GlossaryHighlighter';
import { glossaryTerms } from '../data/glossary';

const NoteItem = ({ note, onSelect, onTogglePin, onDelete, isSelected, isDark }) => {
  const getPreviewText = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const previewText = getPreviewText(note.content);
  const truncatedPreview = previewText.length > 100 
    ? previewText.substring(0, 100) + '...' 
    : previewText;

  const handleClick = (e) => {
    // Prevent note selection if clicking on buttons
    if (e.target.closest('button')) return;
    onSelect(note);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border-b cursor-pointer transition-colors ${
        isSelected
          ? isDark
            ? 'bg-blue-900/20 border-blue-700'
            : 'bg-blue-50 border-blue-200'
          : isDark
          ? 'hover:bg-gray-700/50 border-gray-700'
          : 'hover:bg-gray-50 border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {note.isPinned && (
              <Pin size={14} className="text-blue-600 flex-shrink-0" />
            )}
            {note.isEncrypted && (
              <Lock size={14} className="text-yellow-500 flex-shrink-0" />
            )}
            <h3 className={`font-medium truncate ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {note.title}
            </h3>
          </div>
          <div className={`text-sm truncate ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {note.isEncrypted ? (
              <span className="italic">Encrypted note</span>
            ) : (
              <GlossaryHighlighter
                content={truncatedPreview || 'No content'}
                glossary={glossaryTerms}
                isDark={isDark}
              />
            )}
          </div>
          <div className={`text-xs mt-1 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            {new Date(note.updatedAt).toLocaleString()}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note.id);
            }}
            className={`p-1 rounded ${
              isDark
                ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin size={14} className={note.isPinned ? 'text-blue-600' : ''} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className={`p-1 rounded ${
              isDark
                ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400'
                : 'hover:bg-gray-100 text-gray-500 hover:text-red-600'
            }`}
            title="Delete note"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteItem;