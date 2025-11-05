// In Front-end-odc-2/src/App.js (CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Signup from './components/Signup'; 
import Login from './components/Login';   
import Dashboard from './components/Dashboard';
import RecipeGuide from './components/RecipeGuide';
import SetAvailability from './components/SetAvailability';
import MainLayout from './components/MainLayout';
import './App.css';

const API_URL = 'https://odc-api-289803954008.asia-south1.run.app/api';

// --- AUTHENTICATION HOOK (CORRECTED & STABILIZED) ---
const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('access_token'));
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsLoggedIn(false);
        setUserProfile(null);
    }, []);

    const fetchProfile = useCallback(async () => {
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
            console.error("Failed to fetch profile:", error);
            handleLogout(); 
        } finally {
            setIsLoading(false);
        }
    }, [handleLogout]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    const handleLoginSuccess = () => {
        setIsLoading(true);
        fetchProfile();
    };

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
                <div className="portal-card">
                    <div className="card-icon customer-icon">👤</div>
                    <h2>Customer Portal</h2>
                    <p>Find and book talented cooks, discover new recipes, and get personalized meal plans.</p>
                    <button className="portal-button customer-button" disabled>Enter Customer Portal</button>
                </div>
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

// --- MAIN APPLICATION COMPONENT ---
function App() {
    const { isLoggedIn, userProfile, isLoading, handleLoginSuccess, handleLogout } = useAuth();
    
    if (isLoading) {
        return <div className="spinner-dashboard"></div>;
    }
    
    return (
        <div className="app-container">
            <Routes>
                {/* Public Routes are rendered if the user is NOT logged in */}
                {!isLoggedIn ? (
                    <>
                        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/" element={<Portal />} />
                        {/* Any other route redirects to the portal if not logged in */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                ) : (
                    /* Protected Routes are wrapped in MainLayout if the user IS logged in */
                    <Route element={<MainLayout onLogout={handleLogout} />}> 
                        {/* Redirect logic: Check availability status ONCE logged in */}
                        <Route 
                            path="/" 
                            element={
                                userProfile && userProfile.has_set_availability 
                                    ? <Navigate to="/dashboard" /> 
                                    : <Navigate to="/set-availability" />
                            } 
                        />
                        <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
                        <Route path="/set-availability" element={<SetAvailability />} />
                        <Route path="/task/:taskId" element={<RecipeGuide />} />
                        <Route path="/tutorials" element={<div><h2>Tutorials coming soon!</h2></div>} />
                        {/* Any other unknown route for a logged-in user redirects to their main landing page */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Route>
                )}
            </Routes>
        </div>
    );
}

// --- AppWrapper to provide the Browser Router context ---
const AppWrapper = () => (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

export default AppWrapper;