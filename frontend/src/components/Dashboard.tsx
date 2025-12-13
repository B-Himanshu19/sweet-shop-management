import React, { useState, useEffect } from 'react';
import { Sweet, sweetsAPI } from '../services/api';
import SweetCard from './SweetCard';
import SearchAndFilters from './SearchAndFilters';
import ProductDetailModal from './ProductDetailModal';

const Dashboard: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [showProductDetail, setShowProductDetail] = useState<Sweet | null>(null);

  useEffect(() => {
    loadSweets();
  }, []);

  const loadSweets = async () => {
    try {
      setLoading(true);
      const data = await sweetsAPI.getAll();
      setSweets(data);
      setFilteredSweets(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load sweets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (id: number, weight: number): Promise<void> => {
    try {
      // Find the sweet to calculate total
      const sweet = sweets.find(s => s.id === id);
      if (!sweet) {
        throw new Error('Sweet not found');
      }
      
      const totalAmount = sweet.price * weight;
      
      // Format weight for display
      const formatWeight = (w: number): string => {
        if (w >= 1) return `${w} kg`;
        return `${w * 1000}g`;
      };
      
      await sweetsAPI.purchase(id, weight);
      setMessage(`Purchase successful! ${formatWeight(weight)} purchased for ₹${totalAmount.toFixed(2)}.`);
      setTimeout(() => setMessage(''), 3000);
      await loadSweets();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Purchase failed';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
      throw err; // Re-throw so ProductDetailModal can handle it
    }
  };

  const handleSearch = async (searchParams: {
    name?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    try {
      if (Object.keys(searchParams).length === 0) {
        setFilteredSweets(sweets);
        return;
      }

      const results = await sweetsAPI.search(searchParams);
      setFilteredSweets(results);
    } catch (err: any) {
      setError('Search failed');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '20px', color: '#6b7280' }}>Loading sweets...</p>
        </div>
      </div>
    );
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    let sorted = [...filteredSweets];
    switch (e.target.value) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // featured - keep original order
        break;
    }
    setFilteredSweets(sorted);
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '60px 20px 20px'
      }}>
        {/* Page Header */}
        <div style={{
          marginBottom: '40px'
        }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '700',
            color: '#1f2937',
            marginBottom: '12px',
            letterSpacing: '-1px'
          }}>
            All Sweets
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Browse our complete collection of premium sweets
          </p>
        </div>

        {/* Sort Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '40px',
          gap: '12px'
        }}>
          <label style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            style={{
              padding: '12px 20px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '15px',
              background: '#fff',
              color: '#1f2937',
              cursor: 'pointer',
              minWidth: '180px',
              fontWeight: '500'
            }}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {message && (
          <div style={{
            padding: '16px 24px',
            background: '#10b981',
            color: '#fff',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '15px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            ✓ {message}
          </div>
        )}
        {error && (
          <div style={{
            padding: '16px 24px',
            background: '#ef4444',
            color: '#fff',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '15px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}>
            ⚠ {error}
          </div>
        )}
        
        <div style={{ marginBottom: '40px' }}>
          <SearchAndFilters onSearch={handleSearch} sweets={sweets} />
        </div>

        {filteredSweets.length === 0 ? (
          <div style={{
            padding: '80px 20px',
            textAlign: 'center',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍬</div>
            <p style={{ fontSize: '20px', color: '#1f2937', fontWeight: '600', marginBottom: '8px' }}>
              No sweets found
            </p>
            <p style={{ fontSize: '15px', color: '#6b7280' }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1f2937'
              }}>
                {filteredSweets.length} {filteredSweets.length === 1 ? 'Product' : 'Products'}
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '24px'
            }}>
              {filteredSweets.map((sweet) => (
                <SweetCard 
                  key={sweet.id} 
                  sweet={sweet} 
                  onPurchase={handlePurchase}
                  onView={() => setShowProductDetail(sweet)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {showProductDetail && (
        <ProductDetailModal
          sweet={showProductDetail}
          onClose={() => setShowProductDetail(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;

