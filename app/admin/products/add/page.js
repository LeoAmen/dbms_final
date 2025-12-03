'use client';
import { useState, useEffect } from 'react';

export default function AddProductPage() {
  const [categories, setCategories] = useState([]);
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Product added successfully!');
        window.location.href = '/admin/products';
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Price</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Stock</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="form-input"
              required
            >
              <option value="">Select Category</option>
  {categories.map((category) => (
                <option key={category.CATEGORY_ID} value={category.CATEGORY_ID}>
                  {category.NAME}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn-primary">
              Add Product
            </button>
            <a href="/admin/products" className="btn-secondary">
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}