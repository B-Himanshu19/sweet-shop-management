import React, { useState, useEffect } from 'react';
import { Sweet, sweetsAPI } from '../services/api';
import SweetForm from './SweetForm';

const AdminPanel: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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

  // Filter sweets based on search and category
  useEffect(() => {
    let filtered = sweets;

    if (searchTerm) {
      filtered = filtered.filter(sweet =>
        sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sweet.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(sweet => sweet.category === selectedCategory);
    }

    setFilteredSweets(filtered);
  }, [searchTerm, selectedCategory, sweets]);

  // Get unique categories
  const categories = Array.from(new Set(sweets.map(sweet => sweet.category))).sort();

  const handleCreate = async (sweetData: { name: string; category: string; price: number; quantity?: number; image_url?: string; description?: string }) => {
    try {
      await sweetsAPI.create(sweetData);
      setMessage('Sweet created successfully!');
      setTimeout(() => setMessage(''), 3000);
      setShowForm(false);
      await loadSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create sweet');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdate = async (id: number, sweetData: Partial<Sweet>) => {
    try {
      await sweetsAPI.update(id, sweetData);
      setMessage('Sweet updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      setEditingSweet(null);
      setShowForm(false);
      await loadSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update sweet');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) {
      return;
    }

    try {
      await sweetsAPI.delete(id);
      setMessage('Sweet deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      await loadSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete sweet');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRestock = async (id: number, quantity: number) => {
    try {
      await sweetsAPI.restock(id, quantity);
      setMessage('Sweet restocked successfully!');
      setTimeout(() => setMessage(''), 3000);
      await loadSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to restock sweet');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getDefaultImage = (category: string) => {
    const categoryImages: { [key: string]: string } = {
      'Chocolate': 'https://images.unsplash.com/photo-1606312619070-d48b4bc98fb0?w=400&h=300&fit=crop',
      'Gummies': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'Hard Candy': 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=300&fit=crop',
      'Caramel': 'https://images.unsplash.com/photo-1606312619070-d48b4bc98fb0?w=400&h=300&fit=crop',
      'Soft Candy': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    };
    return categoryImages[category] || 'https://images.unsplash.com/photo-1606312619070-d48b4bc98fb0?w=400&h=300&fit=crop';
  };

  if (loading) {
    return (
      <div style={{ background: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '20px', color: '#6b7280', fontSize: '16px' }}>Loading sweets...</p>
        </div>
      </div>
    );
  }

  const totalStock = sweets.reduce((sum, sweet) => sum + sweet.quantity, 0);
  const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0);

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '60px 20px' }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              Admin Panel
            </h1>
            <p style={{ color: '#6b7280', fontSize: '15px' }}>
              Manage your sweet inventory and track sales
            </p>
          </div>
          <button
            onClick={() => { setEditingSweet(null); setShowForm(true); }}
            style={{
              padding: '14px 28px',
              background: '#1a1a2e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(26, 26, 46, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#0f0f1e';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 26, 46, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1a1a2e';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 26, 46, 0.2)';
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span> Add New Sweet
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Total Products</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>{sweets.length}</div>
          </div>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Total Stock</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>{totalStock.toFixed(1)} kg</div>
          </div>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Inventory Value</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>₹{totalValue.toFixed(0)}</div>
          </div>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>Categories</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937' }}>{categories.length}</div>
          </div>
        </div>

        {/* Alerts */}
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

        {/* Search and Filter */}
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 15px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {(searchTerm || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
              }}
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <SweetForm
            sweet={editingSweet}
            onSubmit={editingSweet ? (data) => handleUpdate(editingSweet.id, data) : handleCreate}
            onCancel={() => { setShowForm(false); setEditingSweet(null); }}
          />
        )}

        {/* Sweets Grid */}
        {filteredSweets.length === 0 ? (
          <div style={{
            background: '#fff',
            padding: '60px 20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              {searchTerm || selectedCategory ? 'No sweets found matching your filters.' : 'No sweets found. Add your first sweet!'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {filteredSweets.map((sweet) => {
              const imageUrl = sweet.image_url || getDefaultImage(sweet.category);
              return (
                <div
                  key={sweet.id}
                  style={{
                    background: '#fff',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Image */}
                  <div style={{
                    width: '100%',
                    height: '180px',
                    overflow: 'hidden',
                    background: '#f9fafb',
                    position: 'relative'
                  }}>
                    <img
                      src={imageUrl}
                      alt={sweet.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: sweet.quantity > 0 ? '#10b981' : '#ef4444',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {sweet.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '6px',
                      lineHeight: '1.3'
                    }}>
                      {sweet.name}
                    </h3>
                    <div style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontWeight: '500'
                    }}>
                      {sweet.category}
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #e5e7eb'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Price</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                          ₹{sweet.price.toFixed(0)}/kg
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Stock</div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: sweet.quantity > 0 ? '#10b981' : '#ef4444'
                        }}>
                          {sweet.quantity.toFixed(1)} kg
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      marginTop: 'auto'
                    }}>
                      <button
                        onClick={() => {
                          setEditingSweet(sweet);
                          setShowForm(true);
                        }}
                        style={{
                          padding: '10px',
                          background: '#fff',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          color: '#1f2937',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f9fafb';
                          e.currentTarget.style.borderColor = '#9ca3af';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fff';
                          e.currentTarget.style.borderColor = '#d1d5db';
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          const quantity = prompt('Enter quantity to restock (in kg):');
                          if (quantity && !isNaN(parseFloat(quantity))) {
                            handleRestock(sweet.id, parseFloat(quantity));
                          }
                        }}
                        style={{
                          padding: '10px',
                          background: '#f0f9ff',
                          border: '1px solid #3b82f6',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          color: '#3b82f6',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#dbeafe';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#f0f9ff';
                        }}
                      >
                        Restock
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(sweet.id)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#fee2e2',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        color: '#991b1b',
                        marginTop: '8px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fecaca';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

