import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  PlusCircle, 
  HelpCircle, 
  LogOut,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  onNewDiscussionOpen?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNewDiscussionOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) => {
    return `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
      isActive 
        ? 'bg-brand-light/20 text-brand font-semibold shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`;
  };

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 h-[calc(100vh-61px)] flex flex-col justify-between p-4 sticky top-[61px]">
      <div className="space-y-6">
        {/* Portal Header */}
        <div className="px-4 py-2 flex items-center space-x-3">
          <GraduationCap className="h-8 w-8 text-brand" />
          <div>
            <h2 className="font-bold text-slate-800 leading-tight">Alumni Portal</h2>
            <p className="text-[10px] text-slate-400">Excellence & Growth</p>
          </div>
        </div>

        {/* Primary Links */}
        <nav className="space-y-1">
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/mentors" className={linkClass}>
            <Users className="h-4 w-4" />
            <span>Mentors</span>
          </NavLink>

          <NavLink to="/bookings" className={linkClass}>
            <CalendarCheck className="h-4 w-4" />
            <span>Requests</span>
          </NavLink>

          <NavLink to="/forum" className={linkClass}>
            <MessageSquare className="h-4 w-4" />
            <span>Forum</span>
          </NavLink>

          {user?.role === 'ADMIN' && (
            <>
              <NavLink to="/analytics" className={linkClass}>
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </NavLink>
              <NavLink to="/settings" className={linkClass}>
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Action Button */}
        {onNewDiscussionOpen && (
          <button
            onClick={onNewDiscussionOpen}
            className="w-full bg-brand hover:bg-brand-dark text-white text-sm font-medium py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors shadow-md active-scale"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Discussion</span>
          </button>
        )}
      </div>

      {/* Bottom Section */}
      <div className="space-y-1 border-t border-slate-200 pt-4">
        <NavLink to="/help" className={linkClass}>
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
