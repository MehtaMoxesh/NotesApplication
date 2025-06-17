import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  AlignLeft, AlignCenter, AlignRight, Quote, Code, Sun, Moon, Sparkles, Info 
} from 'lucide-react';
import { glossaryTerms, detectKeyTerms } from '../data/glossary';
import './RichTextEditor.css';

const RichTextEditor = ({ content, onChange, isDark, disabled = false }) => {
  const editorRef = useRef(null);
  const [selection, setSelection] = useState(null);
  const [hoveredTerm, setHoveredTerm] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [hasEdited, setHasEdited] = useState(false);
  const [hoveredTermInfo, setHoveredTermInfo] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        setSelection({
          start: range.startOffset,
          end: range.endOffset,
          startContainer: range.startContainer,
          endContainer: range.endContainer,
        });
      }
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (selection && editorRef.current) {
      const sel = window.getSelection();
      const range = document.createRange();
      try {
        range.setStart(selection.startContainer, selection.start);
        range.setEnd(selection.endContainer, selection.end);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (e) {
        console.warn('Could not restore selection:', e);
      }
    }
  }, [selection]);

  const execCommand = useCallback(
    (command, value = null) => {
      editorRef.current?.focus();
      restoreSelection();
      document.execCommand(command, false, value);
      saveSelection();
      setTimeout(() => {
        if (editorRef.current) {
          onChange && onChange(editorRef.current.innerHTML);
        }
      }, 0);
    },
    [restoreSelection, saveSelection, onChange]
  );

  const handleInput = useCallback(
    (e) => {
      if (!hasEdited) setHasEdited(true);
      onChange && onChange(e.target.innerHTML);
      saveSelection();
    },
    [saveSelection, hasEdited, onChange]
  );

  // When the content prop changes, update the editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            execCommand('bold');
            break;
          case 'i':
            e.preventDefault();
            execCommand('italic');
            break;
          case 'u':
            e.preventDefault();
            execCommand('underline');
            break;
          default:
            break;
        }
      }
    },
    [execCommand]
  );

  const handleMouseOver = (e) => {
    const term = e.target.getAttribute('data-term');
    if (term) {
      // Position popup next to cursor
      setPopupPosition({ x: e.clientX + 15, y: e.clientY - 10 });
      setHoveredTerm(term.toLowerCase());
      
      // Get term information
      const isGlossaryTerm = glossaryTerms[term.toLowerCase()];
      const termInfo = {
        term: term,
        isGlossaryTerm: isGlossaryTerm,
        definition: isGlossaryTerm ? glossaryTerms[term.toLowerCase()] : null,
        // Add basic information for non-glossary terms
        basicInfo: !isGlossaryTerm ? getBasicTermInfo(term) : null
      };
      setHoveredTermInfo(termInfo);
    }
  };

  const handleMouseMove = (e) => {
    if (hoveredTerm) {
      // Update popup position as cursor moves
      setPopupPosition({ x: e.clientX + 15, y: e.clientY - 10 });
    }
  };

  const handleMouseOut = () => {
    setHoveredTerm(null);
  };

  const highlightGlossaryTerms = (html) => {
    if (!html) return html;
    
    // Create a temporary div to extract text content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Detect terms using AI-like logic
    const detectedTerms = detectKeyTerms(textContent);
    
    let processedHtml = html;
    
    // Sort terms by length (longest first) to avoid partial replacements
    detectedTerms.sort((a, b) => b.length - a.length);
    
    // Add previous keywords to the list of terms to highlight
    const allTerms = [...new Set([...detectedTerms, ...Object.keys(glossaryTerms)])];
    
    allTerms.forEach(term => {
      const regex = new RegExp(`\\b(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
      processedHtml = processedHtml.replace(regex, (match) => {
        // Check if the match is already inside a glossary-term span
        const beforeMatch = processedHtml.substring(0, processedHtml.indexOf(match));
        const openSpans = (beforeMatch.match(/<span[^>]*class="glossary-term"/g) || []).length;
        const closeSpans = (beforeMatch.match(/<\/span>/g) || []).length;
        
        if (openSpans > closeSpans) {
          // We're inside a glossary-term span, don't highlight
          return match;
        }
        
        // Use different background colors for detected terms vs glossary terms
        const isGlossaryTerm = glossaryTerms[term.toLowerCase()];
        const bgColor = isGlossaryTerm 
          ? (isDark ? '#3b4252' : '#eef2ff')  // Glossary terms
          : (isDark ? '#2d3748' : '#f3f4f6'); // Detected terms
        
        return `<span class="glossary-term" data-term="${match.toLowerCase()}" style="background-color: ${bgColor}; cursor: help; border-bottom: 1px dotted #6366f1; padding: 0 2px; border-radius: 2px;">${match}</span>`;
      });
    });
    
    return processedHtml;
  };

  // Auto-highlight terms after typing with debounce
  useEffect(() => {
    if (!editorRef.current || !hasEdited) return;

    const timeout = setTimeout(() => {
      const editor = editorRef.current;
      const currentHtml = editor.innerHTML;
      
      // Remove existing highlights first to avoid nested spans
      const cleanHtml = currentHtml.replace(/<span class="glossary-term"[^>]*>(.*?)<\/span>/gi, '$1');
      
      const newHtml = highlightGlossaryTerms(cleanHtml);

      if (editor.innerHTML !== newHtml) {
        const selection = window.getSelection();
        let range = null;
        let startOffset = 0;
        let endOffset = 0;
        
        if (selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
          startOffset = range.startOffset;
          endOffset = range.endOffset;
        }

        editor.innerHTML = newHtml;

        // Restore cursor position
        if (range && editor.firstChild) {
          try {
            const newRange = document.createRange();
            const walker = document.createTreeWalker(
              editor,
              NodeFilter.SHOW_TEXT,
              null,
              false
            );
            
            let currentOffset = 0;
            let startNode = null;
            let endNode = null;
            
            while (walker.nextNode()) {
              const textNode = walker.currentNode;
              const textLength = textNode.textContent.length;
              
              if (!startNode && currentOffset + textLength >= startOffset) {
                startNode = textNode;
              }
              if (!endNode && currentOffset + textLength >= endOffset) {
                endNode = textNode;
                break;
              }
              currentOffset += textLength;
            }
            
            if (startNode && endNode) {
              newRange.setStart(startNode, Math.min(startOffset - (currentOffset - startNode.textContent.length), startNode.textContent.length));
              newRange.setEnd(endNode, Math.min(endOffset - (currentOffset - endNode.textContent.length), endNode.textContent.length));
              
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } catch (e) {
            // Ignore cursor restoration errors
            console.warn('Could not restore cursor position:', e);
          }
        }
      }
    }, 800); // Increased debounce time for better performance

    return () => clearTimeout(timeout);
  }, [content, hasEdited, isDark]);

  // Initialize with sample content that won't be overwritten
  useEffect(() => {
    if (editorRef.current && !hasEdited && !content) {
      const sampleContent = `<p>Welcome to the Smart Rich Text Editor!</p><p>This editor features <strong>AI-powered glossary highlighting</strong>. Try typing technical terms like:</p><ul><li><strong>JavaScript</strong> - A programming language</li><li><strong>React</strong> - A UI library</li><li><strong>artificial intelligence</strong> - Computer systems with human-like intelligence</li><li><strong>machine learning</strong> - AI that learns from data</li></ul><p>These terms will be automatically highlighted as you type, and you can hover over them to see definitions!</p>`;
      editorRef.current.innerHTML = sampleContent;
    }
  }, [hasEdited, content]);

  const toolbarButtons = [
    { command: 'bold', icon: Bold, title: 'Bold' },
    { command: 'italic', icon: Italic, title: 'Italic' },
    { command: 'underline', icon: Underline, title: 'Underline' },
    { command: 'insertUnorderedList', icon: List, title: 'Bullet List' },
    { command: 'insertOrderedList', icon: ListOrdered, title: 'Numbered List' },
    { command: 'justifyLeft', icon: AlignLeft, title: 'Align Left' },
    { command: 'justifyCenter', icon: AlignCenter, title: 'Align Center' },
    { command: 'justifyRight', icon: AlignRight, title: 'Align Right' },
    { command: 'formatBlock', value: 'blockquote', icon: Quote, title: 'Quote' },
    { command: 'formatBlock', value: 'pre', icon: Code, title: 'Code Block' }
  ];

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

  // Function to get basic information about a term
  const getBasicTermInfo = (term) => {
    // This is a simple example - you can enhance this with more sophisticated logic
    const termLower = term.toLowerCase();
    if (termLower.includes('code') || termLower.includes('program')) {
      return "A set of instructions that tells a computer what to do";
    } else if (termLower.includes('data')) {
      return "Information that can be processed by a computer";
    } else if (termLower.includes('web') || termLower.includes('internet')) {
      return "A global network of connected computers";
    } else if (termLower.includes('app') || termLower.includes('application')) {
      return "A software program designed for a specific purpose";
    } else if (termLower.includes('api')) {
      return "Application Programming Interface - a way for programs to communicate";
    } else if (termLower.includes('cloud')) {
      return "Remote servers and services accessed over the internet";
    }
    return "A technical term in computing and software development";
  };

  return (
    <div className={`rich-text-editor ${isDark ? 'dark' : ''} ${disabled ? 'disabled' : ''}`}>
      {/* Toolbar */}
      <div className={`toolbar ${isDark ? 'dark' : ''}`}>
        <div className="toolbar-group">
          {toolbarButtons.slice(0, 3).map((button) => (
            <button
              key={button.command}
              onClick={() => execCommand(button.command, button.value)}
              className={`toolbar-button ${isDark ? 'dark' : ''}`}
              title={button.title}
              disabled={disabled}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>
        
        <div className="toolbar-group">
          {toolbarButtons.slice(3, 5).map((button) => (
            <button
              key={button.command}
              onClick={() => execCommand(button.command, button.value)}
              className={`toolbar-button ${isDark ? 'dark' : ''}`}
              title={button.title}
              disabled={disabled}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>
        
        <div className="toolbar-group">
          {toolbarButtons.slice(5, 8).map((button) => (
            <button
              key={button.command}
              onClick={() => execCommand(button.command, button.value)}
              className={`toolbar-button ${isDark ? 'dark' : ''}`}
              title={button.title}
              disabled={disabled}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>
        
        <div className="toolbar-group">
          {toolbarButtons.slice(8).map((button) => (
            <button
              key={button.command}
              onClick={() => execCommand(button.command, button.value)}
              className={`toolbar-button ${isDark ? 'dark' : ''}`}
              title={button.title}
              disabled={disabled}
            >
              <button.icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onKeyDown={handleKeyDown}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        className={`editor ${isDark ? 'dark' : ''} ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}
        style={{
          minHeight: '200px',
          padding: '1rem',
          border: '1px solid',
          borderColor: isDark ? '#374151' : '#d1d5db',
          borderRadius: '0.5rem',
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          color: isDark ? '#f9fafb' : '#111827',
          fontSize: '14px',
          lineHeight: '1.6',
          outline: 'none',
          overflowY: 'auto'
        }}
        placeholder="Start writing your note..."
      />

      {/* Glossary Popup */}
      {hoveredTerm && hoveredTermInfo && (
        <div
          className={`fixed z-50 max-w-xs p-3 rounded-lg shadow-2xl border transition-all duration-200 transform glossary-popup ${
            isDark 
              ? 'bg-gray-800 border-gray-600 text-gray-100 shadow-gray-900/50' 
              : 'bg-white border-gray-200 text-gray-900 shadow-gray-500/30'
          }`}
          style={{ 
            position: 'fixed',
            left: popupPosition.x,
            top: popupPosition.y,
            pointerEvents: 'none',
            transform: 'translateY(-50%)',
            maxWidth: '300px'
          }}
        >
          <div className={`font-semibold text-sm mb-1 flex items-center gap-2 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`}>
            {hoveredTermInfo.isGlossaryTerm ? (
              <Sparkles size={14} className="text-yellow-400" />
            ) : (
              <Info size={14} className="text-gray-400" />
            )}
            {hoveredTermInfo.term.charAt(0).toUpperCase() + hoveredTermInfo.term.slice(1)}
          </div>
          <div className="text-sm leading-relaxed">
            {hoveredTermInfo.isGlossaryTerm ? (
              hoveredTermInfo.definition
            ) : (
              <>
                <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Basic Information:</div>
                {hoveredTermInfo.basicInfo}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;