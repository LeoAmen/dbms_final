'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  
  // Enhanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // grid or table
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    totalOrders: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/admin/customers');
      
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      
      const data = await response.json();
      setCustomers(data);
      
      // Calculate stats
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
      setError('Failed to load customers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customersData) => {
    const total = customersData.length;
    const newThisMonth = customersData.filter(customer => {
      const createdDate = new Date(customer.CREATED_DATE);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length;
    
    // For now, we'll assume all are active (you can add active/inactive logic later)
    const active = customersData.length;
    
    // Sum total orders (assuming each customer has ORDER_COUNT property)
    const totalOrders = customersData.reduce((sum, customer) => 
      sum + (customer.ORDER_COUNT || 0), 0);
    
    setStats({
      total,
      active,
      newThisMonth,
      totalOrders
    });
  };

  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(customer => {
      const matchesSearch = 
        customer.FULLNAME?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.PHONE?.includes(searchTerm);
      
      let matchesFilter = true;
      if (filterBy === 'with-orders') {
        matchesFilter = (customer.ORDER_COUNT || 0) > 0;
      } else if (filterBy === 'no-orders') {
        matchesFilter = (customer.ORDER_COUNT || 0) === 0;
      } else if (filterBy === 'recent') {
        const createdDate = new Date(customer.CREATED_DATE);
        const now = new Date();
        const daysDiff = (now - createdDate) / (1000 * 60 * 60 * 24);
        matchesFilter = daysDiff <= 30; // Last 30 days
      }
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = (a.FULLNAME || '').localeCompare(b.FULLNAME || '');
          break;
        case 'orders':
          comparison = (a.ORDER_COUNT || 0) - (b.ORDER_COUNT || 0);
          break;
        case 'date':
          comparison = new Date(a.CREATED_DATE) - new Date(b.CREATED_DATE);
          break;
        case 'email':
          comparison = (a.EMAIL || '').localeCompare(b.EMAIL || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [customers, searchTerm, filterBy, sortBy, sortOrder]);

  const deleteCustomer = async (customerId) => {
    try {
      setDeleteError('');
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete customer');
      }
      
      setCustomers(customers.filter(c => c.CUSTOMER_ID !== customerId));
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
      setDeleteConfirm(null);
      calculateStats(customers.filter(c => c.CUSTOMER_ID !== customerId));
    } catch (error) {
      console.error('Error deleting customer:', error);
      setDeleteError(error.message);
    }
  };

  const handleDeleteClick = (customer) => {
    if (customer.ORDER_COUNT > 0) {
      setDeleteError(`Cannot delete "${customer.FULLNAME}" because they have ${customer.ORDER_COUNT} order(s).`);
      return;
    }
    setDeleteConfirm(customer);
  };

  const toggleSelectCustomer = (customerId) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
    }
  };

  const selectAllCustomers = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.CUSTOMER_ID));
    }
  };

  const bulkDelete = async () => {
    if (selectedCustomers.length === 0) return;
    
    const customersWithOrders = filteredCustomers.filter(c => 
      selectedCustomers.includes(c.CUSTOMER_ID) && (c.ORDER_COUNT || 0) > 0
    );
    
    if (customersWithOrders.length > 0) {
      setDeleteError(`Cannot delete ${customersWithOrders.length} customer(s) because they have orders.`);
      return;
    }
    
    try {
      const promises = selectedCustomers.map(id =>
        fetch(`/api/admin/customers/${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(promises);
      setCustomers(customers.filter(c => !selectedCustomers.includes(c.CUSTOMER_ID)));
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      setDeleteError('Failed to delete selected customers');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Orders', 'Created Date'];
    const rows = filteredCustomers.map(customer => [
      customer.CUSTOMER_ID,
      customer.FULLNAME,
      customer.EMAIL,
      customer.PHONE || 'N/A',
      customer.ORDER_COUNT || 0,
      new Date(customer.CREATED_DATE).toLocaleDateString()
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    setShowExportModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-xl text-gray-700 font-semibold">Loading customers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Customer Management
              </h1>
              <p className="text-gray-600 mt-2">Manage and view all registered customers</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button 
                onClick={() => window.open('/register', '_blank')}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Add Customer
              </button>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {deleteError && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-yellow-800">{deleteError}</span>
              </div>
              <button onClick={() => setDeleteError('')} className="text-yellow-600 hover:text-yellow-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Customers</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.623a10.953 10.953 0 01-.671 3.218m-1.288 2.866a15.982 15.982 0 01-2.514 2.511" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Active Customers</p>
                <p className="text-3xl font-bold">{stats.active}</p>
              </div>
              <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">New This Month</p>
                <p className="text-3xl font-bold">{stats.newThisMonth}</p>
              </div>
              <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders}</p>
              </div>
              <svg className="w-12 h-12 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search */}
            <div className="md:col-span-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter */}
            <div className="md:col-span-3">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="all">All Customers</option>
                <option value="with-orders">With Orders</option>
                <option value="no-orders">No Orders</option>
                <option value="recent">New (Last 30 days)</option>
              </select>
            </div>

            {/* Sort */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              >
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="orders">Sort by Orders</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="md:col-span-1 flex gap-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedCustomers.length > 0 && (
            <div className="mt-4 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedCustomers.length === filteredCustomers.length}
                  onChange={selectAllCustomers}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-blue-700 font-medium">
                  {selectedCustomers.length} customer(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={bulkDelete}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedCustomers([])}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <tr>
                <th className="text-left p-4 font-semibold w-12">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                    onChange={selectAllCustomers}
                    className="h-4 w-4"
                  />
                </th>
                <th className="text-left p-4 font-semibold">ID</th>
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Phone</th>
                <th className="text-left p-4 font-semibold">Orders</th>
                <th className="text-left p-4 font-semibold">Registered</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.623a10.953 10.953 0 01-.671 3.218m-1.288 2.866a15.982 15.982 0 01-2.514 2.511" />
                    </svg>
                    <h3 className="text-xl font-semibold mb-2">No Customers Found</h3>
                    <p>Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer, index) => (
                  <tr key={customer.CUSTOMER_ID} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.CUSTOMER_ID)}
                        onChange={() => toggleSelectCustomer(customer.CUSTOMER_ID)}
                        className="h-4 w-4"
                      />
                    </td>
                    <td className="p-4 font-mono text-sm">{customer.CUSTOMER_ID}</td>
                    <td className="p-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {customer.FULLNAME?.charAt(0).toUpperCase() || 'C'}
                          </span>
                        </div>
                        {customer.FULLNAME}
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">{customer.EMAIL}</td>
                    <td className="p-4 text-gray-700">
                      {customer.PHONE || <span className="text-gray-400">Not provided</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (customer.ORDER_COUNT || 0) > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {customer.ORDER_COUNT || 0}
                        {(customer.ORDER_COUNT || 0) > 0 && (
                          <Link 
                            href={`/admin/orders?customer=${customer.CUSTOMER_ID}`}
                            className="ml-1 text-blue-600 hover:underline"
                          >
                            view
                          </Link>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">
                      {new Date(customer.CREATED_DATE).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(customer.CREATED_DATE).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteClick(customer)}
                          disabled={(customer.ORDER_COUNT || 0) > 0}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            (customer.ORDER_COUNT || 0) > 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination/Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Previous</button>
            <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200">Next</button>
          </div>
        </div>

        {/* Delete Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Customer?</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.FULLNAME}"</span>?
                  This action cannot be undone.
                </p>
                {(deleteConfirm.ORDER_COUNT || 0) > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 text-yellow-700 rounded-lg">
                    ⚠️ This customer has {deleteConfirm.ORDER_COUNT} order(s)
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteCustomer(deleteConfirm.CUSTOMER_ID)}
                  disabled={(deleteConfirm.ORDER_COUNT || 0) > 0}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                    (deleteConfirm.ORDER_COUNT || 0) > 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Export Customers</h3>
              <p className="text-gray-600 mb-6">
                Export {filteredCustomers.length} customers to your preferred format
              </p>
              <div className="space-y-3">
                <button
                  onClick={exportToCSV}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  📄 Export as CSV
                </button>
                <button
                  onClick={() => {
                    // JSON export
                    const dataStr = JSON.stringify(filteredCustomers, null, 2);
                    const blob = new Blob([dataStr], { type: 'application/json' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `customers_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    setShowExportModal(false);
                  }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  📊 Export as JSON
                </button>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}