import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { sweetsAPI } from '../services/api';

const Cart: React.FC = () => {
  const { cartItems, removeFromCart, updateCartItem, clearCart, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const formatWeight = (weight: number): string => {
    if (weight >= 1) {
      return `${weight} kg`;
    } else {
      return `${weight * 1000}g`;
    }
  };

  const handlePurchase = async () => {
    if (cartItems.length === 0) {
      setError('Cart is empty');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Purchase each item in the cart
      for (const item of cartItems) {
        const totalWeight = item.weight * item.quantity;
        await sweetsAPI.purchase(item.sweet.id, totalWeight);
      }

      setMessage('All items purchased successfully!');
      clearCart();
      setTimeout(() => {
        setMessage('');
        navigate('/purchases');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Purchase failed';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ background: '#ffffff', minHeight: '100vh', padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            marginBottom: '40px', 
            color: '#1f2937',
            letterSpacing: '-0.5px'
          }}>
            Shopping Cart
          </h1>
          <div style={{
            background: '#fff',
            padding: '100px 40px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🛒</div>
            <p style={{ 
              fontSize: '22px', 
              color: '#1f2937', 
              fontWeight: '600',
              marginBottom: '12px' 
            }}>
              Your cart is empty
            </p>
            <p style={{ 
              fontSize: '16px', 
              color: '#6b7280', 
              marginBottom: '32px',
              maxWidth: '400px',
              margin: '0 auto 32px'
            }}>
              Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '14px 32px',
                background: '#1a1a2e',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
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
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '700', 
          marginBottom: '40px', 
          color: '#1f2937',
          letterSpacing: '-0.5px'
        }}>
          Shopping Cart
        </h1>

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '32px' }}>
          {/* Cart Items */}
          <div>
            {cartItems.map((item) => (
              <div
                key={item.sweet.id}
                style={{
                  background: '#fff',
                  padding: '24px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  gap: '24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: '#f9fafb',
                  flexShrink: 0,
                  border: '1px solid #e5e7eb'
                }}>
                  <img
                    src={item.sweet.image_url || 'https://images.unsplash.com/photo-1606312619070-d48b4bc98fb0?w=400&h=300&fit=crop'}
                    alt={item.sweet.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    marginBottom: '8px',
                    color: '#1f2937'
                  }}>
                    {item.sweet.name}
                  </h3>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: '#f3f4f6',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#6b7280',
                    fontWeight: '500',
                    marginBottom: '16px'
                  }}>
                    {item.sweet.category}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    marginBottom: '16px', 
                    fontSize: '14px',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ color: '#6b7280' }}>
                      <span style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Weight</span>
                      <strong style={{ color: '#1f2937' }}>{formatWeight(item.weight)}</strong>
                    </div>
                    <div style={{ color: '#6b7280' }}>
                      <span style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Quantity</span>
                      <strong style={{ color: '#1f2937' }}>{item.quantity}</strong>
                    </div>
                    <div style={{ color: '#6b7280' }}>
                      <span style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Price</span>
                      <strong style={{ color: '#1f2937' }}>₹{item.sweet.price.toFixed(2)}/kg</strong>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a2e' }}>
                        ₹{item.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.sweet.id)}
                      style={{
                        padding: '10px 20px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fecaca';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div style={{
              background: '#fff',
              padding: '32px',
              borderRadius: '16px',
              position: 'sticky',
              top: '20px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '24px',
                color: '#1f2937',
                letterSpacing: '-0.5px'
              }}>
                Order Summary
              </h2>
              
              <div style={{
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '16px',
                marginBottom: '16px'
              }}>
                {cartItems.map((item) => (
                  <div
                    key={item.sweet.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      fontSize: '14px'
                    }}
                  >
                    <span style={{ color: '#6b7280' }}>
                      {item.sweet.name} ({item.quantity} × {formatWeight(item.weight)})
                    </span>
                    <span style={{ fontWeight: '500' }}>₹{item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingTop: '20px',
                borderTop: '2px solid #e5e7eb'
              }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280' }}>
                  Total Amount
                </span>
                <span style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a2e' }}>
                  ₹{getCartTotal().toFixed(2)}
                </span>
              </div>

              <button
                onClick={handlePurchase}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: loading ? '#9ca3af' : '#1a1a2e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '12px',
                  transition: 'all 0.3s ease',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(26, 26, 46, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#0f0f1e';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 26, 46, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.background = '#1a1a2e';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 26, 46, 0.2)';
                  }
                }}
              >
                {loading ? 'Processing...' : 'Complete Purchase'}
              </button>

              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#fff',
                  color: '#1a1a2e',
                  border: '2px solid #1a1a2e',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

