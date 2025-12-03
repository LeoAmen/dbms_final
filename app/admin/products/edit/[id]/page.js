'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchProductData();
      fetchCategories();
    }
  }, [params.id]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const product = await response.json();
      
      setFormData({
        name: product.NAME || '',
        description: product.DESCRIPTION || '',
        price: product.PRICE || '',
        stock: product.STOCK || '',
        category_id: product.CATEGORY_ID || ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error fetching product:', error);
      setErrors({ fetch: 'Failed to load product data' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    
    if (formData.stock !== '' && parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock cannot be negative';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setSaving(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          category_id: parseInt(formData.category_id)
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update product');
      }
      
      setSuccessMessage('Product updated successfully!');
      setTimeout(() => {
        router.push('/admin/products');
      }, 1500);
      
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors({ submit: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading product data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link 
          href="/admin/products" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Products
        </Link>
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="text-gray-600">Update product details</p>
      </div>
      
      {errors.fetch && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {errors.fetch}
          <div className="mt-2">
            <Link href="/admin/products" className="btn-secondary">
              Return to Products
            </Link>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {errors.submit}
        </div>
      )}

      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter product name"
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="4"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                className={`form-input ${errors.price ? 'border-red-500' : ''}`}
                placeholder="0.00"
                required
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`form-input ${errors.stock ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`form-input ${errors.category_id ? 'border-red-500' : ''}`}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.CATEGORY_ID} value={category.CATEGORY_ID}>
                  {category.NAME}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Product'}
            </button>
            <Link 
              href="/admin/products" 
              className="btn-secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Product Preview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Product Preview</h2>
        <div className="card max-w-md">
          <h3 className="font-semibold text-lg mb-2">{formData.name || 'Product Name'}</h3>
          <p className="text-gray-600 mb-2">
            {formData.description || 'Product description will appear here'}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-green-600 font-semibold">
              ${formData.price ? parseFloat(formData.price).toFixed(2) : '0.00'}
            </span>
            <span className="text-sm text-gray-500">
              Stock: {formData.stock || 0}
            </span>
          </div>
          {formData.category_id && (
            <div className="mt-2">
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {categories.find(c => c.CATEGORY_ID == formData.category_id)?.NAME || 'Category'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}