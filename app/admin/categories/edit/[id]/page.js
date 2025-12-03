'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchCategoryData();
    }
  }, [params.id]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/categories/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      
      const data = await response.json();
      setCategory(data);
      setFormData({
        name: data.NAME || ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error fetching category:', error);
      setErrors({ fetch: 'Failed to load category data' });
    } finally {
      setLoading(false);
    }
  };

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
    
    setSaving(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const response = await fetch(`/api/categories/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim()
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update category');
      }
      
      setSuccessMessage('Category updated successfully!');
      
      // Update local state
      setCategory({
        ...category,
        NAME: formData.name.trim()
      });
      
    } catch (error) {
      console.error('Error updating category:', error);
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
          <div className="text-gray-600">Loading category data...</div>
        </div>
      </div>
    );
  }

  if (errors.fetch || !category) {
    return (
      <div className="p-8">
        <div className="card text-center py-8">
          <div className="text-red-600 mb-4">
            {errors.fetch || 'Category not found'}
          </div>
          <Link href="/admin/categories" className="btn-primary">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link 
          href="/admin/categories" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Categories
        </Link>
        <h1 className="text-2xl font-bold">Edit Category</h1>
        <p className="text-gray-600">Update category details</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Edit Form */}
        <div className="card">
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
                disabled={saving}
              >
                {saving ? 'Updating...' : 'Update Category'}
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

        {/* Category Info */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Category Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Category ID:</span>
                <span className="ml-2 font-mono font-medium">{category.CATEGORY_ID}</span>
              </div>
              <div>
                <span className="text-gray-600">Current Name:</span>
                <span className="ml-2 font-medium">{category.NAME}</span>
              </div>
              <div>
                <span className="text-gray-600">Products in Category:</span>
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  category.PRODUCT_COUNT > 0 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.PRODUCT_COUNT} product(s)
                </span>
              </div>
              <div>
                <span className="text-gray-600">Created Date:</span>
                <span className="ml-2">
                  {new Date(category.CREATED_DATE).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Warning if category has products */}
          {category.PRODUCT_COUNT > 0 && (
            <div className="card bg-yellow-50 border-yellow-200">
              <h4 className="text-yellow-800 font-semibold mb-2">⚠️ Important Notice</h4>
              <p className="text-yellow-700 text-sm">
                This category contains {category.PRODUCT_COUNT} product(s). 
                Changing the category name will affect all products in this category.
                Categories with products cannot be deleted.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}