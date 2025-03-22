// frontend/src/pages/Login.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import useForm from '../hooks/useForm';
import { validateLoginForm } from '../utils/validators';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, error: authError, clearErrors } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('');

  // Initialize form with validation
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setErrors
  } = useForm(
    { email: '', password: '' },
    validateLoginForm,
    onSubmit
  );

  // Handle form submission
  async function onSubmit(formData) {
    try {
      await login(formData);
      // Login is handled by the AuthContext, which will update isAuthenticated
    } catch (err) {
      console.error('Login error:', err);
    }
  }

  // Show error from auth context
  useEffect(() => {
    if (authError) {
      setAlertMessage(authError);
      setAlertType('danger');
    }
  }, [authError]);

  // Check for redirect message in URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const session = params.get('session');
    const verified = params.get('verified');
    const passwordReset = params.get('passwordReset');

    if (session === 'expired') {
      setAlertMessage('Your session has expired. Please login again.');
      setAlertType('warning');
    } else if (verified === 'true') {
      setAlertMessage('Email verified successfully. You can now log in.');
      setAlertType('success');
    } else if (passwordReset === 'true') {
      setAlertMessage('Password reset successfully. You can now log in with your new password.');
      setAlertType('success');
    }
  }, [location]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location]);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Dismiss alert
  const dismissAlert = () => {
    setAlertMessage('');
    setAlertType('');
    clearErrors();
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm mt-5">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="h4 fw-bold">Sign In</h2>
                <p className="text-muted">Welcome back to Monitoring System</p>
              </div>

              {alertMessage && (
                <div className={`alert alert-${alertType} alert-dismissible fade show`} role="alert">
                  {alertMessage}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={dismissAlert}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className={`form-control ${touched.email && errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="name@example.com"
                      required
                    />
                    {touched.email && errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <label htmlFor="password" className="form-label">Password</label>
                    <Link to="/forgot-password" className="small text-decoration-none">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={togglePasswordVisibility}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                    {touched.password && errors.password && (
                      <div className="invalid-feedback">{errors.password}</div>
                    )}
                  </div>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Don't have an account? <Link to="/register" className="text-decoration-none">Sign up</Link>
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-3">
            <Link to="/public/status/demo" className="text-decoration-none">
              <i className="bi bi-arrow-left me-1"></i> View Demo Status Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;