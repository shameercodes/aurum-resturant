import { useState, useEffect } from 'react';
import './MenuItemModal.css';

const EMPTY = {
  name: '',
  category: 'starters',
  price: '',
  description: '',
  badges: '',
  spiceLevel: '0',
  isVegetarian: false,
  featured: false,
  imageUrl: '',
};

export default function MenuItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!item;

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        category: item.category || 'starters',
        price: String(item.price ?? ''),
        description: item.description || '',
        badges: (item.badges || []).join(', '),
        spiceLevel: String(item.spiceLevel ?? 0),
        isVegetarian: !!item.isVegetarian,
        featured: !!item.featured,
        imageUrl: item.image?.startsWith('http') ? item.image : '',
      });
      setPreview(item.image || '');
    } else {
      setForm(EMPTY);
      setPreview('');
    }
    setFile(null);
    setError('');
  }, [item]);

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const onFile = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.description.trim()) {
      setError('Name, price, and description are required.');
      return;
    }
    if (!isEdit && !file && !form.imageUrl.trim()) {
      setError('Upload an image or paste an image URL.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ form, file, isEdit, itemId: item?._id });
      onClose();
    } catch (err) {
      setError(err.displayMessage || 'Failed to save item.');
      setSaving(false);
    }
  };

  return (
    <div className="menu-modal-overlay" onClick={onClose} role="presentation">
      <div className="menu-modal" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="menu-modal-title">
        <header className="menu-modal-header">
          <h2 id="menu-modal-title">{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
          <button type="button" className="menu-modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <form onSubmit={handleSubmit} className="menu-modal-form">
          <div className="menu-modal-preview">
            {preview ? (
              <img src={preview} alt="Preview" />
            ) : (
              <span className="preview-placeholder">Image preview</span>
            )}
          </div>

          <div className="form-row-2">
            <div className="field">
              <label>Name *</label>
              <input name="name" value={form.name} onChange={onChange} required />
            </div>
            <div className="field">
              <label>Category *</label>
              <select name="category" value={form.category} onChange={onChange}>
                <option value="starters">Starters</option>
                <option value="mains">Main Course</option>
                <option value="desserts">Desserts</option>
                <option value="cocktails">Drinks</option>
              </select>
            </div>
          </div>

          <div className="form-row-2">
            <div className="field">
              <label>Price (£) *</label>
              <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={onChange} required />
            </div>
            <div className="field">
              <label>Spice Level (0–5)</label>
              <input name="spiceLevel" type="number" min="0" max="5" value={form.spiceLevel} onChange={onChange} />
            </div>
          </div>

          <div className="field">
            <label>Description *</label>
            <textarea name="description" value={form.description} onChange={onChange} rows="3" required />
          </div>

          <div className="field">
            <label>Badges (comma-separated)</label>
            <input name="badges" value={form.badges} onChange={onChange} placeholder="Signature, Chef's Choice" />
          </div>

          <div className="field">
            <label>Upload Image {isEdit ? '(optional)' : '*'}</label>
            <input type="file" accept="image/*" onChange={onFile} />
          </div>

          <div className="field">
            <label>Or Image URL {isEdit ? '(optional)' : ''}</label>
            <input name="imageUrl" value={form.imageUrl} onChange={onChange} placeholder="https://…" />
          </div>

          <div className="menu-modal-checks">
            <label className="check-label">
              <input type="checkbox" name="isVegetarian" checked={form.isVegetarian} onChange={onChange} />
              Vegetarian
            </label>
            <label className="check-label">
              <input type="checkbox" name="featured" checked={form.featured} onChange={onChange} />
              Featured / Signature
            </label>
          </div>

          {error && <div className="form-err-msg">{error}</div>}

          <div className="menu-modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
