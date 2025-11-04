// In admin-panel/src/App.js (FINAL, CONSOLIDATED, AND CORRECTED)

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Signup from './components/Signup'; 
import Login from './components/Login';   
import Dashboard from './components/Dashboard';
import RecipeGuide from './components/RecipeGuide';
import SetAvailability from './components/SetAvailability';
import './App.css';
import MainLayout from './components/MainLayout';

const API_URL = 'https://odc-api-289803954008.asia-south1.run.app/api';

// --- AUTHENTICATION HOOK (CORRECTLY SCOPED) ---
const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Define handleLogout
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
        setUserProfile(null);
    };

    // 2. Define handleLoginSuccess (handles profile fetch immediately after login)
    const handleLoginSuccess = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            handleLogout(); 
            return;
        }
        try {
            // Fetch the cook's profile using the new token
            const response = await axios.get(`${API_URL}/cook-dashboard/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserProfile(response.data);
            setIsLoggedIn(true); // Set state AFTER receiving profile data
        } catch (error) {
            // If fetching the profile fails (e.g., bad token), log them out.
            handleLogout();
        }
    };

    // 3. Define the initial fetch logic (runs on app load)
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${API_URL}/cook-dashboard/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserProfile(response.data);
                setIsLoggedIn(true);
            } catch (error) {
                // If saved token is invalid on load
                handleLogout(); 
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [handleLogout]); // Added handleLogout to dep array for clean behavior

    return { isLoggedIn, userProfile, isLoading, handleLoginSuccess, handleLogout };
};

// --- LANDING PAGE COMPONENT ---
const Portal = () => {
    const navigate = useNavigate();
    return (
        <div className="portal-fullpage-container">
            <div className="portal-header">
                <h1>Welcome to Culinary Canvas</h1>
                <p>Your one-stop platform to connect with talented cooks or to offer your own culinary expertise.</p>
            </div>
            <div className="portal-cards-container">
                {/* Customer Portal Card (Placeholder) */}
                <div className="portal-card">
                    <div className="card-icon customer-icon">👤</div>
                    <h2>Customer Portal</h2>
                    <p>Find and book talented cooks, discover new recipes, and get personalized meal plans.</p>
                    <button className="portal-button customer-button" disabled>Enter Customer Portal</button>
                </div>

                {/* Cook Portal Card (Main entry point) */}
                <div className="portal-card">
                    <div className="card-icon cook-icon">🍳</div>
                    <h2>Cook Portal</h2>
                    <p>Manage your schedule, showcase your skills, and connect with customers.</p>
                    <button className="portal-button cook-button" onClick={() => navigate('/login')}>Enter Cook Portal</button>
                </div>
            </div>
            <div className="admin-login-link">
                <p>Admin Login</p>
            </div>
        </div>
    );
};

// NOTE: Removed unused 'PrivateRoute' component definition.

// --- MAIN APPLICATION COMPONENT ---
function App() {
    const { isLoggedIn, userProfile, isLoading, handleLoginSuccess, handleLogout } = useAuth();
    
    if (isLoading) {
        return <div className="spinner-dashboard"></div>;
    }
    
    return (
        <div className="app-container">
            <Routes>
                {/* Public Routes for Login/Signup */}
                {!isLoggedIn ? (
                    <>
                        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/" element={<Portal />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                ) : (
                    /* Protected Routes wrapped in MainLayout */
                    <Route element={<MainLayout onLogout={handleLogout} />}> 
                        <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
                        <Route path="/set-availability" element={<SetAvailability />} />
                        <Route path="/task/:taskId" element={<RecipeGuide />} />
                        <Route path="/tutorials" element={<div><h2>Tutorials coming soon!</h2></div>} />
                        
                        {/* Redirect logic based on profile availability status */}
                        <Route path="/" element={
                            userProfile?.has_set_availability 
                                ? <Navigate to="/dashboard" /> 
                                : <Navigate to="/set-availability" />
                        } />
                    </Route>
                )}
            </Routes>
        </div>
    );
}

const AppWrapper = () => (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

export default AppWrapper;