// In src/components/Dashboard.js (CORRECTED AND FINAL)

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
          setError('Could not load dashboard data. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [onLogout]);

  if (isLoading) {
    return <div className="spinner"></div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="logout-button-header" onClick={onLogout}>Logout</button>
      </div>
    );
  }

  // Defensive defaults to prevent crashes if the API response is incomplete
  const cookName = summary?.cook_name ?? 'Cook';
  const walletBalance = parseFloat(summary?.wallet_balance ?? 0).toFixed(2);
  const todaysEarnings = parseFloat(summary?.todays_earnings ?? 0).toFixed(2);
  const upcomingTasks = Array.isArray(summary?.upcoming_schedule) ? summary.upcoming_schedule : [];

  return (
    <div className="dashboard-content">
      <div className="welcome-banner">
        <h2>Welcome back, {cookName}!</h2>
        <p>Here's a summary of your schedule and earnings.</p>
      </div>

      <div className="dashboard-grid">
        <div className="upcoming-sessions">
          <h3>Your Upcoming Sessions</h3>
          <p>You have {upcomingTasks.length} upcoming session{upcomingTasks.length !== 1 ? 's' : ''}.</p>

          {upcomingTasks.length > 0 ? (
            <div className="session-list">
              {upcomingTasks.map((task) => {
                const dishName = task?.dish?.name ?? 'Unnamed Task';
                const earnings = task?.cook_earnings ?? '0.00';
                const date = task?.date ? new Date(task.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date not set';
                const time = task?.start_time ? task.start_time.slice(0, 5) : '';

                return (
                  <div key={task.id} className="session-card" onClick={() => navigate(`/task/${task.id}`)} style={{cursor: 'pointer'}}>
                    <div className="session-card-header">
                      <h4>{dishName}</h4>
                      <span className="session-price">₹{earnings}</span>
                    </div>
                    <p className="session-detail">🗓️ {date}{time && `, ${time}`}</p>
                    <p className="session-detail" style={{color: '#00B875', fontWeight: '600'}}>View Recipe & Details →</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="session-card">
              <p>You have no upcoming sessions. Set your availability to get booked!</p>
            </div>
          )}
        </div>

        <div className="side-widgets">
          <div className="widget-card wallet-card">
            <h4>My Wallet</h4>
            <p className="wallet-subtitle">Your total available balance.</p>
            <p className="wallet-balance">₹{walletBalance}</p>
            <p className="todays-earnings">Today's Earnings: ₹{todaysEarnings}</p>
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