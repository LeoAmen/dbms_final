'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    growthRate: 12.5
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, month, year

  useEffect(() => {
    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      setStats(prev => ({ ...prev, ...statsData }));

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'Today';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>

            {/* Recent Orders Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                {['today', 'week', 'month', 'year'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      timeFilter === filter
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              
              <button
                onClick={fetchDashboardData}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors duration-200"
                title="Refresh data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium opacity-90">+{stats.growthRate}%</div>
                <div className="text-sm opacity-80">{getTimeFilterLabel()}</div>
              </div>
            </div>
            <h3 className="text-lg font-medium opacity-90 mb-1">Total Revenue</h3>
            <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                +{stats.todayOrders} today
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders.toLocaleString()}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span>{stats.pendingOrders} pending orders</span>
              </div>
            </div>
          </div>

          {/* Total Customers Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-2.5a6 6 0 11-12 0 6 6 0 0112 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Total Customers</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers.toLocaleString()}</p>
           
          </div>

          {/* Total Products Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                In Stock
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link 
                href="/admin/products" 
                className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
              >
                Manage products
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                  <Link
                    href="/admin/orders"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View all orders →
                  </Link>
                </div>
              </div>
              
              {recentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600">Orders will appear here when customers make purchases.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr 
                          key={order.ORDER_ID} 
                          className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                          onClick={() => router.push(`/admin/orders/${order.ORDER_ID}`)}
                        >
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="font-mono text-sm font-medium text-gray-900">#{order.ORDER_ID}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-gray-900">{order.CUSTOMER_NAME}</div>
                            {order.CUSTOMER_EMAIL && (
                              <div className="text-sm text-gray-600">{order.CUSTOMER_EMAIL}</div>
                            )}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="text-lg font-semibold text-gray-900">{formatCurrency(order.TOTAL_AMOUNT)}</div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.STATUS)}`}>
                              {order.STATUS}
                            </span>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(order.ORDER_DATE)}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-4">
                <Link
                  href="/admin/products/add"
                  className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Add New Product</h4>
                      <p className="text-sm text-gray-600">Create a new product listing</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/admin/categories"
                  className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Manage Categories</h4>
                      <p className="text-sm text-gray-600">Organize product categories</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/admin/orders"
                  className="flex items-center justify-between p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">View All Orders</h4>
                      <p className="text-sm text-gray-600">Check order status</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  href="/admin/payments"
                  className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Payment Reports</h4>
                      <p className="text-sm text-gray-600">View transaction history</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Performance Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-4">Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm opacity-90">Order Completion Rate</span>
                    <span className="text-lg font-bold">94%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm opacity-90">Customer Satisfaction</span>
                    <span className="text-lg font-bold">4.8</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '96%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm opacity-90">Average Order Value</span>
                    <span className="text-lg font-bold">{formatCurrency(89.99)}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '78%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}