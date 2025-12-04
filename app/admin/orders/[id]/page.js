'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id);
    }
  }, [params.id]);

  const fetchOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const data = await response.json();
      setOrder(data);
      setError('');
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      setOrder({ ...order, STATUS: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 h-64"></div>
                <div className="bg-white rounded-xl shadow-sm p-6 h-32"></div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 h-48"></div>
                <div className="bg-white rounded-xl shadow-sm p-6 h-48"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error || 'The order you are looking for does not exist.'}</p>
            <Link
              href="/admin/orders"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin/orders"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Order #{order.ORDER_ID}</h1>
                  <p className="text-gray-600 mt-1">
                    Placed on {new Date(order.ORDER_DATE).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <select
                value={order.STATUS}
                onChange={(e) => updateStatus(e.target.value)}
                disabled={updatingStatus}
                className={`px-4 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                  getStatusColor(order.STATUS)
                } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items & Shipping */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-200">Order Items</h2>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-6">
                  {order.items.map((item) => (
                    <div key={item.ITEM_ID} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.PRODUCT_NAME}</h3>
                        {item.PRODUCT_DESCRIPTION && (
                          <p className="text-sm text-gray-600 mt-1">{item.PRODUCT_DESCRIPTION}</p>
                        )}
                        <div className="flex items-center mt-3 space-x-4">
                          <span className="text-sm text-gray-500">SKU: {item.SKU || 'N/A'}</span>
                          <span className="text-sm text-gray-500">Qty: {item.QUANTITY}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${(item.PRICE * item.QUANTITY).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${item.PRICE.toFixed(2)} × {item.QUANTITY}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Summary */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="space-y-3 max-w-md ml-auto">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>${(order.TOTAL_AMOUNT * 0.9).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Tax (10%)</span>
                        <span>${(order.TOTAL_AMOUNT * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold text-gray-900 pt-3 border-t">
                        <span>Total</span>
                        <span className="text-2xl">${order.TOTAL_AMOUNT}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No items found in this order</p>
                </div>
              )}
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-gray-700 whitespace-pre-line">{order.SHIPPING_ADDRESS || 'No shipping address provided'}</p>
                {order.SHIPPING_METHOD && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <svg className="mr-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      {order.SHIPPING_METHOD}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Customer, Status, Payment */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{order.CUSTOMER_NAME}</h3>
                    {order.CUSTOMER_EMAIL && (
                      <p className="text-sm text-gray-600">{order.CUSTOMER_EMAIL}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-gray-700">
                    <svg className="mr-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{order.CUSTOMER_PHONE || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.STATUS)}`}>
                    {order.STATUS}
                  </span>
                  {updatingStatus && (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Status History</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-600">Order placed</span>
                      <span className="ml-auto text-gray-500">Today</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {order.payment && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Method</span>
                    <span className="font-medium text-gray-900">{order.payment.PAYMENT_METHOD}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Amount</span>
                    <span className="font-semibold text-gray-900">${order.payment.AMOUNT}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.payment.STATUS === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.payment.STATUS}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Date</span>
                    <span className="text-gray-900">
                      {new Date(order.payment.PAYMENT_DATE).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}