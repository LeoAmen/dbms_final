'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

/* -------------  extended country list (incl. Middle East) ------------- */
const countryCodes = [
  /* Middle East */
  { code: '+964', name: '🇮🇶 Iraq' },
  { code: '+98', name: '🇮🇷 Iran' },
  { code: '+971', name: '🇦🇪 UAE' },
  { code: '+966', name: '🇸🇦 Saudi Arabia' },
  { code: '+962', name: '🇯🇴 Jordan' },
  { code: '+961', name: '🇱🇧 Lebanon' },
  { code: '+963', name: '🇸🇾 Syria' },
  { code: '+965', name: '🇰🇼 Kuwait' },
  { code: '+974', name: '🇶🇦 Qatar' },
  { code: '+973', name: '🇧🇭 Bahrain' },
  { code: '+968', name: '🇴🇲 Oman' },
  { code: '+967', name: '🇾🇪 Yemen' },
  { code: '+970', name: '🇵🇸 Palestine' },
  { code: '+972', name: '🇮🇱 Israel' },
  { code: '+90', name: '🇹🇷 Turkey' },

  /* Major others */
  { code: '+1', name: '🇺🇸 United States' },
  { code: '+44', name: '🇬🇧 United Kingdom' },
  { code: '+81', name: '🇯🇵 Japan' },
  { code: '+86', name: '🇨🇳 China' },
  { code: '+91', name: '🇮🇳 India' },
  { code: '+61', name: '🇦🇺 Australia' },
  { code: '+49', name: '🇩🇪 Germany' },
  { code: '+33', name: '🇫🇷 France' },
  { code: '+82', name: '🇰🇷 South Korea' },
  { code: '+60', name: '🇲🇾 Malaysia' },
  { code: '+63', name: '🇵🇭 Philippines' },
  { code: '+65', name: '🇸🇬 Singapore' },
  { code: '+66', name: '🇹🇭 Thailand' },
  { code: '+84', name: '🇻🇳 Vietnam' },
  { code: '+62', name: '🇮🇩 Indonesia' },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    countryCode: '+964',
    phone: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    birthday: '',
    gender: '',
    avatar: null,
    agree: false,
  });
  const [errors, setErrors] = useState({});
  const [strength, setStrength] = useState(0);
  const cardRef = useRef(null);
  const rippleRef = useRef(null);
  const fileInputRef = useRef(null);

  /* ------------- same animations / glass / ripple as login ------------- */
  useEffect(() => {
    cardRef.current?.classList.add('animate-fade-up');
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const onMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.03)`;
    };
    const onLeave = () => {
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
    };
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const createRipple = (e) => {
    const btn = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - btn.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - btn.offsetTop - radius}px`;
    circle.classList.add('ripple');
    rippleRef.current?.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  /* -------------  validation (owner level) ------------- */
  const validate = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agree) newErrors.agree = 'You must accept the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* -------------  submit + confetti + sound ------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      cardRef.current?.classList.add('animate-shake');
      setTimeout(() => cardRef.current?.classList.remove('animate-shake'), 500);
      return;
    }
    try {
      const res = await fetch('/api/customers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, phone: formData.countryCode + formData.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        /* confetti */
        confetti();
        /* micro pop sound (muted by default) */
        popSound();
        cardRef.current?.classList.add('animate-pulse');
        setTimeout(() => (window.location.href = '/customer/profile'), 1200);
      } else alert(data.error || 'Registration failed');
    } catch {
      alert('Network error');
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleShowPassword = () =>
    setFormData((s) => ({ ...s, showPassword: !s.showPassword }));

  const registerGoogle = () => alert('Google register coming soon!');
  const registerMicrosoft = () => alert('Microsoft register coming soon!');

  /* -------------  avatar preview ------------- */
  const handleAvatar = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((s) => ({ ...s, avatar: url }));
    }
  };

  /* -------------  confetti (CSS only) ------------- */
  const confetti = () => {
    const colors = ['#4299e1', '#ffffff', '#3182ce'];
    const container = document.createElement('div');
    container.className = 'fixed inset-0 pointer-events-none z-50';
    for (let i = 0; i < 60; i++) {
      const confettiPiece = document.createElement('div');
      confettiPiece.className = 'absolute w-3 h-3 rounded-full';
      confettiPiece.style.backgroundColor = colors[i % colors.length];
      confettiPiece.style.left = `${Math.random() * 100}%`;
      confettiPiece.style.top = `-20px`;
      confettiPiece.style.animation = `confetti-fall 1.2s ${Math.random() * 0.5}s linear forwards`;
      container.appendChild(confettiPiece);
    }
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 1500);
  };

  /* -------------  micro pop sound (Web-Audio, muted by default) ------------- */
  const popSound = () => {
    if (typeof window === 'undefined') return;
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime); // muted
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.15);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.15);
  };

  /* password strength bar color */
  const strengthColor = ['bg-gray-300', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'][strength];

  useEffect(() => {
    let score = 0;
    const { password } = formData;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    setStrength(score);
  }, [formData.password]);

  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* LEFT - HERO with big E logo */}
      <section className="hidden lg:flex items-center justify-center">
        <div className="text-center px-10">
          <div className="mx-auto mb-6 w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-5xl font-extrabold shadow-2xl shadow-blue-500/40">
            E
          </div>
          <h2 className="text-6xl font-extrabold text-gray-800 drop-shadow-xl">
            E-Shop
          </h2>
          <p className="mt-4 text-gray-600 text-xl">
            Discover amazing products at great prices.
          </p>
        </div>
      </section>

      {/* RIGHT - GLASS REGISTER + Social + Owner extras */}
      <section className="flex items-center justify-center px-6 py-12">
        <div
          ref={cardRef}
          className="relative w-full max-w-lg rounded-3xl bg-white/40 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-blue-200/50 p-10 space-y-6 transition-transform duration-300 ease-out"
        >
          {/* back link */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>

          {/* headline */}
          <div>
            <h1 className="text-5xl font-extrabold text-gray-800 drop-shadow-md">
              Create your account
            </h1>
            <p className="mt-2 text-gray-600 text-lg">
              Join us and unlock exclusive deals.
            </p>
          </div>

          {/* Social Register Buttons */}
          <div className="space-y-3">
            <button
              onClick={registerGoogle}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition px-4 py-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12.545 10.802v3.106h5.006c-.2 1.58-1.19 4.34-5.006 4.34-3.02 0-5.478-2.5-5.478-5.578 0-3.08 2.458-5.578 5.478-5.578 1.528 0 2.548.64 3.13 1.19l2.134-2.06C16.378 2.766 14.574 2 12.545 2 7.09 2 2.81 6.264 2.81 11.8 2.81 17.336 7.09 21.6 12.545 21.6c5.456 0 9.735-4.264 9.735-9.8 0-.66-.06-1.31-.18-1.94H12.545z" />
              </svg>
              <span className="text-gray-700 font-medium">Sign up with Google</span>
            </button>

            <button
              onClick={registerMicrosoft}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition px-4 py-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#00BCF2" d="M11.4 5.46 4.64 8.36l6.76 2.9 6.76-2.9-6.76-2.9zM4.64 12.5l6.76 2.9 6.76-2.9v4.84L11.4 18.3 4.64 15.34V12.5zM4.64 7.14v4.84l6.76 2.9 6.76-2.9V7.14L11.4 4.24 4.64 7.14z" />
              </svg>
              <span className="text-gray-700 font-medium">Sign up with Microsoft</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-gray-500 text-sm">
            <span className="h-px bg-gray-200 flex-1" />
            or
            <span className="h-px bg-gray-200 flex-1" />
          </div>

          {/* native register form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* glass full name */}
            <div className="relative">
              <input
                name="fullName"
                type="text"
                required
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className={`peer w-full rounded-xl bg-white/40 backdrop-blur border ${
                  errors.fullName ? 'border-red-400' : 'border-blue-200'
                } placeholder-transparent text-gray-800 px-5 py-4 focus:outline-none focus:ring-2 ${
                  errors.fullName ? 'focus:ring-red-400' : 'focus:ring-blue-400'
                } focus:border-transparent transition`}
              />
              <label className="absolute -top-2.5 left-3 translate-y-1 scale-75 bg-white px-1 text-xs text-gray-700 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:-top-2.5 peer-focus:scale-75">
                Full Name
              </label>
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* glass email */}
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className={`peer w-full rounded-xl bg-white/40 backdrop-blur border ${
                  errors.email ? 'border-red-400' : 'border-blue-200'
                } placeholder-transparent text-gray-800 px-5 py-4 focus:outline-none focus:ring-2 ${
                  errors.email ? 'focus:ring-red-400' : 'focus:ring-blue-400'
                } focus:border-transparent transition`}
              />
              <label className="absolute -top-2.5 left-3 translate-y-1 scale-75 bg-white px-1 text-xs text-gray-700 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:-top-2.5 peer-focus:scale-75">
                Email address
              </label>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            {/* glass country code + phone (same row) */}
            <div className="flex gap-3">
              {/* cool glass country select */}
              <div className="relative w-40">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-white/40 backdrop-blur border border-blue-200 text-gray-800 px-3 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition appearance-none"
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* glass phone input */}
              <div className="relative flex-1">
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`peer w-full rounded-xl bg-white/40 backdrop-blur border ${
                    errors.phone ? 'border-red-400' : 'border-blue-200'
                  } placeholder-transparent text-gray-800 px-5 py-4 focus:outline-none focus:ring-2 ${
                    errors.phone ? 'focus:ring-red-400' : 'focus:ring-blue-400'
                  } focus:border-transparent transition`}
                />
                <label className="absolute -top-2.5 left-3 translate-y-1 scale-75 bg-white px-1 text-xs text-gray-700 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:-top-2.5 peer-focus:scale-75">
                  Phone Number
                </label>
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* =====  PASSWORD FIELDS MOVED HERE  ===== */}
            {/* glass password + eye */}
            <div className="relative">
              <input
                name="password"
                type={formData.showPassword ? 'text' : 'password'}
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="peer w-full rounded-xl bg-white/40 backdrop-blur border border-blue-200 placeholder-transparent text-gray-800 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              <label className="absolute -top-2.5 left-3 translate-y-1 scale-75 bg-white px-1 text-xs text-gray-700 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:-top-2.5 peer-focus:scale-75">
                Password
              </label>
              {/* eye toggle */}
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-4 text-gray-500 hover:text-blue-600 transition"
              >
                {formData.showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.718m-6.738-6.738L3 21" />
                  </svg>
                )}
              </button>
            </div>

            {/* password strength bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Password strength</span>
                <span>{['', 'Weak', 'Fair', 'Good', 'Strong'][strength]}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className={`h-full ${
                    ['bg-gray-300', 'bg-red-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-600'][strength]
                  } transition-all duration-300`}
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* confirm password */}
            <div className="relative">
              <input
                name="confirmPassword"
                type={formData.showPassword ? 'text' : 'password'}
                required
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`peer w-full rounded-xl bg-white/40 backdrop-blur border ${
                  errors.confirmPassword ? 'border-red-400' : 'border-blue-200'
                } placeholder-transparent text-gray-800 px-5 py-4 focus:outline-none focus:ring-2 ${
                  errors.confirmPassword ? 'focus:ring-red-400' : 'focus:ring-blue-400'
                } focus:border-transparent transition`}
              />
              <label className="absolute -top-2.5 left-3 translate-y-1 scale-75 bg-white px-1 text-xs text-gray-700 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:-top-2.5 peer-focus:scale-75">
                Confirm Password
              </label>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* =====  OPTIONAL FIELDS AFTER PASSWORD  ===== */}

            {/* glass birthday picker */}
            <div className="relative">
              <input
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                className="peer w-full rounded-xl bg-white/40 backdrop-blur border border-blue-200 text-gray-800 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
              <label className="absolute -top-2.5 left-3 translate-y-1 scale-75 bg-white px-1 text-xs text-gray-700 transition-all peer-focus:-top-2.5 peer-focus:scale-75">
                Birthday (optional)
              </label>
            </div>

            {/* glass gender select */}
            <div className="relative">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="peer w-full rounded-xl bg-white/40 backdrop-blur border border-blue-200 text-gray-800 px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition appearance-none"
              >
                <option value="">Select Gender (optional)</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* glass avatar upload + preview */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer w-full rounded-xl bg-white/40 backdrop-blur border border-blue-200 px-5 py-4 flex items-center justify-between text-gray-800 hover:border-blue-400 transition"
              >
                <span>{formData.avatar ? 'Change avatar' : 'Upload avatar (optional)'}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              {formData.avatar && (
                <div className="mt-3 flex justify-center">
                  <img
                    src={formData.avatar}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                  />
                </div>
              )}
            </div>

            {/* glass terms toggle */}
            <div className="relative flex items-center gap-3">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                checked={formData.agree}
                onChange={(e) => setFormData((s) => ({ ...s, agree: e.target.checked }))}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="agree" className="text-sm text-gray-700">
                I agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms and Conditions
                </Link>
              </label>
              {errors.agree && (
                <p className="text-xs text-red-500 absolute -bottom-5 left-0">{errors.agree}</p>
              )}
            </div>

            {/* ripple button */}
            <div ref={rippleRef} className="relative overflow-hidden rounded-xl">
              <button
                type="submit"
                onClick={createRipple}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-blue-500/40 active:scale-[0.97] transition-transform"
              >
                Create account
              </button>
            </div>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>

      {/* ------ styles ------ */}
      <style jsx global>{`
        .animate-fade-up {
          opacity: 0;
          transform: translateY(40px);
          animation: fade-up 0.8s ease-out forwards;
        }
        @keyframes fade-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-pulse {
          animation: pulse 0.6s ease-in-out;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 600ms linear;
          background-color: rgba(255, 255, 255, 0.7);
        }
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        /* confetti fall */
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </main>
  );
}