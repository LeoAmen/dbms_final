'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddCategoryPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Category name must be less than 100 characters';
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
    
    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim()
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create category');
      }
      
      setSuccessMessage('Category created successfully!');
      
      // Clear form
      setFormData({ name: '' });
      
      // Redirect after success
      setTimeout(() => {
        router.push('/admin/categories');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating category:', error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link 
          href="/admin/categories" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Categories
        </Link>
        <h1 className="text-2xl font-bold">Add New Category</h1>
        <p className="text-gray-600">Create a new product category</p>
      </div>
      
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

      <div className="card max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Electronics, Clothing, Books"
              required
              maxLength="100"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {formData.name.length}/100 characters
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Category'}
            </button>
            <Link 
              href="/admin/categories" 
              className="btn-secondary"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="mt-8 card max-w-md">
        <h3 className="text-lg font-semibold mb-3">Tips for Creating Categories</h3>
        <ul className="list-disc pl-5 space-y-2 text-gray-600">
          <li>Keep category names short and descriptive</li>
          <li>Use plural form (e.g., "Electronics" not "Electronic")</li>
          <li>Avoid special characters when possible</li>
          <li>Categories can be edited or deleted later</li>
          <li>Categories with products cannot be deleted</li>
        </ul>
      </div>
    </div>
  );
}