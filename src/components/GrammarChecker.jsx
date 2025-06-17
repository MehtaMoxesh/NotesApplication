import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Edit3, Zap } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    checkGrammar();
  }, [content]);

  const checkGrammar = async () => {
    setIsLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const detectedIssues = [];
    
    sentences.forEach((sentence, sentenceIndex) => {
      const words = sentence.trim().split(/\s+/);
      
      // Check for common issues
      words.forEach((word, wordIndex) => {
        const lowerWord = word.toLowerCase();
        
        // Check for common spelling mistakes
        if (lowerWord === 'teh') {
          detectedIssues.push({
            id: `${sentenceIndex}-${wordIndex}`,
            type: 'spelling',
            severity: 'error',
            word: word,
            suggestion: 'the',
            sentence: sentence,
            position: { sentenceIndex, wordIndex },
            description: 'Common spelling mistake'
          });
        }
        
        if (lowerWord === 'recieve') {
          detectedIssues.push({
            id: `${sentenceIndex}-${wordIndex}`,
            type: 'spelling',
            severity: 'error',
            word: word,
            suggestion: 'receive',
            sentence: sentence,
            position: { sentenceIndex, wordIndex },
            description: 'Incorrect spelling'
          });
        }
        
        if (lowerWord === 'seperate') {
          detectedIssues.push({
            id: `${sentenceIndex}-${wordIndex}`,
            type: 'spelling',
            severity: 'error',
            word: word,
            suggestion: 'separate',
            sentence: sentence,
            position: { sentenceIndex, wordIndex },
            description: 'Incorrect spelling'
          });
        }
      });
      
      // Check for sentence structure issues
      if (sentence.length > 100) {
        detectedIssues.push({
          id: `sentence-${sentenceIndex}`,
          type: 'style',
          severity: 'warning',
          word: sentence.substring(0, 50) + '...',
          suggestion: 'Consider breaking this long sentence into shorter ones',
          sentence: sentence,
          position: { sentenceIndex },
          description: 'Long sentence detected'
        });
      }
      
      // Check for capitalization issues
      if (sentence.length > 0 && sentence[0] !== sentence[0].toUpperCase()) {
        detectedIssues.push({
          id: `cap-${sentenceIndex}`,
          type: 'grammar',
          severity: 'error',
          word: sentence[0],
          suggestion: sentence[0].toUpperCase(),
          sentence: sentence,
          position: { sentenceIndex },
          description: 'Sentence should start with capital letter'
        });
      }
    });
    
    setIssues(detectedIssues);
    setIsLoading(false);
  };

  const applyCorrection = (issue) => {
    if (!onApplyCorrection) return;
    
    const textContent = content.replace(/<[^>]*>/g, '');
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let newContent = content;
    
    if (issue.type === 'spelling') {
      // Replace the specific word
      const regex = new RegExp(`\\b${issue.word}\\b`, 'gi');
      newContent = content.replace(regex, issue.suggestion);
    } else if (issue.type === 'grammar' && issue.description.includes('capital')) {
      // Fix capitalization
      const sentenceStart = sentences[issue.position.sentenceIndex];
      if (sentenceStart) {
        const correctedSentence = sentenceStart.charAt(0).toUpperCase() + sentenceStart.slice(1);
        newContent = content.replace(sentenceStart, correctedSentence);
      }
    }
    
    onApplyCorrection(newContent);
    setSelectedIssue(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return isDark ? 'text-red-400' : 'text-red-600';
      case 'warning':
        return isDark ? 'text-yellow-400' : 'text-yellow-600';
      default:
        return isDark ? 'text-blue-400' : 'text-blue-600';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'error':
        return isDark ? 'bg-red-900/20' : 'bg-red-50';
      case 'warning':
        return isDark ? 'bg-yellow-900/20' : 'bg-yellow-50';
      default:
        return isDark ? 'bg-blue-900/20' : 'bg-blue-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle size={20} className={isDark ? 'text-green-400' : 'text-green-600'} />
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Grammar Check
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle size={20} className={isDark ? 'text-green-400' : 'text-green-600'} />
        <h3 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Grammar Check
        </h3>
        {issues.length > 0 && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isDark ? 'bg-red-600 text-red-100' : 'bg-red-100 text-red-800'
          }`}>
            {issues.length} issue{issues.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {issues.length === 0 ? (
        <div className={`p-4 rounded-lg text-center ${
          isDark ? 'bg-gray-700' : 'bg-green-50'
        }`}>
          <CheckCircle size={32} className={`mx-auto mb-2 ${
            isDark ? 'text-green-400' : 'text-green-600'
          }`} />
          <p className={`text-sm ${
            isDark ? 'text-green-400' : 'text-green-700'
          }`}>
            No grammar or spelling issues found!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-3 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle 
                      size={16} 
                      className={getSeverityColor(issue.severity)} 
                    />
                    <span className={`text-sm font-medium capitalize ${
                      isDark ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {issue.type} Issue
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      issue.severity === 'error' 
                        ? isDark ? 'bg-red-600 text-red-100' : 'bg-red-100 text-red-800'
                        : isDark ? 'bg-yellow-600 text-yellow-100' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {issue.description}
                  </p>
                  
                  <div className={`p-2 rounded text-sm font-mono ${
                    isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700'
                  }`}>
                    <span className="text-red-500">{issue.word}</span>
                    {issue.suggestion && (
                      <>
                        <span className="mx-2">→</span>
                        <span className="text-green-600">{issue.suggestion}</span>
                      </>
                    )}
                  </div>
                  
                  {issue.sentence && (
                    <p className={`text-xs mt-2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Context: "{issue.sentence.substring(0, 100)}..."
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => applyCorrection(issue)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  title="Apply correction"
                >
                  <Zap size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {issues.length > 0 && (
        <div className={`mt-4 p-3 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-blue-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Edit3 size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            <span className={`text-sm font-medium ${
              isDark ? 'text-blue-400' : 'text-blue-800'
            }`}>
              Quick Actions
            </span>
          </div>
          <p className={`text-xs ${
            isDark ? 'text-gray-300' : 'text-blue-700'
          }`}>
            Click the lightning bolt icon next to any issue to automatically apply the correction.
          </p>
        </div>
      )}
    </div>
  );
};

export default GrammarChecker; 