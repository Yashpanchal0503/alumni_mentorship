import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { useSelector, useDispatch } from 'react-redux';
import { setNotifications, markRead, markAllRead } from '../store/store.js';
import type { RootState } from '../store/store.js';
import { apiRequest } from '../utils/api.js';
import { Bell, Search, User, LogOut, ChevronDown, BookOpen } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);
  const notifications = useSelector((state: RootState) => state.notifications.items);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      // Fetch notifications
      apiRequest('/notifications')
        .then(data => dispatch(setNotifications(data)))
        .catch(err => console.error('Error fetching notifications:', err));
    }
  }, [user, dispatch]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await apiRequest(`/notifications/${id}`, { method: 'PUT' });
      dispatch(markRead(id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications', { method: 'PUT' });
      dispatch(markAllRead());
    } catch (err) {
      console.error(err);
    }
  };

  const activeLink = (path: string) => {
    return location.pathname.startsWith(path)
      ? "text-brand border-b-2 border-brand font-semibold"
      : "text-slate-600 hover:text-brand transition-colors";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Brand Logo */}
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-slate-800">
          <BookOpen className="h-7 w-7 text-brand" />
          <span>AlumniConnect</span>
        </Link>

        {/* Links (for Student/General navigation) */}
        <div className="hidden md:flex space-x-6 text-sm font-medium py-1">
          <Link to="/dashboard" className={activeLink('/dashboard')}>Dashboard</Link>
          <Link to="/mentors" className={activeLink('/mentors')}>Mentors</Link>
          <Link to="/forum" className={activeLink('/forum')}>Forum</Link>
          <Link to="/bookings" className={activeLink('/bookings')}>Bookings</Link>
        </div>
      </div>

      {/* Right section actions */}
      <div className="flex items-center space-x-6">
        {/* Search Input */}
        <div className="relative hidden lg:block w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search mentors..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/mentors?search=${(e.target as HTMLInputElement).value}`);
              }
            }}
          />
        </div>

        {/* Notifications Icon & Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserDropdown(false);
              }}
              className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors focus:outline-none"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="font-semibold text-sm text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-brand hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`px-4 py-3 border-b border-slate-100 cursor-pointer text-xs transition-colors hover:bg-slate-50 ${
                          !n.isRead ? 'bg-teal-50/50 font-medium' : 'text-slate-600'
                        }`}
                      >
                        <p>{n.message}</p>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User profile details & Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-2 focus:outline-none"
            >
              {user.photo || user.mentorProfile?.photo ? (
                <img
                  src={user.photo || user.mentorProfile?.photo}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <svg className="h-8 w-8 rounded-full border border-slate-200 shadow-sm" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="#e2e8f0" />
                  <circle cx="20" cy="14" r="7" fill="#94a3b8" />
                  <ellipse cx="20" cy="33" rx="12" ry="9" fill="#94a3b8" />
                </svg>
              )}
              <span className="text-sm text-slate-700 font-medium hidden sm:block">
                {user.name.split(' ')[0]}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand"
                >
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand">
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-brand text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
