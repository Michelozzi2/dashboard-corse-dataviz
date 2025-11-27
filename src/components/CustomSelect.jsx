import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ value, onChange, options, label, onReset, maxVisibleItems = 5 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="bg-dark-800 p-2 rounded-lg border border-dark-700 flex items-center gap-3">
      <label className="text-sm text-slate-400">{label}</label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-dark-800 text-slate-200 px-3 py-1 border border-dark-700 rounded-md hover:border-slate-500 transition focus:outline-none focus:ring-2 focus:ring-opacity-40 min-w-[120px] text-left flex items-center justify-between"
        >
          <span>{value}</span>
          <svg className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div 
            className="absolute top-full left-0 mt-1 bg-dark-800 border border-dark-700 rounded-md shadow-xl z-50 overflow-y-auto"
            style={{ maxHeight: `${maxVisibleItems * 2.5}rem`, minWidth: '120px' }}
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700 transition ${
                  value === option ? 'bg-slate-700' : ''
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      {onReset && (
        <button onClick={onReset} className="ml-2 text-xs text-slate-400 hover:text-white">
          Réinitialiser
        </button>
      )}
    </div>
  );
};

export default CustomSelect;
