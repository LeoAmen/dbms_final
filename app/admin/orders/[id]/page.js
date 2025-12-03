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
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      setOrder({ ...order, STATUS: newStatus });
      alert('Order status updated!');
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8">
        <div className="card text-center py-8">
          <div className="text-red-600 mb-4">{error || 'Order not found'}</div>
          <Link href="/admin/orders" className="btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.ORDER_ID}</h1>
          <p className="text-gray-600">Placed on {new Date(order.ORDER_DATE).toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-3">
          <Link href="/admin/orders" className="btn-secondary">
            Back to Orders
          </Link>
          <select
            value={order.STATUS}
            onChange={(e) => updateStatus(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.ITEM_ID} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-medium">{item.PRODUCT_NAME}</h3>
                      <p className="text-sm text-gray-600">{item.PRODUCT_DESCRIPTION}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.PRICE} × {item.QUANTITY}</p>
                      <p className="text-lg font-bold">${(item.PRICE * item.QUANTITY).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold">${order.TOTAL_AMOUNT}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No items found</p>
            )}
          </div>

          {/* Shipping Information */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
            <p className="text-gray-700">{order.SHIPPING_ADDRESS || 'No shipping address provided'}</p>
          </div>
        </div>

        {/* Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {order.CUSTOMER_NAME}</p>
              <p><span className="font-medium">Email:</span> {order.CUSTOMER_EMAIL}</p>
              <p><span className="font-medium">Phone:</span> {order.CUSTOMER_PHONE || 'Not provided'}</p>
            </div>
          </div>

          {/* Order Status */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="space-y-3">
              <div className={`inline-block px-3 py-1 rounded-full ${
                order.STATUS === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                order.STATUS === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                order.STATUS === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.STATUS}
              </div>
              <p className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          {order.payment && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Payment Information</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Method:</span> {order.payment.PAYMENT_METHOD}</p>
                <p><span className="font-medium">Amount:</span> ${order.payment.AMOUNT}</p>
                <p><span className="font-medium">Status:</span> {order.payment.STATUS}</p>
                <p><span className="font-medium">Date:</span> {new Date(order.payment.PAYMENT_DATE).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}