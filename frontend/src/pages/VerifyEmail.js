// frontend/src/pages/VerifyEmail.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  // Get token from URL and verify
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    // If no token, show error
    if (!token) {
      setLoading(false);
      setError('Invalid verification link. No token provided.');
      return;
    }

    // Verify email with token
    const verifyEmail = async () => {
      try {
        const res = await axios.post('/api/auth/verify-email', { token });
        setVerified(true);
        setEmail(res.data.email || '');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login?verified=true');
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to verify email.');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [location, navigate]);

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!email) {
      setError('Please provide your email address to resend the verification link.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/api/auth/resend-verification', { email });
      setError('');
      setLoading(false);
      alert('Verification email has been resent. Please check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email.');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm mt-5">
            <div className="card-body p-5 text-center">
              {loading ? (
                <>
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Verifying your email address...</p>
                </>
              ) : verified ? (
                <>
                  <div className="mb-4">
                    <i className="bi bi-check-circle text-success display-1"></i>
                  </div>
                  <h4 className="mb-3">Email Verified Successfully</h4>
                  <p className="mb-4">
                    Your email address <strong>{email}</strong> has been successfully verified.
                    You can now log in to your account.
                  </p>
                  <p className="text-muted small mb-4">
                    Redirecting to login page in a few seconds...
                  </p>
                  <div className="d-grid">
                    <Link to="/login" className="btn btn-primary">
                      Go to Login
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <i className="bi bi-exclamation-triangle text-danger display-1"></i>
                  </div>
                  <h4 className="mb-3">Email Verification Failed</h4>
                  <p className="mb-4 text-danger">
                    {error || 'There was a problem verifying your email address.'}
                  </p>
                  <p>
                    This may be because:
                  </p>
                  <ul className="text-start mb-4">
                    <li>The verification link has expired</li>
                    <li>The verification link has already been used</li>
                    <li>The verification link is invalid</li>
                  </ul>

                  {email ? (
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-primary" 
                        onClick={handleResendVerification}
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Resend Verification Email'}
                      </button>
                      <Link to="/login" className="btn btn-outline-secondary">
                        Return to Login
                      </Link>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <p>If you need a new verification link, please sign in with your email address.</p>
                      <div className="d-grid">
                        <Link to="/login" className="btn btn-primary">
                          Go to Login
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;