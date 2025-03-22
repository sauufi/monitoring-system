// frontend/src/pages/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await axios.post('/api/auth/forgot-password', { email });
      
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm mt-5">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="h4 fw-bold">Reset Your Password</h2>
                <p className="text-muted">Enter your email to receive a password reset link</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              {success ? (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <i className="bi bi-envelope-check text-success display-1"></i>
                  </div>
                  <h4 className="mb-3">Check Your Email</h4>
                  <p className="mb-4">
                    We've sent a password reset link to <strong>{email}</strong>. 
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                  <p className="text-muted small mb-4">
                    If you don't see the email, please check your spam folder.
                  </p>
                  <div className="d-grid gap-2">
                    <Link to="/login" className="btn btn-outline-primary">
                      Return to Login
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className={`form-control ${error ? 'is-invalid' : ''}`}
                        id="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="d-grid mb-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      <i className="bi bi-arrow-left me-1"></i>
                      Back to Login
                    </Link>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;