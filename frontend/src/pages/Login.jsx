import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700">
      <div className="bg-white p-10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] w-full max-w-[400px] max-sm:px-5 max-sm:py-8">
        <div className="text-center mb-6">
          <svg className="max-w-[200px] h-auto inline-block" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
            <path d="M 30 20 Q 80 10 120 40" stroke="#FF8C42" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <path d="M 120 40 Q 140 60 130 75" stroke="#FF8C42" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <text x="10" y="65" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="#1E3A8A">ProSafe</text>
            <text x="110" y="75" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#1E3A8A">Automation</text>
          </svg>
        </div>
        <h1 className="text-center text-indigo-500 mb-2.5 text-2xl max-sm:text-xl">ProSafe Work Management</h1>
        <h2 className="text-center text-gray-800 mb-8 text-xl max-sm:text-lg">Login</h2>

        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-5 border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-gray-800 font-medium">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_5px_rgba(102,126,234,0.3)] text-sm transition-colors box-border"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-gray-800 font-medium">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_5px_rgba(102,126,234,0.3)] text-sm transition-colors box-border"
            />
          </div>

          <button type="submit" disabled={loading} className="w-full p-3 bg-gradient-to-br from-indigo-500 to-purple-700 text-white border-none rounded text-base font-semibold cursor-pointer transition-all hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_5px_15px_rgba(102,126,234,0.4)] disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-500">
          Don't have an account? <Link to="/signup" className="text-indigo-500 no-underline font-semibold hover:underline">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
