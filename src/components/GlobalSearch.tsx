import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, FileText, Target, CheckCircle, Image, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { searchService, SearchResult } from '@/services/searchService';
import { useDebounce } from '@/hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length > 1) {
      const fetchSuggestions = async () => {
        try {
          const sug = await searchService.getSuggestions(debouncedQuery, 5);
          setSuggestions(sug);
          setShowSuggestions(sug.length > 0);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      };

      fetchSuggestions();
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [debouncedQuery]);

  // Fetch search results
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchService.searchAll({
        query: searchQuery,
        limit: 10
      });
      
      if (response.success) {
        setResults(response.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    setQuery(value);
    
    if (value.trim()) {
      performSearch(value);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    performSearch(suggestion);
    setShowSuggestions(false);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    // Navigate to the appropriate page based on result type
    switch (result.type) {
      case 'post':
        navigate(`/posts/edit/${result.id}`);
        break;
      case 'campaign':
        navigate(`/goals`);
        break;
      case 'task':
        navigate(`/tasks`);
        break;
      case 'goal':
        navigate(`/goals`);
        break;
      case 'asset':
        navigate(`/assets`);
        break;
      case 'ambassador':
        navigate(`/ambassadors`);
        break;
      case 'user':
        navigate(`/settings`);
        break;
      default:
        break;
    }
    
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  // Get icon for result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'campaign':
        return <Target className="w-4 h-4 text-purple-500" />;
      case 'task':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'goal':
        return <Target className="w-4 h-4 text-teal-500" />;
      case 'asset':
        return <Image className="w-4 h-4 text-orange-500" />;
      case 'ambassador':
        return <Users className="w-4 h-4 text-pink-500" />;
      case 'user':
        return <User className="w-4 h-4 text-gray-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return 'Post';
      case 'campaign':
        return 'Campaign';
      case 'task':
        return 'Task';
      case 'goal':
        return 'Goal';
      case 'asset':
        return 'Asset';
      case 'ambassador':
        return 'Ambassador';
      case 'user':
        return 'User';
      default:
        return 'Item';
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search everything..."
          className="pl-10 pr-10 w-64 focus:w-80 transition-all duration-300"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim()) {
              setIsOpen(true);
            }
          }}
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              setShowSuggestions(false);
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg">
          <div className="py-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted cursor-pointer"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                {suggestion}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Search results dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 shadow-lg max-h-96 overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-2 border-b text-sm text-muted-foreground">
                {results.length} results found
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="mr-3">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {result.description}
                        </p>
                      )}
                      <div className="flex items-center mt-1">
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {getTypeLabel(result.type)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(result.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t text-center">
                <Button variant="ghost" size="sm" className="text-xs">
                  View all results
                </Button>
              </div>
            </>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No results found for "{query}"</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;