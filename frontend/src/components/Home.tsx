import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sweet, sweetsAPI } from '../services/api';
import ProductDetailModal from './ProductDetailModal';

const Home: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [featuredSweets, setFeaturedSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductDetail, setShowProductDetail] = useState<Sweet | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSweets();
  }, []);

  // Slideshow auto-rotation
  useEffect(() => {
    if (featuredSweets.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % featuredSweets.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [featuredSweets.length, isPaused]);

  const loadSweets = async () => {
    try {
      setLoading(true);
      const data = await sweetsAPI.getAll();
      setSweets(data);
      setFeaturedSweets(data.slice(0, 5));
    } catch (err: any) {
      console.error('Failed to load sweets:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#ffffff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '20px', color: '#6b7280' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const currentSweet = featuredSweets[currentSlideIndex];

  return (
    <div style={{ background: '#f9f9f9', minHeight: '100vh' }}>
      {/* Hero Banner - Product Images & Text */}
      <div style={{
        position: 'relative',
        height: '280px',
        background: 'linear-gradient(135deg, #7cb342 0%, #558b2f 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '40px 60px',
        overflow: 'hidden'
      }}>
        {/* Left Side: 3 Rotating Circular Images */}
        <div style={{
          display: 'flex',
          gap: '3px',
          flex: 0.45,
          alignItems: 'center',
          justifyContent: 'flex-start'
        }}>
          {featuredSweets.slice(currentSlideIndex, currentSlideIndex + 3).map((sweet, index) => (
            <div
              key={index}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: '#fff',
                border: '4px solid #fff',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.5s ease-in-out'
              }}
            >
              <img
                src={sweet.image_url || 'https://via.placeholder.com/100x100'}
                alt={sweet.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          ))}
        </div>

        {/* Right Side: Text Content */}
        <div style={{
          flex: 0.55,
          paddingLeft: '60px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#fff',
            margin: '0 0 20px 0',
            lineHeight: '1.2'
          }}>
            AUTHENTIC INDIAN SWEETS
          </h1>
          <p style={{
            fontSize: '24px',
            color: '#fff',
            margin: '0 0 30px 0',
            fontWeight: '500'
          }}>
            100% Organic and pure
          </p>

          {/* Controls at Bottom */}
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Pause/Play Button */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                width: '44px',
                height: '44px',
                background: '#fff',
                border: '2px solid #ddd',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isPaused ? '▶' : '⏸'}
            </button>

            {/* View All Products Link */}
            <span style={{
              color: '#fff',
              fontSize: '16px',
              fontWeight: '600',
              marginLeft: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={() => navigate('/sweets')}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
            >
              View all products →
            </span>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '80px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '50px',
          alignItems: 'start'
        }}>
          {/* Left: Featured Products Banner */}
          <div 
            style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              height: '500px'
            }}
            onClick={() => navigate('/sweets')}
          >
            {featuredSweets[0] && (
              <>
                <img
                  src={featuredSweets[0].image_url || 'https://via.placeholder.com/280x500'}
                  alt={featuredSweets[0].name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent)',
                  padding: '40px 30px 30px',
                  color: '#fff'
                }}>
                  <div style={{
                    background: '#000',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    display: 'inline-block',
                    marginBottom: '12px',
                    fontSize: '16px',
                    fontWeight: '700',
                    letterSpacing: '0.5px'
                  }}>
                    Featured Products
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    marginTop: '8px'
                  }}>
                    VIEW ALL
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Product Grid */}
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '30px'
            }}>
              {featuredSweets.slice(0, 4).map((sweet) => (
                <div
                  key={sweet.id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setShowProductDetail(sweet)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '140px',
                    overflow: 'hidden',
                    background: '#f9fafb'
                  }}>
                    <img
                      src={sweet.image_url || 'https://via.placeholder.com/400x300'}
                      alt={sweet.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <div style={{ padding: '12px 15px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1f2937',
                      margin: '0 0 6px 0',
                      lineHeight: '1.3'
                    }}>
                      {sweet.name}
                    </h3>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: '#f3f4f6',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#6b7280',
                      marginBottom: '12px'
                    }}>
                      {sweet.category}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#1a1a2e',
                      marginTop: '6px'
                    }}>
                      From ₹{sweet.price.toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

export default Home;

