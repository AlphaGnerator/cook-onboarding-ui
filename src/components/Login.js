// In src/components/Login.js (CORRECTED)

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://odc-api-289803954008.asia-south1.run.app/api';

function Login({ onLoginSuccess }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ phone_number: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const payload = {
                username: formData.phone_number,
                password: formData.password
            };
            const response = await axios.post(`${API_URL}/auth/login/`, payload);
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            
            // This now correctly calls the function from App.js without any arguments.
            // App.js will now take over and fetch the user's profile.
            onLoginSuccess(); 

        } catch (err) {
            setError('Invalid Phone Number or Password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="form-wrapper">
                <h2>Welcome Back, Cook!</h2>
                <p>Sign in with your phone number to manage your schedule.</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="phone_number">Phone Number</label>
                        <input 
                            id="phone_number" 
                            name="phone_number" 
                            type="tel" 
                            placeholder="Your 10-digit mobile number" 
                            value={formData.phone_number} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password" 
                            name="password" 
                            type="password" 
                            placeholder="Your Password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    {error && <p className="error-message" style={{color: '#D93025', fontSize: '14px', textAlign: 'center'}}>{error}</p>}
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                <p className="small-link">
                    New Cook? <button type="button" onClick={() => navigate('/signup')} className="link-button">Create an Account</button>
                </p>
            </div>
        </div>
    );
}

export default Login;

