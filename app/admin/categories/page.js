'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    try {
      setDeleteError('');
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete category');
      }
      
      // Remove from local state
      setCategories(categories.filter(cat => cat.CATEGORY_ID !== categoryId));
      setDeleteConfirm(null);
      alert('Category deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting category:', error);
      setDeleteError(error.message);
    }
  };

  const handleDeleteClick = (category) => {
    if (category.PRODUCT_COUNT > 0) {
      setDeleteError(`Cannot delete "${category.NAME}" because it has ${category.PRODUCT_COUNT} product(s).`);
      return;
    }
    setDeleteConfirm(category);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Category Management</h1>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        <Link href="/admin/categories/add" className="btn-primary">
          Add New Category
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
          <button 
            onClick={fetchCategories}
            className="ml-4 text-blue-600 hover:text-blue-800"
          >
            Retry
          </button>
        </div>
      )}

      {deleteError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          {deleteError}
          <button 
            onClick={() => setDeleteError('')}
            className="ml-4 text-yellow-600 hover:text-yellow-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete category "{deleteConfirm.NAME}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCategory(deleteConfirm.CATEGORY_ID)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No categories found.</p>
            <Link href="/admin/categories/add" className="btn-primary">
              Create Your First Category
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Category Name</th>
                  <th className="text-left p-3">Products</th>
                  <th className="text-left p-3">Created Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.CATEGORY_ID} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono">{category.CATEGORY_ID}</td>
                    <td className="p-3">
                      <div className="font-medium">{category.NAME}</div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.PRODUCT_COUNT > 0 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.PRODUCT_COUNT} product(s)
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">
                      {new Date(category.CREATED_DATE).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-3">
                        <Link 
                          href={`/admin/categories/edit/${category.CATEGORY_ID}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          disabled={category.PRODUCT_COUNT > 0}
                          className={`text-sm font-medium ${
                            category.PRODUCT_COUNT > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-800'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-gray-600">Total Categories</div>
          <div className="text-2xl font-bold mt-2">{categories.length}</div>
        </div>
        <div className="card text-center">
          <div className="text-gray-600">Categories with Products</div>
          <div className="text-2xl font-bold mt-2 text-blue-600">
            {categories.filter(c => c.PRODUCT_COUNT > 0).length}
          </div>
        </div>
        <div className="card text-center">
          <div className="text-gray-600">Total Products</div>
          <div className="text-2xl font-bold mt-2 text-green-600">
            {categories.reduce((total, cat) => total + (cat.PRODUCT_COUNT || 0), 0)}
          </div>
        </div>
      </div>
    </div>
  );
}