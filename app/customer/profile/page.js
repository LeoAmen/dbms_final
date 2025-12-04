'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);
  const router = useRouter();

  /* gentle fade-up on first view */
  useEffect(() => {
    const customerData = localStorage.getItem('customer');
    if (customerData) {
      setCustomer(JSON.parse(customerData));
    }
    setLoading(false);
    cardRef.current?.classList.add('animate-fade-up');
  }, []);

  /* subtle 3-D lift on hover (same as login/register) */
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) scale(1.02)`;
    };
    const onLeave = () => (card.style.transform = '');
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('customer');
    router.push('/');
  };

  if (loading) return <div className="min-h-screen grid place-content-center text-gray-600">Loading...</div>;
  if (!customer) return <div className="min-h-screen grid place-content-center text-gray-600">Please log in to view your profile.</div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* glass breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:underline">Home</Link> › Profile
        </div>

        {/* headline */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-800 drop-shadow-md">My Profile</h1>
          <p className="mt-2 text-lg text-gray-600">Welcome back, {customer.FULLNAME}!</p>
        </div>

        {/* glass card (lift on hover) */}
        <div
          ref={cardRef}
          className="rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-blue-200/50 p-10 space-y-8 transition-transform duration-300 ease-out"
        >
          {/* avatar with gradient ring */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 blur-sm"></div>
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-4xl font-extrabold shadow-lg">
                {customer.FULLNAME?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* info grid */}
          <div className="grid md:grid-cols-2 gap-6 text-gray-800">
            <div>
              <label className="text-sm font-semibold text-blue-600">Full Name</label>
              <p className="mt-1 text-xl">{customer.FULLNAME}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-600">Email</label>
              <p className="mt-1 text-xl">{customer.EMAIL}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-600">Phone</label>
              <p className="mt-1 text-xl">{customer.PHONE || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-blue-600">Member Since</label>
              <p className="mt-1 text-xl">{new Date(customer.CREATED_DATE).toLocaleDateString()}</p>
            </div>
          </div>

          {/* big friendly buttons (same shadows as home) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <Link href="/cart" className="text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 active:scale-[0.97] transition-transform">
              View Cart
            </Link>
            <Link href="/orders" className="text-center bg-white border border-gray-300 hover:border-blue-400 hover:shadow-md text-gray-700 font-bold py-3 px-6 rounded-xl shadow-sm active:scale-[0.97] transition-transform">
              Order History
            </Link>
            <Link href="/payment/history" className="text-center bg-white border border-gray-300 hover:border-blue-400 hover:shadow-md text-gray-700 font-bold py-3 px-6 rounded-xl shadow-sm active:scale-[0.97] transition-transform">
              Payment History
            </Link>
            <button
              onClick={handleLogout}
              className="text-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-500/30 active:scale-[0.97] transition-transform"
            >
              Logout
            </button>
          </div>

          {/* secondary row (smaller) */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/customer/edit" className="flex-1 text-center bg-white border border-gray-300 hover:border-blue-400 hover:shadow-md text-gray-700 font-bold py-3 px-6 rounded-xl shadow-sm active:scale-[0.97] transition-transform">
              Edit Profile
            </Link>
            <Link href="/customer/change-password" className="flex-1 text-center bg-white border border-gray-300 hover:border-blue-400 hover:shadow-md text-gray-700 font-bold py-3 px-6 rounded-xl shadow-sm active:scale-[0.97] transition-transform">
              Change Password
            </Link>
          </div>
        </div>
      </div>

      {/* ------ micro animations ------ */}
      <style jsx global>{`
        .animate-fade-up {
          opacity: 0;
          transform: translateY(30px);
          animation: fade-up 0.8s ease-out forwards;
        }
        @keyframes fade-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}