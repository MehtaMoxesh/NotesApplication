import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Link, Lightbulb, Clock, Hash } from 'lucide-react';

const NoteInsights = ({ note, allNotes, isDark }) => {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, [note, allNotes]);

  const generateInsights = async () => {
    setIsLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const content = note.content || '';
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    
    const wordCount = textContent.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = textContent.length;
    const sentences = textContent.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    const paragraphs = content.split(/<\/p>|<br\s*\/?>/).filter(p => p.trim().length > 0);
    
    // Extract key phrases (simple implementation)
    const words = textContent.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const keyPhrases = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
    
    // Find related notes
    const relatedNotes = allNotes
      .filter(otherNote => 
        otherNote.id !== note.id && 
        !otherNote.isEncrypted &&
        (otherNote.title.toLowerCase().includes(keyPhrases[0]?.toLowerCase() || '') ||
         otherNote.content.toLowerCase().includes(keyPhrases[0]?.toLowerCase() || ''))
      )
      .slice(0, 3);
    
    // Generate recommendations
    const recommendations = [];
    if (wordCount < 50) {
      recommendations.push('Consider adding more details to make this note more comprehensive');
    }
    if (paragraphs.length < 2) {
      recommendations.push('Try breaking your content into multiple paragraphs for better readability');
    }
    if (!keyPhrases.length) {
      recommendations.push('Add more specific terms to help with categorization');
    }
    if (recommendations.length === 0) {
      recommendations.push('Great note! Consider adding tags or categories for better organization');
    }
    
    setInsights({
      summary: sentences.length > 0 ? sentences.slice(0, 2).join('. ') + '.' : 'No content to summarize',
      keyPhrases,
      wordCount,
      charCount,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      relatedNotes,
      recommendations,
      readingTime: Math.ceil(wordCount / 200) // Average reading speed
    });
    
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={20} className="text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Insights
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Brain size={20} className="text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Insights
        </h3>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-400">
              Summary
            </span>
          </div>
          <p className="text-sm text-purple-700 dark:text-gray-300">
            {insights.summary}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg text-center bg-blue-50 dark:bg-gray-700">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {insights.wordCount}
            </div>
            <div className="text-xs text-blue-600 dark:text-gray-400">
              Words
            </div>
          </div>
          
          <div className="p-3 rounded-lg text-center bg-green-50 dark:bg-gray-700">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {insights.charCount}
            </div>
            <div className="text-xs text-green-600 dark:text-gray-400">
              Characters
            </div>
          </div>
          
          <div className="p-3 rounded-lg text-center bg-yellow-50 dark:bg-gray-700">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {insights.sentences}
            </div>
            <div className="text-xs text-yellow-600 dark:text-gray-400">
              Sentences
            </div>
          </div>
          
          <div className="p-3 rounded-lg text-center bg-orange-50 dark:bg-gray-700">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {insights.readingTime}m
            </div>
            <div className="text-xs text-orange-600 dark:text-gray-400">
              Read Time
            </div>
          </div>
        </div>

        {/* Key Phrases */}
        {insights.keyPhrases.length > 0 && (
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Hash size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-800 dark:text-indigo-400">
                Key Phrases
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {insights.keyPhrases.map((phrase, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-600 text-indigo-800 dark:text-indigo-100"
                >
                  {phrase}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Notes */}
        {insights.relatedNotes.length > 0 && (
          <div className="p-3 rounded-lg bg-teal-50 dark:bg-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Link size={16} className="text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-medium text-teal-800 dark:text-teal-400">
                Related Notes
              </span>
            </div>
            <div className="space-y-1">
              {insights.relatedNotes.map((relatedNote) => (
                <div
                  key={relatedNote.id}
                  className="text-sm p-2 rounded bg-teal-100 dark:bg-gray-600 text-teal-700 dark:text-gray-300"
                >
                  {relatedNote.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className="text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-400">
              Recommendations
            </span>
          </div>
          <ul className="text-sm space-y-1 text-amber-700 dark:text-gray-300">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NoteInsights; 