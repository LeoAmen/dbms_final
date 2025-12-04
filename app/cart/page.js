'use client';

import { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Sparkles, Star, Heart } from 'lucide-react';

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      getRecommendedProducts();
    }
  }, [products, cart]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedProducts = () => {
    const cartProductIds = cart.map(item => item.productId);
    const availableProducts = products.filter(p => !cartProductIds.includes(p.PRODUCT_ID));
    const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
    setRecommended(shuffled.slice(0, 4));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const updatedCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.PRODUCT_ID);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.productId === product.PRODUCT_ID 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
    } else {
      updatedCart = [...cart, { productId: product.PRODUCT_ID, quantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.PRODUCT_ID === item.productId);
      return total + (product ? product.PRICE * item.quantity : 0);
    }, 0);
  };

  const getProductDetails = (productId) => {
    return products.find(p => p.PRODUCT_ID === productId);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <a href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </a>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="text-center max-w-md mx-auto mt-16">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-16 w-16 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h3>
            <p className="text-gray-600 mb-8">Add some amazing products to your cart!</p>
            <a href="/" className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105">
              Start Shopping
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-blue-100">
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-blue-100">
                    <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                    <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {cart.map((item) => {
                      const product = getProductDetails(item.productId);
                      if (!product) return null;
                      return (
                        <div key={item.productId} className="flex items-center p-4 bg-white rounded-xl border border-blue-100 hover:border-blue-200 transition-all hover:shadow-sm">
                          <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-4">
                            <ShoppingBag className="h-10 w-10 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{product.NAME}</h3>
                            <p className="text-blue-600 font-medium">${product.PRICE.toFixed(2)}</p>
                            <div className="flex items-center mt-3">
                              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-9 h-9 flex items-center justify-center border border-blue-200 rounded-l-lg hover:bg-blue-50 text-blue-600">
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-12 h-9 flex items-center justify-center border-y border-blue-200 text-gray-900 font-medium">
                                {item.quantity}
                              </span>
                              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-9 h-9 flex items-center justify-center border border-blue-200 rounded-r-lg hover:bg-blue-50 text-blue-600">
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-xl text-gray-900 mb-2">
                              ${(product.PRICE * item.quantity).toFixed(2)}
                            </p>
                            <button onClick={() => removeFromCart(item.productId)} className="inline-flex items-center text-red-500 hover:text-red-700 font-medium">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8 border border-blue-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-6 border-b border-blue-100">Order Summary</h3>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${(getCartTotal() * 0.08).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-6 border-t border-blue-100">
                    <span className="text-gray-900">Total</span>
                    <span className="text-blue-600">${(getCartTotal() * 1.08).toFixed(2)}</span>
                  </div>
                  <div className="mt-8 space-y-3">
                    <a href="/checkout" className="block w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02]">
                      Proceed to Checkout
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {recommended.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-6 w-6 text-blue-400" />
                      You Might Also Like
                    </span>
                  </h2>
                  <button 
                    onClick={getRecommendedProducts}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Refresh Recommendations
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommended.map((product) => (
                    <div key={product.PRODUCT_ID} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-blue-100">
                      <div className="p-5">
                        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4">
                          <ShoppingBag className="h-16 w-16 text-blue-400" />
                        </div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">{product.NAME}</h3>
                          <button className="text-gray-400 hover:text-red-500">
                            <Heart className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">4.5</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xl font-bold text-blue-600">${product.PRICE.toFixed(2)}</span>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}