'use client';
import { useState, useEffect } from 'react';
import { FiPackage, FiDollarSign, FiHash, FiTag, FiFileText, FiSave, FiX, FiUpload, FiImage, FiCheckCircle } from 'react-icons/fi';
import { MdCategory } from 'react-icons/md';

export default function AddProductPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Show success feedback before redirect
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
          <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        `;
        
        setTimeout(() => {
          alert('Product added successfully!');
          window.location.href = '/admin/products';
        }, 500);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    // Placeholder for image upload functionality
    console.log('Image upload would be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <FiPackage className="text-indigo-600" />
            Add New Product
          </h1>
          <p className="text-gray-600">Fill in the details below to add a new product to your inventory</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <FiPackage className="text-xl text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
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
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                    placeholder="Enter product name"
                    required
                  />
                  <FiTag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {formData.name && (
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
                    Price *
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
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-sm text-blue-800 flex items-center gap-2">
                      <FiCheckCircle />
                      <span>Enter price in USD. Customers will see this as the product price.</span>
                    </div>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiHash className="text-gray-500" />
                    Stock Quantity *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="stock"
                      value={formData.stock}
                      onChange={handleNumberInput}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-500"
                      placeholder="Enter quantity"
                      required
                    />
                    <FiHash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="text-sm text-amber-800">
                      <span className="font-medium">Note:</span> Stock levels below 10 will be marked as low inventory.
                    </div>
                  </div>
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
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                    required
                  >
                    <option value="" className="text-gray-500">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.CATEGORY_ID} value={category.CATEGORY_ID}>
                        {category.NAME}
                      </option>
                    ))}
                  </select>
                  <MdCategory className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {!categories.length && (
                  <p className="mt-2 text-sm text-red-600">
                    No categories available. Please add categories first.
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 pt-8 border-t border-gray-200 flex flex-col sm:flex-row gap-4 justify-end">
              <a
                href="/admin/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-md"
              >
                <FiX />
                Cancel
              </a>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Product...
                  </>
                ) : (
                  <>
                    <FiSave />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

  
      </div>
    </div>
  );
}