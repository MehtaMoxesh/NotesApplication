import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
        isDark
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400 hover:text-yellow-300'
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-800'
      }`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;