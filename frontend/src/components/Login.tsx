import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#ffffff'
    }}>
      {/* Left Side - Branding */}
      <div style={{
        flex: '1',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '500px' }}>
          <div style={{
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#fff',
                letterSpacing: '2px',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}>
                SS
              </div>
            </div>
          </div>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '700',
            marginBottom: '16px',
            lineHeight: '1.2',
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)'
          }}>
            Sweet Shop
          </h1>
          <p style={{
            fontSize: '18px',
            opacity: 0.9,
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            Your one-stop destination for premium quality sweets. Experience authentic flavors delivered to your doorstep.
          </p>
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '40px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>1000+</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Happy Customers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>50+</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Sweet Varieties</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>24/7</div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: '#fafafa'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px'
        }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1a1a2e',
              marginBottom: '8px'
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#6b7280'
            }}>
              Sign in to your account to continue shopping
            </p>
          </div>

          {error && (
            <div style={{
              padding: '14px 16px',
              background: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px',
              border: '1px solid #fecaca',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Username or Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: '#fff'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1a1a2e';
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 0 0 3px rgba(26, 26, 46, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your username or email"
                />
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#9ca3af'
                }}>
                  👤
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '15px',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: '#fff'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#1a1a2e';
                    e.target.style.outline = 'none';
                    e.target.style.boxShadow = '0 0 0 3px rgba(26, 26, 46, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Enter your password"
                />
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#9ca3af'
                }}>
                  🔒
                </span>
              </div>
            </div>

            <button
              type="submit"
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
                transition: 'all 0.3s ease',
                marginBottom: '24px',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(26, 26, 46, 0.15)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#0f0f1e';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(26, 26, 46, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = '#1a1a2e';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 26, 46, 0.15)';
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            paddingTop: '24px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '0'
            }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#1a1a2e',
                  textDecoration: 'none',
                  fontWeight: '600',
                  borderBottom: '2px solid transparent',
                  transition: 'border-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderBottomColor = '#1a1a2e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }}
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

