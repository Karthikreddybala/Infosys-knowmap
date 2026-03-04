import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Registerapi } from '../server/api.js';
import './css/login.css';

function Register() {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  const registercheck = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      console.error('Password and confirm password do not match');
      return;
    }

    try {
      const res = await Registerapi(email, password);
      if (res?.status === 'success') {
        navigate('/login');
      } else {
        console.error('Registration failed:', res);
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="logo">KM</div>
            <h1>KnowMap</h1>
            <p>Create your account</p>
          </div>

          <form id="registerForm" className="auth-form" onSubmit={registercheck}>
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
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Choose a username (min 3 chars)"
                minLength={3}
                maxLength={50}
                required
              />
              <span className="error-message" id="usernameError" />
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="full_name"
                placeholder="Enter your full name (optional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a strong password (min 8 chars)"
                minLength={8}
                required
              />
              <span className="password-hint">
                Password must be at least 8 characters
              </span>
              <span className="error-message" id="passwordError" />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirm_password"
                placeholder="Confirm your password"
                required
              />
              <span className="error-message" id="confirmPasswordError" />
            </div>

            <button type="submit" className="btn-submit">
              Create Account
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <button type="button" onClick={goToLogin}>
                Login here
              </button>
            </p>
          </div>

          <div id="messageContainer" className="message-container" />
        </div>
      </div>
    </div>
  );
}

export default Register;
