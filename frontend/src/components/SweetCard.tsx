import React, { useState } from 'react';
import { Sweet } from '../services/api';

interface SweetCardProps {
  sweet: Sweet;
  onPurchase: (id: number, quantity: number) => void;
  onView?: () => void;
}

// Weight unit options with their values in kg
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

const SweetCard: React.FC<SweetCardProps> = ({ sweet, onPurchase, onView }) => {
  const [selectedWeight, setSelectedWeight] = useState(0.25); // Default to 250g
  const [weightMode, setWeightMode] = useState<'standard' | 'custom'>('standard');
  const [customWeight, setCustomWeight] = useState('');
  const isOutOfStock = sweet.quantity === 0;
  const availableWeight = sweet.quantity; // Stock in kg

  // Generate weight options dynamically based on available stock
  const getAvailableWeightOptions = (): Array<{ label: string; value: number | string }> => {
    const options: Array<{ label: string; value: number | string }> = STANDARD_WEIGHT_UNITS.filter(unit => unit.value <= availableWeight);
    // Always add custom option if there's stock available
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

  // Get the current effective weight
  const getEffectiveWeight = (): number => {
    if (weightMode === 'custom') {
      const weight = parseFloat(customWeight);
      return (!isNaN(weight) && weight > 0 && weight <= availableWeight) ? weight : 0;
    }
    return selectedWeight;
  };

  const calculateTotal = () => {
    // Price is per kg, so multiply by weight in kg
    const effectiveWeight = getEffectiveWeight();
    return sweet.price * effectiveWeight;
  };

  const handlePurchase = () => {
    const effectiveWeight = getEffectiveWeight();
    if (effectiveWeight > 0 && effectiveWeight <= availableWeight) {
      // Send weight in kg to backend
      onPurchase(sweet.id, effectiveWeight);
      // Reset after purchase
      setSelectedWeight(0.25);
      setWeightMode('standard');
      setCustomWeight('');
    }
  };

  const totalAmount = calculateTotal();
  const effectiveWeight = getEffectiveWeight();
  
  // Format weight display
  const formatWeight = (weight: number): string => {
    if (weight >= 1) {
      return `${weight} kg`;
    } else {
      return `${weight * 1000}g`;
    }
  };

  // Default placeholder image based on category
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

  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
      const overlay = e.currentTarget.querySelector('.view-overlay') as HTMLElement;
      if (overlay) overlay.style.opacity = '1';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
      const overlay = e.currentTarget.querySelector('.view-overlay') as HTMLElement;
      if (overlay) overlay.style.opacity = '0';
    }}
    onClick={onView}
    >
      <div style={{
        width: '100%',
        height: '200px',
        overflow: 'hidden',
        backgroundColor: '#f9fafb',
        position: 'relative'
      }}>
        <img
          src={imageUrl}
          alt={sweet.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const container = target.parentElement;
            if (container && !container.querySelector('.image-placeholder')) {
              const placeholder = document.createElement('div');
              placeholder.className = 'image-placeholder';
              placeholder.style.cssText = `
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 64px;
                background: #f9fafb;
                color: #d1d5db;
              `;
              placeholder.textContent = '🍬';
              container.appendChild(placeholder);
            }
          }}
        />
        <div 
          className="view-overlay"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#000',
            color: '#fff',
            padding: '8px 20px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '1px',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            borderRadius: '4px'
          }}
        >
          VIEW
        </div>
      </div>
      <div style={{ padding: '14px' }}>
        <h3 style={{
          fontSize: '15px',
          fontWeight: '500',
          color: '#1f2937',
          marginBottom: '6px',
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {sweet.name}
        </h3>
        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#1f2937',
          marginTop: '8px'
        }}>
          From ₹{sweet.price.toFixed(0)}
        </div>
      </div>
    </div>
  );
};

export default SweetCard;

