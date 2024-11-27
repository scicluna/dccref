"use client"
import Link from 'next/link';
import { useState, useCallback } from 'react';
import { debounce } from '@/utils/debounce';
import { kebabToTitle } from '@/utils/kebabtotitle';


export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  interface Result {
    table: string;
  }

  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchResults(query: string){
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      } else {
        console.error('Failed to fetch search results');
        setResults([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a debounced version of fetchResults
  const debouncedFetchResults = useCallback(debounce(fetchResults, 300), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedFetchResults(query); // Trigger the debounced API call
  };

  return (
      <>
      <div className="relative w-full max-w-md text-gray-700">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full px-4 py-2  bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
        />
        <ul className="mt-4 w-full max-w-md">
        {isLoading ? (
          <p className="mt-2 text-gray-500 text-sm">Loading...</p>
        ) : (
          <ul className="mt-2 w-full bg-white border border-gray-300 rounded-lg shadow">
            {results.map((result, index) => (
              <li key={index} className="hover:bg-gray-100">
                <Link
                  href={`/tables/${result.table}`}
                  className="block px-4 py-2"
                >
                  <p className="font-semibold">{kebabToTitle(result.table)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </ul>
      </div>
      </>
  );
}
