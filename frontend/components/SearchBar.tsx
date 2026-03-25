import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './Icons';
import { helpCenterService } from '../services/helpCenterService';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  variant?: 'hero' | 'header';
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  className = '', 
  placeholder = "Tìm kiếm bài viết, hướng dẫn...",
  variant = 'hero'
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length > 2) {
        try {
          const results = await helpCenterService.getSearchSuggestions(query);
          setSuggestions(results);
          setShowSuggestions(true);
        } catch (error) {
          console.error("Failed to fetch suggestions", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
  };

  const isHero = variant === 'hero';

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 transition-all border-2 border-transparent outline-none focus:border-brand-500 rounded-lg shadow-sm
            ${isHero 
              ? 'py-4 text-lg text-slate-700 placeholder:text-slate-400 bg-white' 
              : 'py-2 text-sm bg-slate-100 focus:bg-white border-slate-200'
            }`}
        />
        <Icons.Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 ${isHero ? 'w-6 h-6' : 'w-4 h-4'}`} />
        {isHero && (
           <button 
             type="submit"
             className="absolute right-2 top-2 bottom-2 bg-brand-600 text-white px-6 rounded-md font-medium hover:bg-brand-700 transition-colors"
           >
             Tìm kiếm
           </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50">
          <div className="p-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Gợi ý</div>
          <ul>
            {suggestions.map((item, index) => (
              <li 
                key={index}
                onClick={() => handleSuggestionClick(item)}
                className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center gap-3 text-slate-700 transition-colors"
              >
                <Icons.Search className="w-4 h-4 text-slate-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};