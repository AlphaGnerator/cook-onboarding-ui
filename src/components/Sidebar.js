import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <span className="logo">🌿</span>
                <h2>Culinary Canvas</h2>
            </div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
                <NavLink to="/set-availability" className="nav-link">My Availability</NavLink>
                <NavLink to="/tutorials" className="nav-link">Tutorials</NavLink>
            </nav>
        </div>
    );
}

export default Sidebar;