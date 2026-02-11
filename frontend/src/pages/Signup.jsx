import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    department: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup(formData.username, formData.email, formData.password, formData.full_name, formData.department);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_5px_rgba(102,126,234,0.3)] text-sm transition-colors box-border";

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700 p-5">
      <div className="bg-white p-10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] w-full max-w-[450px] max-sm:px-5 max-sm:py-8">
        <h1 className="text-center text-indigo-500 mb-2.5 text-2xl max-sm:text-xl">ProSafe Work Management</h1>
        <h2 className="text-center text-gray-800 mb-8 text-xl max-sm:text-lg">Create Account</h2>

        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-5 border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit}>
          {[
            { id: 'full_name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name', required: true },
            { id: 'username', label: 'Username', type: 'text', placeholder: 'Choose a username', required: true },
            { id: 'email', label: 'Email', type: 'email', placeholder: 'Enter your email', required: true },
            { id: 'department', label: 'Department', type: 'text', placeholder: 'Enter your department' },
            { id: 'password', label: 'Password', type: 'password', placeholder: 'Enter password (min 6 characters)', required: true },
            { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm your password', required: true },
          ].map(field => (
            <div key={field.id} className="mb-4">
              <label htmlFor={field.id} className="block mb-2 text-gray-800 font-medium">{field.label}</label>
              <input
                type={field.type}
                id={field.id}
                name={field.id}
                value={formData[field.id]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                className={inputClass}
              />
            </div>
          ))}

          <button type="submit" disabled={loading} className="w-full p-3 mt-2.5 bg-gradient-to-br from-indigo-500 to-purple-700 text-white border-none rounded text-base font-semibold cursor-pointer transition-all hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_5px_15px_rgba(102,126,234,0.4)] disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-500">
          Already have an account? <Link to="/login" className="text-indigo-500 no-underline font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
