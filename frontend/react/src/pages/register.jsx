import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Registerapi } from '../server/api.js';
import './css/login.css';
import Login from './login';

function Register(){
    const navigate = useNavigate();
    const goToLogin =()=>{
        navigate('/login');
    }
    const Loginuser =()=>{
        navigate('/login');
    }
    const registercheck =async ()=>{
        const success = true; // Replace with actual register logic
        const email=document.getElementById("email").value;
        const password=document.getElementById("password").value;
        console.log(email);
        console.log(password);
        const res=await Registerapi(email, password);
        console.log(res);
        console.log('Register selected:');
        if (success) {
            navigate('/login');
    }};
    return(
            <div class="auth-container">
        <div class="auth-card register-card">
            <div class="auth-header">
                <div class="logo"></div>
                <h1>KnowMap</h1>
                <p>Create your account</p>
            </div>

            <form id="registerForm" class="auth-form">
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="Enter your email" 
                        required
                    />
                    <span class="error-message" id="emailError"></span>
                </div>

                <div class="form-group">
                    <label for="username">Username</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username" 
                        placeholder="Choose a username (min 3 chars)" 
                        minlength="3"
                        maxlength="50"
                        required
                    />
                    <span class="error-message" id="usernameError"></span>
                </div>

                <div class="form-group">
                    <label for="fullName">Full Name</label>
                    <input 
                        type="text" 
                        id="fullName" 
                        name="full_name" 
                        placeholder="Enter your full name (optional)"
                    />
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder="Create a strong password (min 8 chars)" 
                        minlength="8"
                        required
                    />
                    <span class="password-hint">Password must be at least 8 characters</span>
                    <span class="error-message" id="passwordError"></span>
                </div>

                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        name="confirm_password" 
                        placeholder="Confirm your password" 
                        required
                    />
                    <span class="error-message" id="confirmPasswordError"></span>
                </div>

                <button type="submit" class="btn-submit" onClick={registercheck}>Create Account</button>
            </form>

            <div class="auth-footer">
                <p>Already have an account? <button onClick={goToLogin}>Login here</button></p>
            </div>

            <div id="messageContainer" class="message-container"></div>
        </div>
    </div>
    )
}
export default Register;