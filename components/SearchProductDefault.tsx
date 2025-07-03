'use client';
import { useState } from 'react';

export default function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const res = await fetch(`/api/search?query=${query}`);
    const data = await res.json();
    setResults(data);
  };

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Пошук товарів..."
        className="border p-2 rounded w-full"
      />
      {results.length > 0 && (
        <div className="absolute bg-white border rounded mt-2 shadow z-10 w-full">
          {results.map((product) => (
            <div key={product._id} className="p-2 hover:bg-gray-100">
              {product.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
