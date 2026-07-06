import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Calendar, Clock, AlertCircle, CheckCircle2, MessageSquare, ArrowRight, RefreshCw, UserCheck } from 'lucide-react';

interface Booking {
  id: number;
  date: string;
  time: string;
  duration: string;
  purpose: string;
  status: string;
  notes?: string;
  mentor: {
    user: {
      name: string;
      email: string;
    }
  }
}

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data, setData] = useState<{
    upcomingSessions: Booking[];
    pendingRequests: Booking[];
    previousSessions: Booking[];
    discussionActivity: { posts: number; comments: number };
  } | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await apiRequest('/dashboard/student');
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'ACCEPTED':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'COMPLETED':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'CANCELLED':
        return 'bg-slate-50 text-slate-500 border border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <RefreshCw className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12">Failed to load student dashboard.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome Back, {user?.name}!</h1>
        <p className="text-sm text-slate-500 mt-1">Here is a quick summary of your mentorship sessions and discussions.</p>
      </div>

      {/* Grid of status widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Widget 1: Upcoming Sessions count */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-green-50 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Upcoming Sessions</p>
            <p className="text-2xl font-extrabold text-slate-800">{data.upcomingSessions.length}</p>
          </div>
        </div>

        {/* Widget 2: Pending Requests count */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Pending Requests</p>
            <p className="text-2xl font-extrabold text-slate-800">{data.pendingRequests.length}</p>
          </div>
        </div>

        {/* Widget 3: Completed Sessions */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Previous Sessions</p>
            <p className="text-2xl font-extrabold text-slate-800">
              {data.previousSessions.filter(s => s.status === 'COMPLETED').length}
            </p>
          </div>
        </div>

        {/* Widget 4: Discussion Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-teal-50 text-brand animate-pulse">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Discussion Posts</p>
            <p className="text-2xl font-extrabold text-slate-800">
              {data.discussionActivity.posts + data.discussionActivity.comments}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings Schedule List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Schedule */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm">Upcoming Mentorship Sessions</h3>
              <Link to="/bookings" className="text-brand text-xs font-bold flex items-center space-x-1 hover:underline">
                <span>View all</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="p-4 space-y-3">
              {data.upcomingSessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No upcoming sessions booked. Explore the mentors directory to schedule one.
                </div>
              ) : (
                data.upcomingSessions.map(b => (
                  <div key={b.id} className="border border-slate-100 rounded-xl p-4 flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-800 text-sm">{b.mentor.user.name}</h4>
                      <p className="text-xs text-slate-500 font-semibold">{b.purpose}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-400 font-medium">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{b.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{b.time} ({b.duration})</span>
                        </span>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Accepted
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Schedule */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Pending Request Queue</h3>
            </div>
            <div className="p-4 space-y-3">
              {data.pendingRequests.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No pending requests in your queue.
                </div>
              ) : (
                data.pendingRequests.map(b => (
                  <div key={b.id} className="border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center bg-white gap-3">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 text-sm">Request with {b.mentor.user.name}</h4>
                      <p className="text-xs text-slate-500">{b.purpose}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-400 font-semibold pt-1">
                        <span>Date: {b.date}</span>
                        <span>Time: {b.time}</span>
                      </div>
                    </div>
                    <span className="self-start sm:self-auto bg-amber-50 text-amber-700 text-[10px] border border-amber-200 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Pending Approval
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar activity logs */}
        <div className="space-y-6">
          {/* Discussion Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Participate in Discussions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Ask your questions about interview experiences, resumes, and start-up strategies directly on the open forum.
            </p>
            <button
              onClick={() => navigate('/forum')}
              className="w-full bg-brand hover:bg-brand-dark text-white text-xs font-bold py-2.5 rounded-lg text-center transition-colors shadow-sm"
            >
              Browse Forum Topics
            </button>
          </div>

          {/* Quick contact notification summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Session Guidelines</h3>
            <ul className="text-xs text-slate-500 space-y-2 list-disc list-inside leading-relaxed">
              <li>Formulate clear questions before joining the session.</li>
              <li>Share your latest resume and LinkedIn URL beforehand.</li>
              <li>Provide constructive feedback once a session is completed.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
