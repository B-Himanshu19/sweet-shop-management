import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sweet } from '../services/api';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  sweet: Sweet;
  onClose: () => void;
}

const STANDARD_WEIGHT_UNITS = [
  { label: '250g', value: 0.25 },
  { label: '500g (Half kg)', value: 0.5 },
  { label: '750g', value: 0.75 },
  { label: '1 kg', value: 1.0 },
  { label: '2 kg', value: 2.0 },
  { label: '3 kg', value: 3.0 },
  { label: '4 kg', value: 4.0 },
  { label: '5 kg', value: 5.0 },
];

const CUSTOM_WEIGHT_OPTION = 'custom';

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ sweet, onClose }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedWeight, setSelectedWeight] = useState(0.25);
  const [weightMode, setWeightMode] = useState<'standard' | 'custom'>('standard');
  const [customWeight, setCustomWeight] = useState('');
  const [quantity, setQuantity] = useState(1);
  const availableWeight = sweet.quantity;

  const getAvailableWeightOptions = (): Array<{ label: string; value: number | string }> => {
    const options: Array<{ label: string; value: number | string }> = STANDARD_WEIGHT_UNITS.filter(unit => unit.value <= availableWeight);
    if (availableWeight > 0) {
      options.push({ label: 'Custom Weight (Bulk Order)', value: CUSTOM_WEIGHT_OPTION });
    }
    return options;
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === CUSTOM_WEIGHT_OPTION) {
      setWeightMode('custom');
      setCustomWeight('');
    } else {
      setWeightMode('standard');
      setSelectedWeight(parseFloat(value));
    }
  };

  const handleCustomWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomWeight(value);
    const weight = parseFloat(value);
    if (!isNaN(weight) && weight > 0 && weight <= availableWeight) {
      setSelectedWeight(weight);
    }
  };

  const getEffectiveWeight = (): number => {
    if (weightMode === 'custom') {
      const weight = parseFloat(customWeight);
      return (!isNaN(weight) && weight > 0 && weight <= availableWeight) ? weight : 0;
    }
    return selectedWeight;
  };

  const formatWeight = (weight: number): string => {
    if (weight >= 1) {
      return `${weight} kg`;
    } else {
      return `${weight * 1000}g`;
    }
  };

  const effectiveWeight = getEffectiveWeight();
  const totalWeight = effectiveWeight * quantity;
  const totalAmount = sweet.price * totalWeight;

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

  const imageUrl = sweet.image_url || getDefaultImage(sweet.category);

  const handleAddToCart = () => {
    if (effectiveWeight > 0 && totalWeight <= availableWeight) {
      addToCart(sweet, effectiveWeight, quantity);
      onClose();
    }
  };

  const handleBuyNow = () => {
    if (effectiveWeight > 0 && totalWeight <= availableWeight) {
      addToCart(sweet, effectiveWeight, quantity);
      onClose();
      navigate('/cart');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}
    onClick={onClose}
    >
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 10
          }}
        >
          ×
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          padding: '40px'
        }}>
          {/* Left: Image */}
          <div>
            <div style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '8px',
              overflow: 'hidden',
              background: '#f9fafb'
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
            </div>
          </div>

          {/* Right: Product Info */}
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#1f2937'
            }}>
              {sweet.name}
            </h1>

            <div style={{
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#1f2937'
            }}>
              ₹{sweet.price.toFixed(2)}
            </div>

            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '30px'
            }}>
              Shipping calculated at checkout.
            </p>

            {availableWeight > 0 ? (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: '#1f2937'
                  }}>
                    WEIGHT
                  </label>
                  <select
                    value={weightMode === 'custom' ? CUSTOM_WEIGHT_OPTION : selectedWeight.toString()}
                    onChange={handleWeightChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      background: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    {getAvailableWeightOptions().map((unit, index) => {
                      if (typeof unit.value === 'string' && unit.value === CUSTOM_WEIGHT_OPTION) {
                        return (
                          <option key="custom" value={CUSTOM_WEIGHT_OPTION}>
                            {unit.label}
                          </option>
                        );
                      }
                      return (
                        <option key={typeof unit.value === 'number' ? unit.value : index} value={unit.value}>
                          {unit.label}
                        </option>
                      );
                    })}
                  </select>

                  {weightMode === 'custom' && (
                    <input
                      type="number"
                      value={customWeight}
                      onChange={handleCustomWeightChange}
                      placeholder="Enter weight in kg"
                      min="0.01"
                      max={availableWeight}
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px',
                        marginTop: '10px'
                      }}
                    />
                  )}
                </div>

                <div style={{ marginBottom: '30px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: '#1f2937'
                  }}>
                    QUANTITY
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: 'fit-content'
                  }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '1px solid #d1d5db',
                        background: '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      style={{
                        width: '60px',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      style={{
                        width: '40px',
                        height: '40px',
                        border: '1px solid #d1d5db',
                        background: '#fff',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '15px',
                  marginBottom: '30px'
                }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={effectiveWeight <= 0 || totalWeight > availableWeight}
                    style={{
                      flex: 1,
                      padding: '14px 24px',
                      background: '#fff',
                      border: '1px solid #000',
                      color: '#000',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: effectiveWeight <= 0 || totalWeight > availableWeight ? 'not-allowed' : 'pointer',
                      opacity: effectiveWeight <= 0 || totalWeight > availableWeight ? 0.5 : 1
                    }}
                  >
                    ADD TO CART
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={effectiveWeight <= 0 || totalWeight > availableWeight}
                    style={{
                      flex: 1,
                      padding: '14px 24px',
                      background: '#000',
                      border: 'none',
                      color: '#fff',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: effectiveWeight <= 0 || totalWeight > availableWeight ? 'not-allowed' : 'pointer',
                      opacity: effectiveWeight <= 0 || totalWeight > availableWeight ? 0.5 : 1
                    }}
                  >
                    BUY IT NOW
                  </button>
                </div>
              </>
            ) : (
              <div style={{
                padding: '20px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '4px',
                marginBottom: '20px'
              }}>
                Out of Stock
              </div>
            )}

            <div style={{
              marginTop: '30px',
              paddingTop: '30px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '15px',
                color: '#1f2937'
              }}>
                Product description
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap'
              }}>
                {sweet.description || 'Taste of authentic sweets: This is a premium quality sweet made from the finest ingredients. Each batch is carefully prepared to ensure the perfect taste and texture. Available in various weights to suit your needs.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;

