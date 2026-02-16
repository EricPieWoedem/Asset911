import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from './ui/input';

const AutoCompleteInput = ({ field, type, placeholder, disabled, options }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef();

  const suggestions = useMemo(() => {
    if (field.value.length) {
      return options.filter(option =>
        option.toLowerCase().includes(field.value.toLowerCase())
      );
    } else {
      return options;
    }
  }, [options, field.value]);

  useEffect(() => {
    const handleClickOutside = event => {
      const inputElement = inputRef.current;
      if (inputElement && !inputElement.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className='relative'>
      <Input
        {...field}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete='off'
        ref={inputRef}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 5000)}
      />
      {showSuggestions && (
        <ul
          className='absolute z-50 w-full border-[1px] py-2 my-2 bg-white rounded-md shadow-md'
          id='suggestion-box'
        >
          {suggestions?.map(suggestion => (
            <li
              key={suggestion}
              onClick={() => {
                field.onChange(suggestion);
                setTimeout(() => setShowSuggestions(false), 10000);
              }}
              className='px-5 py-1 cursor-pointer hover:bg-blue-50'
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoCompleteInput;
