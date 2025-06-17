import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, BookOpen, Link, AlertCircle } from 'lucide-react';

const NoteInsights = ({ note, allNotes, isDark }) => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!note || note.isEncrypted) return;
    analyzeNote();
  }, [note]);

  const analyzeNote = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Extract text content from HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = note.content;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';

      // Basic NLP-like analysis
      const words = textContent.toLowerCase().split(/\s+/);
      const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      // Calculate basic metrics
      const wordCount = words.length;
      const sentenceCount = sentences.length;
      const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
      
      // Extract key phrases (simple implementation)
      const wordFreq = {};
      words.forEach(word => {
        if (word.length > 3) { // Ignore short words
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      });
      
      const keyPhrases = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);

      // Find related notes based on common words
      const relatedNotes = allNotes
        .filter(otherNote => 
          otherNote.id !== note.id && 
          !otherNote.isEncrypted &&
          otherNote.content.toLowerCase().split(/\s+/)
            .some(word => keyPhrases.includes(word))
        )
        .slice(0, 3);

      // Generate summary
      const summary = sentences.length > 0
        ? sentences.slice(0, 2).join('. ') + '.'
        : 'No content to summarize.';

      // Generate recommendations
      const recommendations = [];
      
      if (wordCount < 50) {
        recommendations.push('Consider adding more details to make this note more comprehensive.');
      }
      
      if (sentenceCount > 10 && avgWordLength > 6) {
        recommendations.push('This note might benefit from being split into multiple notes for better organization.');
      }
      
      if (keyPhrases.length < 3) {
        recommendations.push('Try adding more specific technical terms to improve glossary highlighting.');
      }

      // Update insights
      setInsights({
        summary,
        metrics: {
          wordCount,
          sentenceCount,
          avgWordLength: avgWordLength.toFixed(1)
        },
        keyPhrases,
        relatedNotes,
        recommendations
      });
    } catch (err) {
      console.error('Error analyzing note:', err);
      setError('Failed to analyze note content');
    } finally {
      setIsLoading(false);
    }
  };

  if (note?.isEncrypted) {
    return (
      <div className={`p-4 rounded-lg border ${
        isDark 
          ? 'bg-gray-800 border-gray-700 text-gray-400' 
          : 'bg-white border-gray-200 text-gray-500'
      }`}>
        <div className="flex items-center gap-2">
          <Lock size={20} />
          <span>Note is encrypted. Insights are not available.</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-4 rounded-lg border ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Analyzing note...
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

  if (!insights) return null;

  return (
    <div className={`p-4 rounded-lg border ${
      isDark 
        ? 'bg-gray-800 border-gray-700 text-gray-100' 
        : 'bg-white border-gray-200 text-gray-900'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-yellow-500" />
        <h3 className="font-semibold">AI Insights</h3>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            <h4 className="font-medium">Summary</h4>
          </div>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {insights.summary}
          </p>
        </div>

        {/* Metrics */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className={isDark ? 'text-green-400' : 'text-green-600'} />
            <h4 className="font-medium">Metrics</h4>
          </div>
          <div className={`grid grid-cols-3 gap-2 text-sm ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <div className="p-2 rounded bg-opacity-10 bg-blue-500">
              <div className="font-medium">{insights.metrics.wordCount}</div>
              <div className="text-xs">Words</div>
            </div>
            <div className="p-2 rounded bg-opacity-10 bg-green-500">
              <div className="font-medium">{insights.metrics.sentenceCount}</div>
              <div className="text-xs">Sentences</div>
            </div>
            <div className="p-2 rounded bg-opacity-10 bg-purple-500">
              <div className="font-medium">{insights.metrics.avgWordLength}</div>
              <div className="text-xs">Avg. Word Length</div>
            </div>
          </div>
        </div>

        {/* Key Phrases */}
        {insights.keyPhrases.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
              <h4 className="font-medium">Key Phrases</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {insights.keyPhrases.map((phrase, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs ${
                    isDark
                      ? 'bg-purple-900/30 text-purple-300'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Notes */}
        {insights.relatedNotes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <h4 className="font-medium">Related Notes</h4>
            </div>
            <div className="space-y-2">
              {insights.relatedNotes.map(relatedNote => (
                <div
                  key={relatedNote.id}
                  className={`p-2 rounded text-sm ${
                    isDark
                      ? 'bg-blue-900/20 text-blue-300'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                >
                  {relatedNote.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className={isDark ? 'text-yellow-400' : 'text-yellow-600'} />
              <h4 className="font-medium">Recommendations</h4>
            </div>
            <ul className={`space-y-2 text-sm ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {insights.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteInsights; 