import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange, isDark }) => {
  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="relative">
      <div className="relative flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
        <Search 
          size={16} 
          className="absolute left-3 text-gray-500 dark:text-gray-400" 
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-10 py-2 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-2 p-1 rounded-full hover:bg-opacity-20 transition-colors text-gray-500 dark:text-gray-400 hover:bg-gray-500 dark:hover:bg-gray-400"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;