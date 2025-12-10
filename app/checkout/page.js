'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [formData, setFormData] = useState({
    shipping_address: '',
    payment_method: 'credit_card',
    phone: ''
  });

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const customerData = localStorage.getItem('customer');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (customerData) {
      const customerObj = JSON.parse(customerData);
      setCustomer(customerObj);
      setFormData(prev => ({
        ...prev,
        shipping_address: customerObj.ADDRESS || '',
        phone: customerObj.PHONE || ''
      }));
    }
    
    fetchProducts().finally(() => setLoading(false));
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.PRODUCT_ID === item.productId);
      return total + (product ? product.PRICE * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customer) {
      alert('Please log in to complete your order');
      router.push('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      router.push('/products');
      return;
    }

    if (!formData.shipping_address.trim()) {
      alert('Please enter a shipping address');
      return;
    }

    setPlacingOrder(true);

    try {
      const orderData = {
        customer_id: customer.CUSTOMER_ID || customer.customer_id,
        total_amount: getCartTotal(),
        items: cart.map(item => {
          const product = products.find(p => p.PRODUCT_ID === item.productId);
          return {
            product_id: item.productId,
            quantity: item.quantity,
            price: product ? product.PRICE : 0
          };
        }),
        shipping_address: formData.shipping_address,
        phone: formData.phone,
        payment_method: formData.payment_method
      };

      const token = localStorage.getItem('token') || localStorage.getItem('customerToken');
      
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      
      if (response.ok) {
        localStorage.removeItem('cart');
        router.push(`/order/success?orderId=${result.orderId}`);
      } else {
        alert(result.error || 'Order failed. Please try again.');
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm p-8 max-w-md w-full">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Sign In Required</h3>
          <p className="text-gray-600 mb-6">Please log in to proceed with your checkout.</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/register')}
              className="w-full py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your purchase</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Details</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={customer.EMAIL || customer.CUSTOMER_EMAIL}
                    disabled
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                  <textarea
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Enter your complete shipping address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
                {cart.map((item) => {
                  const product = products.find(p => p.PRODUCT_ID === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <h4 className="font-medium text-gray-900">{product.NAME}</h4>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          ${(product.PRICE * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2">
                  <span>Total</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={placingOrder || cart.length === 0}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium ${
                  placingOrder || cart.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {placingOrder ? 'Processing...' : `Place Order - $${getCartTotal().toFixed(2)}`}
              </button>

              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}