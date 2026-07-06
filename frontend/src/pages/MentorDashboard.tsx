import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Calendar, Clock, Check, X, RefreshCw, AlertCircle, Users, CheckCircle2, MessageSquare, Edit3 } from 'lucide-react';

interface Booking {
  id: number;
  date: string;
  time: string;
  duration: string;
  purpose: string;
  status: string;
  notes?: string;
  student: {
    name: string;
    email: string;
  }
}

export const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<{
    totalStudents: number;
    pendingRequests: Booking[];
    acceptedSessions: Booking[];
    forumReplies: number;
  } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Reschedule dialog state
  const [rescheduleBookingId, setRescheduleBookingId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await apiRequest('/dashboard/mentor');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleStatusChange = async (id: number, status: string, options: { date?: string; time?: string } = {}) => {
    setActionLoading(true);
    try {
      await apiRequest(`/booking/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, ...options })
      });
      // Close reschedule dialog if open
      setRescheduleBookingId(null);
      // Refresh dashboard
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert('Error updating booking status.');
    } finally {
      setActionLoading(false);
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
    return <div className="text-center py-12">Failed to load mentor dashboard metrics.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Mentor Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your availability, pending bookings, and discussion board answers.</p>
      </div>

      {/* Metrics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-teal-50 text-brand">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Total Students</p>
            <p className="text-2xl font-extrabold text-slate-800">{data.totalStudents}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Pending Requests</p>
            <p className="text-2xl font-extrabold text-slate-800">{data.pendingRequests.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-green-50 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Accepted Sessions</p>
            <p className="text-2xl font-extrabold text-slate-800">{data.acceptedSessions.length}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Forum Replies</p>
            <p className="text-2xl font-extrabold text-slate-800">{data.forumReplies}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Requests approval queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Mentorship Booking Requests Queue</h3>
            </div>

            <div className="p-4 space-y-4">
              {data.pendingRequests.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No pending booking requests. You are all caught up!
                </div>
              ) : (
                data.pendingRequests.map(b => (
                  <div key={b.id} className="border border-slate-150 rounded-xl p-5 bg-slate-50/30 flex flex-col justify-between space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{b.student.name}</h4>
                        <p className="text-xs text-slate-400">{b.student.email}</p>
                        <p className="text-xs text-slate-600 font-semibold mt-2">Purpose: {b.purpose}</p>
                        {b.notes && <p className="text-[11px] text-slate-500 italic mt-1 bg-white p-2.5 border border-slate-100 rounded-lg">"{b.notes}"</p>}
                      </div>

                      <div className="flex flex-col items-end space-y-1 text-xs text-slate-500 font-medium">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{b.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{b.time} ({b.duration})</span>
                        </span>
                      </div>
                    </div>

                    {/* Reschedule forms */}
                    {rescheduleBookingId === b.id ? (
                      <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-3">
                        <h5 className="text-xs font-bold text-slate-700">Reschedule Details</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="date"
                            value={newDate}
                            required
                            onChange={(e) => setNewDate(e.target.value)}
                            className="border border-slate-200 rounded-lg p-2 text-xs"
                          />
                          <input
                            type="text"
                            value={newTime}
                            required
                            placeholder="e.g. 2:00 PM - 3:00 PM"
                            onChange={(e) => setNewTime(e.target.value)}
                            className="border border-slate-200 rounded-lg p-2 text-xs"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <button
                            onClick={() => setRescheduleBookingId(null)}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleStatusChange(b.id, 'ACCEPTED', { date: newDate, time: newTime })}
                            className="px-3 py-1.5 bg-brand hover:bg-brand-dark text-white rounded-lg text-[10px] font-bold shadow-sm"
                          >
                            Confirm Reschedule
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2 border-t border-slate-100 pt-4">
                        <button
                          onClick={() => {
                            setRescheduleBookingId(b.id);
                            setNewDate(b.date);
                            setNewTime(b.time);
                          }}
                          className="flex items-center space-x-1 border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          <span>Reschedule</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'REJECTED')}
                          className="flex items-center space-x-1 border border-red-200 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'ACCEPTED')}
                          className="flex items-center space-x-1 bg-brand hover:bg-brand-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Accept</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Accepted Sessions Side list */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Upcoming Confirmed Sessions</h3>
          </div>
          <div className="p-4 space-y-3">
            {data.acceptedSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No upcoming confirmed sessions.
              </div>
            ) : (
              data.acceptedSessions.map(b => (
                <div key={b.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 text-xs">{b.student.name}</span>
                    <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">Confirmed</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">Purpose: {b.purpose}</p>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-semibold pt-1">
                    <span>Date: {b.date}</span>
                    <span>Slot: {b.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
