import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loginapi } from '../server/api.js';
import './css/login.css';

function Login() {
  const navigate = useNavigate();

  const logincheck = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const res = await Loginapi(email, password);
      if (res && res.status === 'success') {
        navigate('/dashboard');
      } else {
        // TODO: surface a nice inline error message
        console.error('Login failed:', res);
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card login-card">
          <div className="auth-header">
            <div className="logo">KM</div>
            <h1>KnowMap</h1>
            <p>Intelligent Knowledge Mapping Studio</p>
          </div>

          <form id="loginForm" className="auth-form" onSubmit={logincheck}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
              />
              <span className="error-message" id="emailError" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
              />
              <span className="error-message" id="passwordError" />
            </div>

            <button type="submit" className="btn-submit">
              Login
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{' '}
              <button type="button" onClick={goToRegister}>
                Register here
              </button>
            </p>
            <button type="button" className="forgot-password">
              Forgot password?
            </button>
          </div>

          <div id="messageContainer" className="message-container" />
        </div>
      </div>
    </div>
  );
}

export default Login;
