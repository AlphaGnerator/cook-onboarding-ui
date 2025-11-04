// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://odc-api-289803954008.asia-south1.run.app/api';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        onLogout?.();
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/cook-dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data || {});
      } catch (err) {
        if (err?.response?.status === 401) {
          alert('Session expired. Please log in again.');
          onLogout?.();
        } else {
          setError('Could not load dashboard data.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [onLogout]);

  if (isLoading) return <div className="spinner"></div>;

  // Defensive defaults
  const cookName = summary?.cook_name ?? 'Cook';
  const wallet = summary?.wallet_balance ?? 0;
  const today = summary?.todays_earnings ?? 0;
  const upcoming = Array.isArray(summary?.upcoming_schedule) ? summary.upcoming_schedule : [];

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="logout-button-dashboard" onClick={onLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="welcome-banner">
        <h2>Welcome back, {cookName}!</h2>
        <p>Manage your availability, view your upcoming sessions, and update your profile.</p>
      </div>

      <div className="dashboard-grid">
        <div className="upcoming-sessions">
          <h3>Your Upcoming Sessions</h3>
          <p>Here are the cooking sessions booked by customers.</p>

          {upcoming.length > 0 ? (
            <div className="session-list">
              {upcoming.map((task) => {
                const title = task?.dish?.name ?? 'Session';
                const price = task?.cook_earnings ?? 0;
                const dateStr = task?.date ? new Date(task.date).toDateString() : 'Date TBA';
                const timeStr = (task?.start_time ?? '').slice(0, 5);

                return (
                  <div key={task?.id ?? Math.random()} className="session-card">
                    <div className="session-card-header">
                      <h4>{title}</h4>
                      <span className="session-price">₹{price}</span>
                    </div>
                    <p className="session-detail">👤 For John Doe</p>
                    <p className="session-detail">📍 123 Foodie Lane, Gourmet City</p>
                    <p className="session-detail">🗓️ {dateStr}{timeStr ? `, ${timeStr}` : ''}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No upcoming sessions scheduled.</p>
          )}
        </div>

        <div className="side-widgets">
          <div className="widget-card wallet-card">
            <h4>My Wallet</h4>
            <p className="wallet-subtitle">Your total available balance.</p>
            <p className="wallet-balance">₹{wallet}</p>
            <p className="todays-earnings">Today's Earnings: ₹{today}</p>
          </div>
          <div className="widget-card availability-widget" onClick={() => navigate('/set-availability')}>
            <h4>Manage Availability</h4>
            <p>Set the times you are available to cook.</p>
            <span className="calendar-icon">🗓️</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
