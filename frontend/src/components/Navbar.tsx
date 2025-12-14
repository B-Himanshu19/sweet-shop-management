import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartItemCount } = useCart();
  const location = useLocation();
  const cartItemCount = getCartItemCount();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <Link to="/" style={{ 
            textDecoration: 'none', 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#1a1a2e',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            🍬 Sweet Shop
          </Link>
          
          {/* Navigation Links */}
          {!isAuthPage && (
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
              <Link to="/" style={{ 
                textDecoration: 'none',
                color: isActive('/') ? '#8B4513' : '#4b5563',
                fontSize: '14px',
                fontWeight: isActive('/') ? '600' : '400',
                cursor: 'pointer'
              }}>
                HOME
              </Link>
              <Link to="/sweets" style={{ 
                textDecoration: 'none',
                color: isActive('/sweets') ? '#8B4513' : '#4b5563',
                fontSize: '14px',
                fontWeight: isActive('/sweets') ? '600' : '400',
                cursor: 'pointer'
              }}>
                SWEETS
              </Link>
              {user && (
                <Link to="/purchases" style={{ 
                  textDecoration: 'none',
                  color: isActive('/purchases') ? '#8B4513' : '#4b5563',
                  fontSize: '14px',
                  fontWeight: isActive('/purchases') ? '600' : '400',
                  cursor: 'pointer'
                }}>
                  PURCHASE HISTORY
                </Link>
              )}
            </div>
          )}
        </div>
        
        {!isAuthPage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {user && (
              <Link
                to="/cart"
                style={{
                  position: 'relative',
                  textDecoration: 'none',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ fontSize: '24px' }}>🛒</div>
                {cartItemCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: '#ef4444',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>
            )}
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  {user.username}
                </span>
                {isAdmin() && (
                  <Link 
                    to="/admin" 
                    style={{ 
                      textDecoration: 'none',
                      color: '#6b7280',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Admin
                  </Link>
                )}
                <button 
                  onClick={logout} 
                  style={{
                    padding: '8px 16px',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '15px' }}>
                <Link 
                  to="/login" 
                  style={{ 
                    textDecoration: 'none',
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  style={{ 
                    textDecoration: 'none',
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

