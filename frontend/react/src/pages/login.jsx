import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Loginapi } from '../server/api.js';
import './css/login.css';
// 
function Login(){
    const navigate = useNavigate();
    const logincheck =async (e)=>{
        e.preventDefault(); // Prevent form submission
        const email=document.getElementById("email").value;
        const password=document.getElementById("password").value;
        // const loginfail=document.querySelector('.loginfail');
        
        // Clear previous error message
        // loginfail.style.display='none';
        
        console.log('Login attempt with:', email, password);
        
        try {
            const res=await Loginapi(email, password);
            console.log('Login response:', res);
            
            if (res && res.status==='success') {
                console.log('Login successful, navigating to dashboard');
                navigate('/dashboard');
            }
            else {
                console.log('Login failed');
                // loginfail.style.display='block';
            }
        } catch (error) {
            console.error('Login error:', error);
            // loginfail.style.display='block';
        }
    }
    function register(){
        navigate('/register');
    }


    return(
        <div class="auth-container">
        <div class="auth-card login-card">
            <div class="auth-header">
                <div class="logo"></div>
                <h1>KnowMap</h1>
                <p>Intelligent Knowledge Mapping</p>
            </div>

            <form id="loginForm" class="auth-form">
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
                    <label for="password">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder="Enter your password" 
                        required
                    />
                    <span class="error-message" id="passwordError"></span>
                </div>

                <button type="submit" class="btn-submit" onClick={logincheck}>Login</button>
            </form>

            <div class="auth-footer">
                <p>Don't have an account? <button onClick={register}>Register here</button></p>
                <a href="#" class="forgot-password">Forgot password?</a>
            </div>

            <div id="messageContainer" class="message-container"></div>
        </div>
    </div>

  );
};
export default Login;