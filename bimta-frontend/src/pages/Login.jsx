import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Common/Button';
import { IoLockClosed, IoPerson, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import bimtaLogo from '../assets/BIMTALOGO.svg';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    user_id: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#407549] opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#FCE8AB] opacity-40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-[#407549] opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-1/3 w-64 h-64 bg-[#FCE8AB] opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-[#407549] opacity-25 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Login Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white bg-opacity-95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10">
            
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#407549] to-[#5a9764] rounded-2xl blur-xl opacity-40"></div>
                <img 
                  src={bimtaLogo}
                  alt="BIMTA Logo" 
                  className="relative h-20 w-auto"
                />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Login Admin
              </h1>
              <p className="text-gray-600">
                Silakan masuk ke sistem BIMTA
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl mb-6 flex items-start animate-shake">
                <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* User ID Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User ID
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <IoPerson className="text-gray-400 group-focus-within:text-[#407549] transition-colors" size={20} />
                  </div>
                  <input
                    type="text"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    placeholder="Masukkan User ID"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#407549] focus:border-transparent focus:bg-white transition-all duration-200 outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <IoLockClosed className="text-gray-400 group-focus-within:text-[#407549] transition-colors" size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan Password"
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#407549] focus:border-transparent focus:bg-white transition-all duration-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-[#407549] transition-colors"
                  >
                    {showPassword ? (
                      <IoEyeOffOutline size={20} />
                    ) : (
                      <IoEyeOutline size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  'Masuk'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              © 2025 BIMTA. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;