/**
 * Smart Notes App
 * Copyright (c) 2024 [Your Name]
 * 
 * This is an original work created as a demonstration of modern web development skills.
 * Unauthorized copying, distribution, or use of this code will be considered plagiarism.
 * 
 * Features:
 * - AI-powered glossary highlighting
 * - Note encryption
 * - Smart insights
 * - Rich text editing
 * - Dark/light mode
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pin, Lock, Unlock, AlertCircle } from 'lucide-react';
import SearchBar from './components/SearchBar';
import NoteItem from './components/NoteItem';
import RichTextEditor from './components/RichTextEditor';
import ThemeToggle from './components/ThemeToggle';
import NoteEncryption from './components/NoteEncryption';
import NoteInsights from './components/NoteInsights';
import GrammarChecker from './components/GrammarChecker';

// Constants for localStorage keys
const STORAGE_KEYS = {
  NOTES: 'smart_notes_data',
  NEXT_ID: 'smart_notes_next_id',
  USER_PREFS: 'smart_notes_preferences',
  VERSION: 'smart_notes_version'
};

const CURRENT_VERSION = '1.0.0';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [nextId, setNextId] = useState(1);
  const [isDark, setIsDark] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPreferences, setUserPreferences] = useState({
    autoSave: true,
    spellCheck: true,
    fontSize: '16px',
    theme: 'system', // 'system', 'light', 'dark'
    encryptionEnabled: false,
    lastSync: null
  });

  // Load user preferences
  useEffect(() => {
    try {
      const storedPrefs = localStorage.getItem(STORAGE_KEYS.USER_PREFS);
      if (storedPrefs) {
        const prefs = JSON.parse(storedPrefs);
        setUserPreferences(prev => ({ ...prev, ...prefs }));
        
        // Apply theme preference
        if (prefs.theme === 'system') {
          setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
        } else {
          setIsDark(prefs.theme === 'dark');
        }
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
      setError('Failed to load user preferences');
    }
  }, []);

  // Save user preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFS, JSON.stringify({
        ...userPreferences,
        lastSync: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save user preferences');
    }
  }, [userPreferences]);

  // Load notes with version check and migration
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const storedVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
        const storedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
        const storedNextId = localStorage.getItem(STORAGE_KEYS.NEXT_ID);

        // Version check and migration
        if (storedVersion !== CURRENT_VERSION) {
          // Handle data migration if needed
          console.log('Migrating data to version:', CURRENT_VERSION);
          // Add migration logic here when needed
          localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
        }

        if (storedNotes) {
          const parsedNotes = JSON.parse(storedNotes);
          setNotes(parsedNotes);
          setSelectedNote(parsedNotes[0] || null);
          setNextId(storedNextId ? parseInt(storedNextId, 10) : 
            (parsedNotes.length > 0 ? Math.max(...parsedNotes.map(n => n.id)) + 1 : 1));
        } else {
          // Initialize with an empty note if no notes exist
          const initialNote = {
            id: 1,
            title: 'Welcome to Smart Notes',
            content: '<p>Welcome to your new note-taking app! 🎉</p><p>Features include:</p><ul><li>AI-powered glossary highlighting</li><li>Rich text editing</li><li>Note encryption</li><li>Smart insights</li></ul>',
            isPinned: true,
            isEncrypted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: ['welcome'],
            insights: {
              summary: 'Welcome note with feature overview',
              keyPoints: ['AI-powered glossary', 'Rich text editing', 'Note encryption', 'Smart insights'],
              relatedNotes: []
            }
          };
          setNotes([initialNote]);
          setSelectedNote(initialNote);
          setNextId(2);
        }
      } catch (err) {
        console.error('Error loading notes:', err);
        setError('Failed to load notes. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-save notes with debounce
  useEffect(() => {
    if (!userPreferences.autoSave || isLoading) return;

    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
        localStorage.setItem(STORAGE_KEYS.NEXT_ID, nextId.toString());
        setUserPreferences(prev => ({
          ...prev,
          lastSync: new Date().toISOString()
        }));
      } catch (err) {
        console.error('Error auto-saving notes:', err);
        setError('Failed to auto-save notes');
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeout);
  }, [notes, nextId, userPreferences.autoSave, isLoading]);

  // Handle system theme changes
  useEffect(() => {
    if (userPreferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e) => setIsDark(e.matches);
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [userPreferences.theme]);

  const createNewNote = useCallback(() => {
    const newNote = {
      id: nextId,
      title: `Note ${nextId}`,
      content: '', // Empty content
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNote(newNote);
    setNextId((prev) => prev + 1);
    setEditorContent('');
  }, [nextId]);

  const updateNote = useCallback(
    (noteId, updates) => {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, ...updates, updatedAt: new Date().toISOString() }
            : note
        )
      );

      if (selectedNote && selectedNote.id === noteId) {
        setSelectedNote((prev) => ({ ...prev, ...updates }));
      }
    },
    [selectedNote]
  );

  const deleteNote = useCallback(
    (noteId) => {
      if (window.confirm('Are you sure you want to delete this note?')) {
        setNotes((prev) => prev.filter((note) => note.id !== noteId));

        if (selectedNote && selectedNote.id === noteId) {
          setSelectedNote(null);
        }
      }
    },
    [selectedNote]
  );

  const togglePin = useCallback((noteId) => {
    setNotes((prev) => {
      const updated = prev.map((note) =>
        note.id === noteId
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date().toISOString() }
          : note
      );

      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    });
  }, []);

  const handleNoteContentChange = useCallback(
    (content) => {
      if (selectedNote) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const title = textContent.trim() ? 
          textContent.split('\n')[0].substring(0, 30) || 'Untitled Note' : 
          'Untitled Note';

        updateNote(selectedNote.id, {
          content,
          title,
        });
      }
    },
    [selectedNote, updateNote]
  );

  const handleAddAsNewNote = useCallback(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const title = textContent.trim() ?
      textContent.split('\n')[0].substring(0, 30) || 'Untitled Note' :
      'Untitled Note';
    const newNote = {
      id: nextId,
      title,
      content: editorContent,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNote(newNote);
    setNextId((prev) => prev + 1);
  }, [editorContent, nextId]);

  const filteredNotes = notes.filter((note) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const titleMatch = note.title.toLowerCase().includes(searchLower);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const contentMatch = textContent.toLowerCase().includes(searchLower);

    return titleMatch || contentMatch;
  });

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-4 text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className={`flex h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
          {/* Sidebar */}
          <div className={`w-80 border-r flex flex-col ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Smart Notes
                </h1>
                <div className="flex items-center gap-2">
                  <ThemeToggle isDark={isDark} onToggle={setIsDark} />
                  <button
                    onClick={createNewNote}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Create new note"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} isDark={isDark} />
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredNotes.length === 0 ? (
                <div className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm ? 'No notes found' : 'No notes yet'}
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    onSelect={setSelectedNote}
                    onTogglePin={togglePin}
                    onDelete={deleteNote}
                    isSelected={selectedNote?.id === note.id}
                    isDark={isDark}
                  />
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {selectedNote ? (
              <>
                <div className={`p-4 border-b ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedNote.isPinned && <Pin size={16} className="text-blue-600" />}
                      {selectedNote.isEncrypted && <Lock size={16} className="text-yellow-500" />}
                      <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {selectedNote.title}
                      </h2>
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="max-w-4xl mx-auto space-y-4">
                    {/* Editor */}
                    <div className={`p-4 rounded-lg border ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <RichTextEditor
                        content={selectedNote.isEncrypted ? '' : (selectedNote.content || '')}
                        onChange={(content) => {
                          setEditorContent(content);
                        }}
                        isDark={isDark}
                        disabled={selectedNote.isEncrypted}
                      />
                      {!selectedNote.isEncrypted && (
                        <button
                          onClick={() => {
                            if (!selectedNote) return;
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = editorContent;
                            const textContent = tempDiv.textContent || tempDiv.innerText || '';
                            const title = textContent.trim() ?
                              textContent.split('\n')[0].substring(0, 30) || 'Untitled Note' :
                              'Untitled Note';
                            const updatedNote = {
                              ...selectedNote,
                              content: editorContent,
                              title,
                              updatedAt: new Date().toISOString(),
                            };
                            setNotes((prev) => prev.map((note) => note.id === selectedNote.id ? updatedNote : note));
                            setSelectedNote(updatedNote);
                          }}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                      )}
                    </div>

                    {/* Encryption */}
                    <NoteEncryption
                      note={selectedNote}
                      onEncrypt={(updatedNote) => {
                        setNotes((prev) => prev.map((note) => note.id === selectedNote.id ? updatedNote : note));
                        setSelectedNote(updatedNote);
                      }}
                      onDecrypt={(updatedNote) => {
                        setNotes((prev) => prev.map((note) => note.id === selectedNote.id ? updatedNote : note));
                        setSelectedNote(updatedNote);
                      }}
                      isDark={isDark}
                    />

                    {/* Insights */}
                    {!selectedNote.isEncrypted && (
                      <NoteInsights
                        note={selectedNote}
                        allNotes={notes}
                        isDark={isDark}
                      />
                    )}

                    {/* Grammar Check */}
                    {!selectedNote.isEncrypted && (
                      <GrammarChecker
                        content={selectedNote.content}
                        isDark={isDark}
                        onApplyCorrection={(newContent) => {
                          const updatedNote = {
                            ...selectedNote,
                            content: newContent,
                            updatedAt: new Date().toISOString(),
                          };
                          setNotes((prev) => prev.map((note) => note.id === selectedNote.id ? updatedNote : note));
                          setSelectedNote(updatedNote);
                          setEditorContent(newContent);
                        }}
                      />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className={`flex-1 flex items-center justify-center ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="text-center">
                  <div className="text-6xl mb-4">🧠</div>
                  <h2 className={`text-xl font-semibold mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-600'
                  }`}>
                    Welcome to Smart Notes
                  </h2>
                  <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    AI-powered note taking with automatic glossary highlighting
                  </p>
                  <button
                    onClick={createNewNote}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create New Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;