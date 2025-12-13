import React, { useState, useEffect } from 'react';
import { Sweet } from '../services/api';

interface SearchAndFiltersProps {
  onSearch: (params: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
  sweets: Sweet[];
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({ onSearch, sweets }) => {
  const [searchName, setSearchName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const categories = Array.from(new Set(sweets.map(s => s.category)));

  useEffect(() => {
    const params: any = {};
    if (searchName) params.name = searchName;
    if (selectedCategory) params.category = selectedCategory;
    if (minPrice) params.minPrice = parseFloat(minPrice);
    if (maxPrice) params.maxPrice = parseFloat(maxPrice);

    onSearch(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchName, selectedCategory, minPrice, maxPrice]);

  const handleClear = () => {
    setSearchName('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    onSearch({});
  };

  return (
    <div className="card">
      <h3>Search & Filter</h3>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>
      <div className="filters">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          min="0"
          step="0.01"
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          min="0"
          step="0.01"
        />
        <button className="btn btn-secondary" onClick={handleClear}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default SearchAndFilters;

