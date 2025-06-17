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
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={20} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
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
    <div className={`p-4 rounded-lg border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <Brain size={20} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
        <h3 className={`text-lg font-semibold ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          AI Insights
        </h3>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div className={`p-3 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-purple-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
            <span className={`text-sm font-medium ${
              isDark ? 'text-purple-400' : 'text-purple-800'
            }`}>
              Summary
            </span>
          </div>
          <p className={`text-sm ${
            isDark ? 'text-gray-300' : 'text-purple-700'
          }`}>
            {insights.summary}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`p-3 rounded-lg text-center ${
            isDark ? 'bg-gray-700' : 'bg-blue-50'
          }`}>
            <div className={`text-lg font-bold ${
              isDark ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {insights.wordCount}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-blue-600'
            }`}>
              Words
            </div>
          </div>
          
          <div className={`p-3 rounded-lg text-center ${
            isDark ? 'bg-gray-700' : 'bg-green-50'
          }`}>
            <div className={`text-lg font-bold ${
              isDark ? 'text-green-400' : 'text-green-600'
            }`}>
              {insights.charCount}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-green-600'
            }`}>
              Characters
            </div>
          </div>
          
          <div className={`p-3 rounded-lg text-center ${
            isDark ? 'bg-gray-700' : 'bg-yellow-50'
          }`}>
            <div className={`text-lg font-bold ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`}>
              {insights.sentences}
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-yellow-600'
            }`}>
              Sentences
            </div>
          </div>
          
          <div className={`p-3 rounded-lg text-center ${
            isDark ? 'bg-gray-700' : 'bg-orange-50'
          }`}>
            <div className={`text-lg font-bold ${
              isDark ? 'text-orange-400' : 'text-orange-600'
            }`}>
              {insights.readingTime}m
            </div>
            <div className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-orange-600'
            }`}>
              Read Time
            </div>
          </div>
        </div>

        {/* Key Phrases */}
        {insights.keyPhrases.length > 0 && (
          <div className={`p-3 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-indigo-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Hash size={16} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-indigo-400' : 'text-indigo-800'
              }`}>
                Key Phrases
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {insights.keyPhrases.map((phrase, index) => (
                <span
                  key={index}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isDark 
                      ? 'bg-indigo-600 text-indigo-100' 
                      : 'bg-indigo-100 text-indigo-800'
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
          <div className={`p-3 rounded-lg ${
            isDark ? 'bg-gray-700' : 'bg-teal-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Link size={16} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
              <span className={`text-sm font-medium ${
                isDark ? 'text-teal-400' : 'text-teal-800'
              }`}>
                Related Notes
              </span>
            </div>
            <div className="space-y-1">
              {insights.relatedNotes.map((relatedNote) => (
                <div
                  key={relatedNote.id}
                  className={`text-sm p-2 rounded ${
                    isDark ? 'bg-gray-600 text-gray-300' : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  {relatedNote.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className={`p-3 rounded-lg ${
          isDark ? 'bg-gray-700' : 'bg-amber-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={16} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <span className={`text-sm font-medium ${
              isDark ? 'text-amber-400' : 'text-amber-800'
            }`}>
              Recommendations
            </span>
          </div>
          <ul className={`text-sm space-y-1 ${
            isDark ? 'text-gray-300' : 'text-amber-700'
          }`}>
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