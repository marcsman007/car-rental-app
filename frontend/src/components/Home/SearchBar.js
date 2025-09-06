import React, { useState } from "react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value); // call parent function
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <input
        type="text"
        placeholder="Search by make or model..."
        value={query}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
      />
    </div>
  );
}

export default SearchBar;
