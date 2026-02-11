import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Login.css';

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
    <div className="login-container">
      <div className="login-box">
        <div className="logo-section">
          <svg className="logo-svg" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
            {/* Orange curved line */}
            <path d="M 30 20 Q 80 10 120 40" stroke="#FF8C42" strokeWidth="8" fill="none" strokeLinecap="round"/>
            <path d="M 120 40 Q 140 60 130 75" stroke="#FF8C42" strokeWidth="8" fill="none" strokeLinecap="round"/>
            
            {/* ProSafe Text */}
            <text x="10" y="65" fontFamily="Arial, sans-serif" fontSize="32" fontWeight="bold" fill="#1E3A8A">
              ProSafe
            </text>
            
            {/* Automation Text */}
            <text x="110" y="75" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" fill="#1E3A8A">
              Automation
            </text>
          </svg>
        </div>
        <h1>ProSafe Work Management</h1>
        <h2>Login</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
