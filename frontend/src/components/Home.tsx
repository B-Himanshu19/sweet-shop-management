import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sweet, sweetsAPI } from '../services/api';
import SweetCard from './SweetCard';
import ProductDetailModal from './ProductDetailModal';

const Home: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [featuredSweets, setFeaturedSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductDetail, setShowProductDetail] = useState<Sweet | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSweets();
  }, []);

  const loadSweets = async () => {
    try {
      setLoading(true);
      const data = await sweetsAPI.getAll();
      setSweets(data);
      // Get first 8 sweets for slideshow (we'll show 2 at a time)
      setFeaturedSweets(data.slice(0, 8));
    } catch (err: any) {
      console.error('Failed to load sweets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Slideshow auto-play
  useEffect(() => {
    if (featuredSweets.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        // We show 2 sweets at a time, so we have featuredSweets.length / 2 slides
        const maxSlides = Math.ceil(featuredSweets.length / 2);
        return (prev + 1) % maxSlides;
      });
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [featuredSweets.length, isPaused]);

  const nextSlide = () => {
    const maxSlides = Math.ceil(featuredSweets.length / 2);
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    const maxSlides = Math.ceil(featuredSweets.length / 2);
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Get current slide sweets (2 sweets per slide)
  const getCurrentSlideSweets = () => {
    const startIndex = currentSlide * 2;
    return featuredSweets.slice(startIndex, startIndex + 2);
  };

  const handlePurchase = async (id: number, weight: number): Promise<void> => {
    // This will be handled by ProductDetailModal
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

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Hero Banner Section - Full Width */}
      <div style={{ 
        width: '100%',
        marginBottom: '0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #2d5016 0%, #3d7a1f 30%, #4a9a26 100%)',
          position: 'relative',
          padding: '50px 60px',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '60px'
        }}>
          {/* Textured overlay pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.03) 10px,
                rgba(255, 255, 255, 0.03) 20px
              )
            `,
            opacity: 0.5,
            zIndex: 1
          }} />

          {/* Left Side - Product Images (Slideshow) */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '20px',
            maxWidth: '500px',
            position: 'relative',
            zIndex: 2,
            minHeight: '300px'
          }}>
            {getCurrentSlideSweets().map((sweet, index) => (
              <div
                key={`${sweet.id}-${currentSlide}`}
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  background: '#fff',
                  position: 'relative',
                  transform: index === 0 ? 'translateY(-15px)' : 'translateY(15px)',
                  transition: 'transform 0.5s ease, opacity 0.5s ease',
                  cursor: 'pointer',
                  animation: 'slideIn 0.5s ease'
                }}
                onClick={() => setShowProductDetail(sweet)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = (index === 0 ? 'translateY(-25px)' : 'translateY(25px)') + ' scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = index === 0 ? 'translateY(-15px)' : 'translateY(15px)';
                }}
              >
                <img
                  src={sweet.image_url || 'https://images.unsplash.com/photo-1606312619070-d48b4bc98fb0?w=400&h=300&fit=crop'}
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

          {/* Right Side - Text Content */}
          <div style={{
            flex: 1,
            maxWidth: '600px',
            position: 'relative',
            zIndex: 2,
            color: '#fff'
          }}>
            <h1 style={{
              fontSize: '64px',
              fontWeight: '800',
              marginBottom: '16px',
              color: '#ffffff',
              letterSpacing: '-2px',
              lineHeight: '1.1',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              RECIPES
            </h1>
            <p style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '24px',
              color: 'rgba(255, 255, 255, 0.95)',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
            }}>
              100% Organic and Pure
            </p>
            <p style={{
              fontSize: '16px',
              lineHeight: '1.6',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '24px',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              maxWidth: '500px'
            }}>
              We at Sweet Shop are bringing back the bygone treasure trove that comprises not only healthy but also scrumptious and luscious sweet snacks.
            </p>
          </div>

          {/* Carousel Controls - Bottom Left */}
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '60px',
            display: 'flex',
            gap: '12px',
            zIndex: 3,
            alignItems: 'center'
          }}>
            <button
              onClick={togglePause}
              style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#2d5016',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isPaused ? '▶' : '⏸'}
            </button>
            <button
              onClick={prevSlide}
              style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid #000',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#2d5016',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ◀
            </button>
            <button
              onClick={nextSlide}
              style={{
                width: '50px',
                height: '50px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#2d5016',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ▶
            </button>
            <button
              onClick={() => navigate('/sweets')}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '2px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                color: '#2d5016',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease',
                marginLeft: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              View all products →
            </button>
            {/* Slide Indicators */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginLeft: '16px',
              alignItems: 'center'
            }}>
              {Array.from({ length: Math.ceil(featuredSweets.length / 2) }).map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  style={{
                    width: currentSlide === index ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: currentSlide === index ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '80px 20px',
        background: '#ffffff'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 3fr',
          gap: '40px',
          alignItems: 'start'
        }}>
          {/* Left Side - Featured Products Banner */}
          <div style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/sweets')}
          >
            {featuredSweets[0] && (
              <>
                <img
                  src={featuredSweets[0].image_url || 'https://images.unsplash.com/photo-1606312619070-d48b4bc98fb0?w=400&h=300&fit=crop'}
                  alt={featuredSweets[0].name}
                  style={{
                    width: '100%',
                    height: '500px',
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
                    fontSize: '18px',
                    fontWeight: '700',
                    letterSpacing: '0.5px'
                  }}>
                    Featured Products
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginTop: '8px',
                    cursor: 'pointer'
                  }}>
                    VIEW ALL
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Side - Product Grid */}
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px'
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
                    height: '200px',
                    overflow: 'hidden',
                    background: '#f9fafb'
                  }}>
                    <img
                      src={sweet.image_url || 'https://images.unsplash.com/photo-1606312619070-d48b4bc98fb0?w=400&h=300&fit=crop'}
                      alt={sweet.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      marginBottom: '8px',
                      lineHeight: '1.4'
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
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1a1a2e',
                      marginTop: '8px'
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

