'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalSpent: 0,
    completedPayments: 0,
    pendingPayments: 0
  });

  useEffect(() => {
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      const customerObj = JSON.parse(customerData);
      setCustomer(customerObj);
      fetchPaymentHistory(customerObj.CUSTOMER_ID || customerObj.customer_id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPaymentHistory = async (customerId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('customerToken');
      const response = await fetch(`/api/payments/customer/${customerId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (!response.ok) throw new Error('Failed to fetch payment history');
      
      const data = await response.json();
      setPayments(data);
      
      // Calculate statistics
      const totalSpent = data
        .filter(p => p.STATUS === 'COMPLETED')
        .reduce((sum, p) => sum + parseFloat(p.AMOUNT), 0);
      
      const completedPayments = data.filter(p => p.STATUS === 'COMPLETED').length;
      const pendingPayments = data.filter(p => p.STATUS === 'PENDING').length;
      
      setStats({ totalSpent, completedPayments, pendingPayments });
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.STATUS === filter.toUpperCase();
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'credit_card':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'paypal':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.59 4.69a.641.641 0 0 1 .632-.542h3.676a3.92 3.92 0 0 1 3.885 3.434 3.066 3.066 0 0 1 1.152-.222h3.162c3.386 0 5.314 1.562 5.314 4.82 0 3.26-2.029 4.821-5.314 4.821h-2.92a.8.8 0 0 0-.788.675l-.723 4.607a.8.8 0 0 1-.788.675zm-1.706-2.56h1.083a.8.8 0 0 0 .788-.675l.72-4.607a.8.8 0 0 1 .788-.675h1.342c1.293 0 2.314-.6 2.314-1.802s-1.021-1.802-2.314-1.802h-2.92a.8.8 0 0 0-.788.675l-.723 4.607a.8.8 0 0 1-.788.675H4.238l-.868 5.536z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6 h-32"></div>
              ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Sign In Required</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Please log in to view your payment history.</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">Track your payment transactions and history</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Lifetime spending</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Completed Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedPayments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Successful transactions</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Awaiting processing</p>
          </div>
        </div>

        {/* Payment History Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Transaction History</h2>
                <p className="text-sm text-gray-600">{filteredPayments.length} transactions found</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  {['all', 'completed', 'pending'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                        filter === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => customer && fetchPaymentHistory(customer.CUSTOMER_ID || customer.customer_id)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {filter === 'all' 
                  ? "You haven't made any payments yet." 
                  : `No ${filter} payments found in your history.`}
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all transactions
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Transaction</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Order</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Method</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.PAYMENT_ID} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-mono text-sm font-medium text-gray-900">#{payment.PAYMENT_ID}</div>
                          <div className="text-xs text-gray-500 mt-1">Transaction ID</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <a 
                          href={`/orders/${payment.ORDER_ID}`}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
                        >
                          Order #{payment.ORDER_ID}
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-lg font-semibold text-gray-900">{formatCurrency(payment.AMOUNT)}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          {getPaymentMethodIcon(payment.PAYMENT_METHOD)}
                          <span className="ml-2 font-medium text-gray-900 capitalize">
                            {payment.PAYMENT_METHOD?.replace('_', ' ') || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.PAYMENT_DATE).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(payment.PAYMENT_DATE).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          payment.STATUS === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800'
                            : payment.STATUS === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : payment.STATUS === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.STATUS === 'COMPLETED' && (
                            <svg className="mr-1.5 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {payment.STATUS || 'UNKNOWN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Footer */}
          {filteredPayments.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Showing {filteredPayments.length} of {payments.length} total transactions
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total displayed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(filteredPayments.reduce((sum, p) => sum + parseFloat(p.AMOUNT), 0))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}