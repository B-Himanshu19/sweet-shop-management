import React, { useState, useEffect } from 'react';
import { Sweet } from '../services/api';

interface SweetFormProps {
  sweet?: Sweet | null;
  onSubmit: (data: { name: string; category: string; price: number; quantity?: number; image_url?: string; description?: string }) => void;
  onCancel: () => void;
}

const SweetForm: React.FC<SweetFormProps> = ({ sweet, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (sweet) {
      setName(sweet.name);
      setCategory(sweet.category);
      setPrice(sweet.price.toString());
      setQuantity(sweet.quantity.toString());
      setImageUrl(sweet.image_url || '');
      setDescription(sweet.description || '');
    } else {
      // Reset form when creating new sweet
      setName('');
      setCategory('');
      setPrice('');
      setQuantity('');
      setImageUrl('');
      setDescription('');
    }
  }, [sweet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedImageUrl = imageUrl.trim();
    const trimmedDescription = description.trim();
    const submitData: { name: string; category: string; price: number; quantity?: number; image_url?: string; description?: string } = {
      name,
      category,
      price: parseFloat(price),
      quantity: quantity ? parseFloat(quantity) : undefined,
    };
    
    // Always include image_url and description when editing to ensure they're updated
    if (sweet) {
      // When editing, always send image_url and description (even if empty) so backend knows to update them
      submitData.image_url = trimmedImageUrl || '';
      submitData.description = trimmedDescription || '';
    } else {
      // When creating, only send if provided
      if (trimmedImageUrl) {
        submitData.image_url = trimmedImageUrl;
      }
      if (trimmedDescription) {
        submitData.description = trimmedDescription;
      }
    }
    
    onSubmit(submitData);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{sweet ? 'Edit Sweet' : 'Add New Sweet'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Price per kg (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              required
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.85em', display: 'block', marginTop: '4px' }}>
              Enter the price per kilogram
            </small>
          </div>
          <div className="form-group">
            <label>Stock Quantity (kg)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="0"
              step="0.01"
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.85em', display: 'block', marginTop: '4px' }}>
              Enter the available stock in kilograms
            </small>
          </div>
          <div className="form-group">
            <label>Image URL (Optional)</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.85em', display: 'block', marginTop: '4px' }}>
              Leave empty to use default category image
            </small>
          </div>
          {imageUrl && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9em' }}>Preview:</label>
              <img
                src={imageUrl}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '2px solid var(--border-color)'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a detailed description of the sweet..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.85em', display: 'block', marginTop: '4px' }}>
              Provide details about ingredients, taste, origin, or special features
            </small>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {sweet ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SweetForm;

