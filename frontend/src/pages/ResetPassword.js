// frontend/src/pages/ResetPassword.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenChecked, setTokenChecked] = useState(false);

  const { password, confirmPassword } = formData;

  // Get token from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    
    if (!urlToken) {
      setTokenValid(false);
      setTokenChecked(true);
      return;
    }

    // Verify token
    const verifyToken = async () => {
      try {
        // Check if token is valid
        await axios.post('/api/auth/verify-reset-token', { token: urlToken });
        setToken(urlToken);
        setTokenValid(true);
      } catch (err) {
        setTokenValid(false);
      } finally {
        setTokenChecked(true);
      }
    };

    verifyToken();
  }, [location]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Validate form
  const validateForm = () => {
    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      await axios.post('/api/auth/reset-password', {
        token,
        password
      });

      setSuccess(true);
      setLoading(false);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login?passwordReset=true');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      setLoading(false);
    }
  };

  // Show loading state while verifying token
  if (!tokenChecked) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5 text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Verifying reset link...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm mt-5">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <i className="bi bi-exclamation-triangle text-danger display-1"></i>
                </div>
                <h4 className="mb-3">Invalid or Expired Link</h4>
                <p className="mb-4">
                  This password reset link is invalid or has expired. Please request a new password reset link.
                </p>
                <div className="d-grid gap-2">
                  <Link to="/forgot-password" className="btn btn-primary">
                    Request New Reset Link
                  </Link>
                  <Link to="/login" className="btn btn-outline-secondary">
                    Return to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm mt-5">
            <div className="card-body p-5">
              {success ? (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <i className="bi bi-check-circle text-success display-1"></i>
                  </div>
                  <h4 className="mb-3">Password Reset Successfully</h4>
                  <p className="mb-4">
                    Your password has been reset successfully. You can now log in with your new password.
                  </p>
                  <p className="text-muted small mb-4">
                    Redirecting to login page in a few seconds...
                  </p>
                  <div className="d-grid">
                    <Link to="/login" className="btn btn-primary">
                      Go to Login
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <h2 className="h4 fw-bold">Reset Your Password</h2>
                    <p className="text-muted">Create a new password for your account</p>
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">New Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${error && !password ? 'is-invalid' : ''}`}
                          id="password"
                          name="password"
                          value={password}
                          onChange={handleChange}
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={togglePasswordVisibility}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                      <div className="form-text">
                        Password must be at least 8 characters long
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${error && password !== confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                          required
                        />
                      </div>
                    </div>

                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Resetting Password...
                          </>
                        ) : (
                          'Reset Password'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;