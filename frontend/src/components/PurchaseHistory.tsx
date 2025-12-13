import React, { useState, useEffect } from 'react';
import { Purchase, purchasesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PurchaseHistory: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = isAdmin() 
        ? await purchasesAPI.getAll() 
        : await purchasesAPI.getHistory();
      setPurchases(data);
      setFilteredPurchases(data);
      setError('');
    } catch (err: any) {
      setError('Failed to load purchase history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter purchases based on search and category
  useEffect(() => {
    let filtered = purchases;

    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.sweet_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (isAdmin() && purchase.username && purchase.username.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(purchase => purchase.category === selectedCategory);
    }

    setFilteredPurchases(filtered);
  }, [searchTerm, selectedCategory, purchases]);

  // Get unique categories
  const categories = Array.from(new Set(purchases.map(p => p.category))).sort();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatWeight = (weight: number): string => {
    if (weight >= 1) {
      return `${weight.toFixed(2)} kg`;
    } else {
      return `${(weight * 1000).toFixed(0)}g`;
    }
  };

  const calculateTotal = () => {
    return filteredPurchases.reduce((sum, purchase) => sum + purchase.total_amount, 0);
  };

  const calculateTotalWeight = () => {
    return filteredPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
  };

  if (loading) {
    return (
      <div style={{ background: '#f9fafb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '20px', color: '#6b7280', fontSize: '16px' }}>Loading purchase history...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px'
          }}>
            {isAdmin() ? 'Order List' : 'My Purchase History'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {isAdmin() ? 'View all orders made by all users' : 'View your purchase history and order details'}
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 20px',
            background: '#ef4444',
            color: '#fff',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {purchases.length === 0 ? (
          <div style={{
            background: '#fff',
            padding: '60px 20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>No purchases found</p>
            <p style={{ fontSize: '14px', color: '#9ca3af' }}>
              {isAdmin() ? 'No purchases have been made yet.' : 'Start shopping to see your purchase history here!'}
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Purchases</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                  {filteredPurchases.length}
                </div>
                {purchases.length !== filteredPurchases.length && (
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                    of {purchases.length} total
                  </div>
                )}
              </div>
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Amount</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                  ₹{calculateTotal().toFixed(2)}
                </div>
              </div>
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Weight</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                  {formatWeight(calculateTotalWeight())}
                </div>
              </div>
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Average Order</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                  ₹{filteredPurchases.length > 0 ? (calculateTotal() / filteredPurchases.length).toFixed(2) : '0.00'}
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            {purchases.length > 0 && (
              <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '30px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <input
                    type="text"
                    placeholder={isAdmin() ? "Search by product, category, or username..." : "Search by name or category..."}
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
            )}

            {/* Purchases Table/Cards */}
            {filteredPurchases.length === 0 ? (
              <div style={{
                background: '#fff',
                padding: '60px 20px',
                borderRadius: '8px',
                textAlign: 'center',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>
                  No purchases found matching your filters.
                </p>
              </div>
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                {/* Desktop Table View */}
                <div style={{ overflowX: 'auto', display: 'block' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{
                        background: '#f9fafb',
                        borderBottom: '2px solid #e5e7eb'
                      }}>
                        <th style={{
                          padding: '16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Date & Time
                        </th>
                        {isAdmin() && (
                          <th style={{
                            padding: '16px',
                            textAlign: 'left',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            User
                          </th>
                        )}
                        <th style={{
                          padding: '16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Product
                        </th>
                        <th style={{
                          padding: '16px',
                          textAlign: 'left',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Category
                        </th>
                        <th style={{
                          padding: '16px',
                          textAlign: 'right',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Price/kg
                        </th>
                        <th style={{
                          padding: '16px',
                          textAlign: 'right',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Weight
                        </th>
                        <th style={{
                          padding: '16px',
                          textAlign: 'right',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#6b7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPurchases.map((purchase, index) => (
                        <tr
                          key={purchase.id}
                          style={{
                            borderBottom: index < filteredPurchases.length - 1 ? '1px solid #e5e7eb' : 'none',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f9fafb';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fff';
                          }}
                        >
                          <td style={{
                            padding: '16px',
                            fontSize: '14px',
                            color: '#6b7280'
                          }}>
                            {formatDate(purchase.purchased_at)}
                          </td>
                          {isAdmin() && (
                            <td style={{
                              padding: '16px',
                              fontSize: '14px',
                              color: '#6b7280'
                            }}>
                              <div style={{ marginBottom: '4px', fontWeight: '600', color: '#1f2937' }}>
                                {purchase.username || 'Unknown'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                ID: {purchase.user_id}
                              </div>
                            </td>
                          )}
                          <td style={{
                            padding: '16px',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1f2937'
                          }}>
                            {purchase.sweet_name}
                          </td>
                          <td style={{
                            padding: '16px',
                            fontSize: '14px',
                            color: '#6b7280'
                          }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              background: '#f3f4f6',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: '#6b7280'
                            }}>
                              {purchase.category}
                            </span>
                          </td>
                          <td style={{
                            padding: '16px',
                            textAlign: 'right',
                            fontSize: '14px',
                            color: '#6b7280'
                          }}>
                            ₹{purchase.price.toFixed(2)}
                          </td>
                          <td style={{
                            padding: '16px',
                            textAlign: 'right',
                            fontSize: '14px',
                            color: '#6b7280'
                          }}>
                            {formatWeight(purchase.quantity)}
                          </td>
                          <td style={{
                            padding: '16px',
                            textAlign: 'right',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: '#10b981'
                          }}>
                            ₹{purchase.total_amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View (hidden on desktop) */}
                <div style={{
                  display: 'none'
                }}
                className="mobile-purchases"
                >
                  {filteredPurchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '12px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '4px'
                          }}>
                            {purchase.sweet_name}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            marginBottom: '8px'
                          }}>
                            {formatDate(purchase.purchased_at)}
                          </div>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            background: '#f3f4f6',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#6b7280'
                          }}>
                            {purchase.category}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#10b981'
                        }}>
                          ₹{purchase.total_amount.toFixed(2)}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        color: '#6b7280',
                        paddingTop: '12px',
                        borderTop: '1px solid #f3f4f6'
                      }}>
                        <span>Price: ₹{purchase.price.toFixed(2)}/kg</span>
                        <span>Weight: {formatWeight(purchase.quantity)}</span>
                        {isAdmin() && (
                          <span>
                            {purchase.username || 'Unknown'} (ID: {purchase.user_id})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistory;

