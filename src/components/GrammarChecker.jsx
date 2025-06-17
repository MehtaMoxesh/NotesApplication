import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

// Common grammar rules and their corrections
const GRAMMAR_RULES = [
  {
    pattern: /\b(i)\b/g,
    message: "Use 'I' instead of 'i' when referring to yourself",
    correction: 'I'
  },
  {
    pattern: /\b(its')\b/g,
    message: "Use 'its' for possession or 'it's' for 'it is'",
    correction: 'its'
  },
  {
    pattern: /\b(they're|their|there)\b/g,
    message: "Check usage: 'they're' (they are), 'their' (possession), 'there' (location)",
    correction: null // Context-dependent
  },
  {
    pattern: /\b(you're|your)\b/g,
    message: "Check usage: 'you're' (you are), 'your' (possession)",
    correction: null // Context-dependent
  },
  {
    pattern: /\b(who's|whose)\b/g,
    message: "Check usage: 'who's' (who is), 'whose' (possession)",
    correction: null // Context-dependent
  },
  {
    pattern: /\b(affect|effect)\b/g,
    message: "Check usage: 'affect' (verb), 'effect' (noun)",
    correction: null // Context-dependent
  },
  {
    pattern: /\b(then|than)\b/g,
    message: "Check usage: 'then' (time), 'than' (comparison)",
    correction: null // Context-dependent
  },
  {
    pattern: /\b(loose|lose)\b/g,
    message: "Check usage: 'loose' (not tight), 'lose' (to misplace)",
    correction: null // Context-dependent
  },
  {
    pattern: /\b(accept|except)\b/g,
    message: "Check usage: 'accept' (to receive), 'except' (excluding)",
    correction: null // Context-dependent
  },
  {
    pattern: /\b(weather|whether)\b/g,
    message: "Check usage: 'weather' (climate), 'whether' (if)",
    correction: null // Context-dependent
  }
];

// Common punctuation and style rules
const STYLE_RULES = [
  {
    pattern: /\.{2,}/g,
    message: "Use ellipsis (...) instead of multiple periods",
    correction: '...'
  },
  {
    pattern: /!{2,}/g,
    message: "Avoid multiple exclamation marks",
    correction: '!'
  },
  {
    pattern: /\?{2,}/g,
    message: "Avoid multiple question marks",
    correction: '?'
  },
  {
    pattern: /\s{2,}/g,
    message: "Avoid multiple spaces",
    correction: ' '
  },
  {
    pattern: /[A-Z]{2,}/g,
    message: "Avoid writing in all caps",
    correction: null // Convert to title case
  }
];

const GrammarChecker = ({ content, isDark, onApplyCorrection }) => {
  const [issues, setIssues] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!content) return;
    checkGrammar();
  }, [content]);

  const checkGrammar = () => {
    setIsChecking(true);
    setError(null);

    try {
      const newIssues = [];
      const textContent = content.replace(/<[^>]+>/g, ' '); // Remove HTML tags

      // Check grammar rules
      GRAMMAR_RULES.forEach(rule => {
        let match;
        while ((match = rule.pattern.exec(textContent)) !== null) {
          newIssues.push({
            type: 'grammar',
            word: match[0],
            message: rule.message,
            correction: rule.correction,
            index: match.index,
            length: match[0].length
          });
        }
      });

      // Check style rules
      STYLE_RULES.forEach(rule => {
        let match;
        while ((match = rule.pattern.exec(textContent)) !== null) {
          newIssues.push({
            type: 'style',
            word: match[0],
            message: rule.message,
            correction: rule.correction,
            index: match.index,
            length: match[0].length
          });
        }
      });

      // Sort issues by position in text
      newIssues.sort((a, b) => a.index - b.index);
      setIssues(newIssues);
    } catch (err) {
      console.error('Error checking grammar:', err);
      setError('Failed to check grammar');
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplyCorrection = (issue) => {
    if (!issue.correction) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    let newContent;
    if (issue.type === 'style' && issue.word.match(/[A-Z]{2,}/)) {
      // Convert to title case
      newContent = textContent.replace(
        issue.word,
        issue.word.charAt(0).toUpperCase() + issue.word.slice(1).toLowerCase()
      );
    } else {
      newContent = textContent.replace(issue.word, issue.correction);
    }

    // Preserve HTML structure
    const htmlContent = content.replace(
      new RegExp(issue.word, 'g'),
      issue.correction || issue.word.charAt(0).toUpperCase() + issue.word.slice(1).toLowerCase()
    );

    onApplyCorrection(htmlContent);
  };

  if (isChecking) {
    return (
      <div className={`p-4 rounded-lg border ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Checking grammar...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg border ${
        isDark 
          ? 'bg-red-900/20 border-red-700 text-red-400' 
          : 'bg-red-50 border-red-200 text-red-700'
      }`}>
        <div className="flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className={`p-4 rounded-lg border ${
        isDark 
          ? 'bg-green-900/20 border-green-700 text-green-400' 
          : 'bg-green-50 border-green-200 text-green-700'
      }`}>
        <div className="flex items-center gap-2">
          <CheckCircle size={20} />
          <span>No grammar issues found</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${
      isDark 
        ? 'bg-gray-800 border-gray-700 text-gray-100' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <XCircle size={20} className="text-yellow-500" />
        <h3 className="font-semibold">Grammar Check</h3>
        <span className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          ({issues.length} issues found)
        </span>
      </div>

      <div className="space-y-3">
        {issues.map((issue, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              isDark
                ? 'bg-gray-700/50 hover:bg-gray-700'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1 rounded ${
                issue.type === 'grammar'
                  ? isDark ? 'bg-blue-900/30' : 'bg-blue-100'
                  : isDark ? 'bg-purple-900/30' : 'bg-purple-100'
              }`}>
                {issue.type === 'grammar' ? (
                  <AlertCircle size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                ) : (
                  <AlertCircle size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-medium ${
                    isDark ? 'text-gray-200' : 'text-gray-700'
                  }`}>
                    {issue.word}
                  </span>
                  {issue.correction && (
                    <button
                      onClick={() => handleApplyCorrection(issue)}
                      className={`px-2 py-0.5 text-xs rounded ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      Fix
                    </button>
                  )}
                </div>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {issue.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrammarChecker; 