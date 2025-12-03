'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent orders
      const ordersResponse = await fetch('/api/admin/recent-orders');
      const ordersData = await ordersResponse.json();
      setRecentOrders(ordersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-600">Total Products</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalProducts}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-600">Total Customers</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalCustomers}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-600">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
        </div>
        <div className="card text-center">
          <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
          <p className="text-3xl font-bold mt-2">${stats.totalRevenue}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p>No recent orders.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Order ID</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Date</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.ORDER_ID} className="border-b">
                  <td className="p-2">{order.ORDER_ID}</td>
                  <td className="p-2">{order.CUSTOMER_NAME}</td>
                  <td className="p-2">${order.TOTAL_AMOUNT}</td>
                  <td className="p-2">
                    {new Date(order.ORDER_DATE).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded ${
                      order.STATUS === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.STATUS}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-4">
        <a href="/admin/products" className="btn-primary">
          Manage Products
        </a>
        <a href="/admin/categories" className="btn-primary">
          Manage Categories
        </a>
        <a href="/admin/orders" className="btn-secondary">
          View All Orders
        </a>
        <a href="/admin/payments" className="btn-secondary">
          View Payments
        </a>
      </div>
    </div>
  );
}