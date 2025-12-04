'use client';
import { useState, useEffect } from 'react';
import { ShoppingCart, User, Package, Shield } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
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

  const addToCart = (productId) => {
    const existingItem = cart.find(item => item.productId === productId);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { productId, quantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in';
    toast.textContent = 'Added to cart!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-2" />
              <a href="/" className="text-xl font-bold text-gray-900">E-Shop</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
              <a href="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Admin</a>
              
              <a href="/cart" className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-blue-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </a>
              
              <a href="/login" className="flex items-center text-gray-700 hover:text-blue-600">
                <User className="h-5 w-5 mr-1" />
                <span className="font-medium">Login</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to E-Shop</h1>
            <p className="text-xl opacity-90 mb-6">Discover amazing products at great prices</p>
            <a href="#products" className="btn-primary bg-white text-blue-600 hover:bg-gray-100">
              Shop Now
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Wide Selection</h3>
            <p className="text-gray-600">Thousands of products across multiple categories</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Shopping</h3>
            <p className="text-gray-600">Safe and secure payment processing</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Checkout</h3>
            <p className="text-gray-600">Simple and fast checkout process</p>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <a href="/products" className="text-blue-600 hover:text-blue-800 font-medium">
            View all →
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.PRODUCT_ID} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-gray-100 rounded-t-lg mb-4 flex items-center justify-center">
                  <Package className="h-20 w-20 text-gray-400" />
                </div>
                
                <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-1">
                  {product.NAME}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.DESCRIPTION}
                </p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-green-600">
                    ${product.PRICE}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    product.STOCK > 10 ? 'bg-green-100 text-green-800' : 
                    product.STOCK > 0 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.STOCK > 10 ? 'In Stock' : product.STOCK > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <button
                  onClick={() => addToCart(product.PRODUCT_ID)}
                  disabled={product.STOCK === 0}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                    product.STOCK === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md'
                  }`}
                >
                  {product.STOCK === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">&copy; 2024 E-Shop. All rights reserved.</p>
            <p className="text-gray-500 text-sm mt-2">Built with Next.js & Oracle Database</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
        .line-clamp-2 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  );
}