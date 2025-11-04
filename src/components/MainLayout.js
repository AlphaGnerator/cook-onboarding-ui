import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function MainLayout({ onLogout }) { // Added onLogout prop
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <header className="main-header">
                    <h1>Cook Dashboard</h1>
                    <div className="profile-icon"></div>
                    {/* --- ADD THIS LOGOUT BUTTON --- */}
                    <button onClick={onLogout} className="logout-button-header">Logout</button> 
                    {/* ---------------------------- */}
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default MainLayout;