import React from 'react';
import { Pin, PinOff, Trash2, Lock, MoreVertical } from 'lucide-react';
import GlossaryHighlighter from './GlossaryHighlighter';
import { glossaryTerms } from '../data/glossary';

const NoteItem = ({ note, onSelect, onTogglePin, onDelete, isSelected, isDark }) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  const handleTogglePin = (e) => {
    e.stopPropagation();
    onTogglePin(note.id);
  };

  // Extract text content from HTML for preview
  const getTextContent = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const textContent = getTextContent(note.content);
  const preview = textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;

  return (
    <div
      onClick={() => onSelect(note)}
      className={`p-3 border-b cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-100 dark:bg-blue-600 text-blue-900 dark:text-white'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            {note.isPinned && (
              <Pin size={12} className="text-blue-500 flex-shrink-0" />
            )}
            {note.isEncrypted && (
              <Lock size={12} className="text-yellow-500 flex-shrink-0" />
            )}
            <h3 className={`font-medium truncate ${
              isSelected
                ? 'text-blue-900 dark:text-white'
                : 'text-gray-900 dark:text-gray-200'
            }`}>
              {note.title}
            </h3>
          </div>
          
          <p className={`text-sm line-clamp-2 ${
            isSelected
              ? 'text-blue-700 dark:text-blue-100'
              : 'text-gray-600 dark:text-gray-400'
          }`}>
            {note.isEncrypted ? '🔒 Encrypted note' : preview}
          </p>
          
          <div className={`text-xs mt-1 ${
            isSelected
              ? 'text-blue-600 dark:text-blue-200'
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {new Date(note.updatedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleTogglePin}
            className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
              note.isPinned
                ? 'text-blue-500 hover:bg-blue-500'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-500 dark:hover:bg-gray-400'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin size={14} />
          </button>
          
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-red-500 hover:bg-opacity-20 transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
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