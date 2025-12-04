'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiSave, FiX, FiPackage, FiDollarSign, FiHash, 
  FiTag, FiFileText, FiGrid, FiArrowLeft,
  FiCheckCircle, FiAlertCircle, FiRefresh, FiEye
} from 'react-icons/fi';
import { MdCategory, MdInventory, MdUpdate } from 'react-icons/md';

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

  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i}>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
                    <div className="h-12 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
                <div className="flex gap-4 mt-8">
                  <div className="h-12 bg-gray-200 rounded w-40"></div>
                  <div className="h-12 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link 
                href="/admin/products" 
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium mb-4 group transition-colors"
              >
                <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                Back to Products
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                  <FiPackage className="text-2xl text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Edit Product</h1>
                  <p className="text-gray-600 mt-2">Update product details and inventory information</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Product ID: <span className="font-mono font-bold text-indigo-600">#{params.id}</span>
            </div>
          </div>

          {/* Alert Messages */}
          {errors.fetch && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-2xl shadow-sm animate-slideDown">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-2xl text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Failed to Load Product</h3>
                  <p>{errors.fetch}</p>
                  <div className="mt-4">
                    <Link 
                      href="/admin/products" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Return to Products
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 p-6 rounded-2xl shadow-sm animate-slideDown">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="text-2xl text-green-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Success!</h3>
                  <p>{successMessage}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Redirecting to products page...
                  </div>
                </div>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-2xl shadow-sm animate-slideDown">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="text-2xl text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Update Failed</h3>
                  <p>{errors.submit}</p>
                  <button
                    onClick={() => setErrors({})}
                    className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <FiRefresh />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Form Header */}
              <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
                    <MdUpdate className="text-xl text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Edit Product Information</h2>
                    <p className="text-gray-600 text-sm">All fields marked with * are required</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8">
                <div className="space-y-8">
                  {/* Product Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FiTag className="text-gray-500" />
                      Product Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-500 ${
                          errors.name 
                            ? 'bg-red-50 border-2 border-red-300 focus:ring-red-500 focus:border-transparent' 
                            : 'bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-transparent'
                        }`}
                        placeholder="Enter product name"
                        required
                      />
                      <FiTag className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                        errors.name ? 'text-red-400' : 'text-gray-400'
                      }`} />
                    </div>
                    {errors.name && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <FiAlertCircle />
                        <span>{errors.name}</span>
                      </div>
                    )}
                    {formData.name && !errors.name && (
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.name.length} characters
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FiFileText className="text-gray-500" />
                      Description
                    </label>
                    <div className="relative">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 min-h-[120px]"
                        placeholder="Describe your product in detail..."
                        rows="4"
                      />
                      <FiFileText className="absolute left-4 top-4 text-gray-400" />
                    </div>
                    {formData.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.description.length} characters
                      </p>
                    )}
                  </div>

                  {/* Price and Stock Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FiDollarSign className="text-gray-500" />
                        Price ($) *
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                          $
                        </div>
                        <input
                          type="text"
                          name="price"
                          value={formData.price}
                          onChange={handleNumberInput}
                          className={`w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-500 ${
                            errors.price 
                              ? 'bg-red-50 border-2 border-red-300 focus:ring-red-500 focus:border-transparent' 
                              : 'bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-transparent'
                          }`}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      {errors.price && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                          <FiAlertCircle />
                          <span>{errors.price}</span>
                        </div>
                      )}
                      {formData.price && !errors.price && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="text-sm text-blue-800">
                            Price updated: <span className="font-bold">${parseFloat(formData.price).toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FiHash className="text-gray-500" />
                        Stock Quantity
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="stock"
                          value={formData.stock}
                          onChange={handleNumberInput}
                          className={`w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 placeholder-gray-500 ${
                            errors.stock 
                              ? 'bg-red-50 border-2 border-red-300 focus:ring-red-500 focus:border-transparent' 
                              : 'bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-transparent'
                          }`}
                          placeholder="Enter quantity"
                        />
                        <FiHash className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                          errors.stock ? 'text-red-400' : 'text-gray-400'
                        }`} />
                      </div>
                      {errors.stock && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                          <FiAlertCircle />
                          <span>{errors.stock}</span>
                        </div>
                      )}
                      {formData.stock && !errors.stock && (
                        <div className={`mt-3 p-3 rounded-lg border ${
                          parseInt(formData.stock) < 10 
                            ? 'bg-amber-50 border-amber-100' 
                            : 'bg-green-50 border-green-100'
                        }`}>
                          <div className={`text-sm ${
                            parseInt(formData.stock) < 10 ? 'text-amber-800' : 'text-green-800'
                          }`}>
                            <span className="font-medium">
                              {parseInt(formData.stock) < 10 ? '⚠️ Low Stock Alert' : '✓ Sufficient Stock'}
                            </span>
                            <div className="mt-1">
                              {parseInt(formData.stock)} units available
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MdCategory className="text-gray-500" />
                      Category *
                    </label>
                    <div className="relative">
                      <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 appearance-none cursor-pointer ${
                          errors.category_id 
                            ? 'bg-red-50 border-2 border-red-300 focus:ring-red-500 focus:border-transparent' 
                            : 'bg-gray-50 border border-gray-300 focus:ring-indigo-500 focus:border-transparent'
                        }`}
                        required
                      >
                        <option value="" className="text-gray-500">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.CATEGORY_ID} value={category.CATEGORY_ID}>
                            {category.NAME}
                          </option>
                        ))}
                      </select>
                      <MdCategory className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                        errors.category_id ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.category_id && (
                      <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                        <FiAlertCircle />
                        <span>{errors.category_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating Product...
                      </>
                    ) : (
                      <>
                        <FiSave />
                        Update Product
                      </>
                    )}
                  </button>
                  <Link
                    href="/admin/products"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-center"
                  >
                    <FiX />
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden sticky top-8">
              {/* Preview Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-200 rounded-lg">
                    <FiEye className="text-lg text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                    <p className="text-gray-600 text-sm">See how your product will appear</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Product Image Placeholder */}
                <div className="mb-6">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <FiPackage className="text-4xl text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Product Image</p>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      {formData.name || 'Product Name'}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                        ID: #{params.id}
                      </span>
                      {formData.category_id && (
                        <span className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                          {categories.find(c => c.CATEGORY_ID == formData.category_id)?.NAME || 'Category'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {formData.description || 'Product description will appear here. A detailed description helps customers understand your product better.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          ${formData.price ? parseFloat(formData.price).toFixed(2) : '0.00'}
                        </span>
                        <div className="text-sm text-gray-500">Price</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${
                          parseInt(formData.stock) < 10 ? 'text-amber-600' : 'text-green-600'
                        }`}>
                          {formData.stock || 0}
                        </span>
                        <div className="text-sm text-gray-500">In Stock</div>
                      </div>
                    </div>

                    {/* Stock Status Indicator */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Stock Status</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          parseInt(formData.stock) >= 50 
                            ? 'bg-green-100 text-green-800'
                            : parseInt(formData.stock) >= 10 
                            ? 'bg-blue-100 text-blue-800'
                            : parseInt(formData.stock) > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {parseInt(formData.stock) >= 50 
                            ? 'High Stock'
                            : parseInt(formData.stock) >= 10 
                            ? 'Normal'
                            : parseInt(formData.stock) > 0
                            ? 'Low Stock'
                            : 'Out of Stock'
                          }
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            parseInt(formData.stock) >= 50 
                              ? 'bg-green-500 w-full'
                              : parseInt(formData.stock) >= 10 
                              ? 'bg-blue-500'
                              : parseInt(formData.stock) > 0
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(parseInt(formData.stock || 0), 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Preview */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-3">Customer Actions Preview:</div>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg text-center hover:from-blue-700 hover:to-blue-800 transition-all">
                        Add to Cart
                      </button>
                      <button className="py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-center">
                        Save for Later
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Last updated: Just now</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Preview updates in real-time as you make changes
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MdInventory className="text-indigo-600" />
                Product Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Name Length</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formData.name.length} characters
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Description Length</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formData.description.length} characters
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Price Tier</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {parseFloat(formData.price || 0) >= 100 
                      ? 'Premium'
                      : parseFloat(formData.price || 0) >= 50
                      ? 'Mid-range'
                      : 'Budget'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation */}
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}