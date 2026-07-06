import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store/store.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';
import { MentorListing } from './pages/MentorListing.js';
import { MentorDetails } from './pages/MentorDetails.js';
import { Forum } from './pages/Forum.js';
import { StudentDashboard } from './pages/StudentDashboard.js';
import { MentorDashboard } from './pages/MentorDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { Profile } from './pages/Profile.js';
import { BookingsList } from './pages/BookingsList.js';

// Route Guard for authenticated users
const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto h-[calc(100vh-61px)] custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

// Route Guard for Public view with optional navbar
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

// Dashboard Router Component
const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  if (user.role === 'MENTOR') {
    return <MentorDashboard />;
  }
  return <StudentDashboard />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/login" element={
        <PublicLayout>
          <Login />
        </PublicLayout>
      } />
      
      <Route path="/register" element={
        <PublicLayout>
          <Register />
        </PublicLayout>
      } />

      <Route path="/mentors" element={
        <PublicLayout>
          <div className="py-4">
            <MentorListing />
          </div>
        </PublicLayout>
      } />

      <Route path="/mentors/:id" element={
        <PublicLayout>
          <div className="py-4">
            <MentorDetails />
          </div>
        </PublicLayout>
      } />

      {/* Forum is open for reading, but posting requires login, handled inside pages */}
      <Route path="/forum" element={
        <PublicLayout>
          <div className="py-4">
            <Forum />
          </div>
        </PublicLayout>
      } />
      
      <Route path="/forum/:id" element={
        <PublicLayout>
          <div className="py-4">
            <Forum />
          </div>
        </PublicLayout>
      } />

      {/* Authenticated Dashboard Paths */}
      <Route path="/dashboard" element={
        <ProtectedLayout>
          <DashboardRouter />
        </ProtectedLayout>
      } />

      <Route path="/bookings" element={
        <ProtectedLayout>
          <BookingsList />
        </ProtectedLayout>
      } />

      <Route path="/profile" element={
        <ProtectedLayout>
          <Profile />
        </ProtectedLayout>
      } />

      <Route path="/analytics" element={
        <ProtectedLayout>
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
            <h2 className="font-bold text-slate-800 text-lg">System Analytics</h2>
            <p className="text-slate-500 text-xs mt-1">Detailed performance logs and database load stats are ready for export.</p>
          </div>
        </ProtectedLayout>
      } />

      <Route path="/settings" element={
        <ProtectedLayout>
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
            <h2 className="font-bold text-slate-800 text-lg">Platform Settings</h2>
            <p className="text-slate-500 text-xs mt-1">Configure role permissions, OAuth setups, and email reminders.</p>
          </div>
        </ProtectedLayout>
      } />

      <Route path="/help" element={
        <ProtectedLayout>
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
            <h2 className="font-bold text-slate-800 text-lg">Platform Support Centre</h2>
            <p className="text-slate-500 text-xs mt-1">If you have any questions or bugs, contact university sysops at sysops@alumni.edu.</p>
          </div>
        </ProtectedLayout>
      } />

      {/* Redirects */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ReduxProvider>
  );
}

export default App;
