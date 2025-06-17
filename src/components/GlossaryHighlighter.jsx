import React, { useState, useRef } from 'react';
import { Sparkles, Info } from 'lucide-react';
import './GlossaryPopup.css';

const GlossaryHighlighter = ({ content, glossary, isDark }) => {
  const [hoveredTerm, setHoveredTerm] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [hoveredTermInfo, setHoveredTermInfo] = useState(null);
  const containerRef = useRef(null);

  if (!content || typeof content !== 'string') return null;
  if (!glossary || typeof glossary !== 'object') return null;

  const handleMouseOver = (event, term) => {
    const termLower = term.toLowerCase();
    const isGlossaryTerm = glossary[termLower];
    
    // Position popup next to cursor
    setPopupPosition({ x: event.clientX + 15, y: event.clientY - 10 });
    setHoveredTerm(termLower);
    
    // Get term information
    const termInfo = {
      term: term,
      isGlossaryTerm: isGlossaryTerm,
      definition: isGlossaryTerm ? glossary[termLower] : null,
      basicInfo: !isGlossaryTerm ? getBasicTermInfo(term) : null
    };
    setHoveredTermInfo(termInfo);
  };

  const handleMouseMove = (event) => {
    if (hoveredTerm) {
      // Check if mouse is still within the container
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const isInContainer = 
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;
        
        if (!isInContainer) {
          clearHoverState();
          return;
        }
      }
      setPopupPosition({ x: event.clientX + 15, y: event.clientY - 10 });
    }
  };

  const clearHoverState = () => {
    setHoveredTerm(null);
    setHoveredTermInfo(null);
  };

  const handleMouseOut = (event) => {
    // Check if we're moving to a child element
    const relatedTarget = event.relatedTarget;
    if (relatedTarget && containerRef.current?.contains(relatedTarget)) {
      return;
    }
    clearHoverState();
  };

  // Function to get basic information about a term
  const getBasicTermInfo = (term) => {
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

  // Replace glossary terms in the content
  const processedContent = content.replace(
    new RegExp(`\\b(${Object.keys(glossary).join('|')})\\b`, 'gi'),
    (match) => {
      const isGlossaryTerm = glossary[match.toLowerCase()];
      const bgColor = isGlossaryTerm 
        ? (isDark ? '#3b4252' : '#eef2ff')  // Glossary terms
        : (isDark ? '#2d3748' : '#f3f4f6'); // Detected terms
      
      return `<span class="glossary-term" data-term="${match}" style="background-color: ${bgColor}; cursor: help; border-bottom: 1px dotted #6366f1; padding: 0 2px; border-radius: 2px;">${match}</span>`;
    }
  );

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={clearHoverState}
    >
      <div
        dangerouslySetInnerHTML={{ __html: processedContent }}
        onMouseOver={(e) => {
          const term = e.target.getAttribute('data-term');
          if (term) handleMouseOver(e, term);
        }}
        onMouseOut={handleMouseOut}
      />
      {hoveredTerm && hoveredTermInfo && (
        <div
          className="fixed z-50 max-w-xs p-3 rounded-lg shadow-2xl border transition-all duration-200 transform glossary-popup bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 shadow-gray-500/30 dark:shadow-gray-900/50"
          style={{ 
            position: 'fixed',
            left: popupPosition.x,
            top: popupPosition.y,
            pointerEvents: 'none',
            transform: 'translateY(-50%)',
            maxWidth: '300px'
          }}
        >
          <div className="font-semibold text-sm mb-1 flex items-center gap-2 text-blue-600 dark:text-blue-400">
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

export default GlossaryHighlighter;
