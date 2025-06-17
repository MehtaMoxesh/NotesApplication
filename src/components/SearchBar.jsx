import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange, isDark }) => {
  return (
    <div className="relative">
      <Search size={16} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isDark 
            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
            : 'border-gray-300 bg-white text-gray-900'
        }`}
      />
    </div>
  );
};

export default SearchBar;