'use client';
import { useState, useEffect, Fragment } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiPackage, FiDollarSign, FiTrendingUp, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { MdInventory } from 'react-icons/md';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

 const deleteProduct = async (productId) => {
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/products/${productId}`, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      alert(result.error || 'Failed to delete product');
      return;
    }
    
    // Show success message
    alert('Product deleted successfully!');
    
    // Refresh the products list
    fetchProducts();
    
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('An error occurred while deleting the product');
  }
};

  // Filter products based on search - UPDATED to use CATEGORY_NAME
  const filteredProducts = products.filter(product =>
    product.NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.PRODUCT_ID.toString().includes(searchTerm) ||
    (product.CATEGORY_NAME && product.CATEGORY_NAME.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic - MOVE THIS BEFORE USING startIndex
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Calculate summary stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.STOCK < 10).length;
  const totalValue = products.reduce((sum, p) => sum + (p.PRICE * p.STOCK), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-full mb-6"></div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded w-full mb-4"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <MdInventory className="text-indigo-600" />
                Product Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your product inventory efficiently</p>
            </div>
            <a
              href="/admin/products/add"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <FiPlus className="text-lg" />
              Add New Product
            </a>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalProducts}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FiPackage className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{lowStockProducts}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <FiTrendingUp className="text-2xl text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <FiDollarSign className="text-2xl text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-auto">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, ID, or category..."
              className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-600">
            Showing {Math.min(startIndex + 1, filteredProducts.length)}-
            {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Product ID
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="text-left p-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentProducts.map((product) => (
                  <tr 
                    key={product.PRODUCT_ID} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="p-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                        #{product.PRODUCT_ID}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="font-medium text-gray-900">{product.NAME}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {product.CATEGORY_NAME || 'Uncategorized'}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-900">${product.PRICE}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.STOCK > 20 
                            ? 'bg-green-100 text-green-800'
                            : product.STOCK > 10
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.STOCK} units
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <a
                          href={`/admin/products/edit/${product.PRODUCT_ID}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                        >
                          <FiEdit2 />
                          Edit
                        </a>
                        <button
                          onClick={() => deleteProduct(product.PRODUCT_ID)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 font-medium rounded-lg transition-all duration-200 hover:shadow-md"
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200'
                  }`}
                >
                  <FiChevronLeft />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => 
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    )
                    .map((page, index, array) => (
                      <Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            currentPage === page
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200'
                          }`}
                        >
                          {page}
                        </button>
                      </Fragment>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200'
                  }`}
                >
                  Next
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* No Results Message */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching products found' : 'No products available'}
            </h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Add your first product to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}