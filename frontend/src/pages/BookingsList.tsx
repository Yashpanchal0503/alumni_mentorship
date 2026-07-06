import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Calendar, Clock, RefreshCw, X, Check, Trash } from 'lucide-react';

interface Booking {
  id: number;
  date: string;
  time: string;
  duration: string;
  purpose: string;
  status: string;
  notes?: string;
  student?: { name: string; email: string };
  mentor?: { user: { name: string } };
}

export const BookingsList: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const data = await apiRequest('/booking');
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await apiRequest(`/booking/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking.');
    }
  };

  const handleAdminDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this booking record permanently?')) return;

    try {
      await apiRequest(`/booking/${id}`, { method: 'DELETE' });
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-250 uppercase">Pending</span>;
      case 'ACCEPTED':
        return <span className="bg-green-150 text-green-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Accepted</span>;
      case 'REJECTED':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Rejected</span>;
      case 'COMPLETED':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Completed</span>;
      case 'CANCELLED':
        return <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Cancelled</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <RefreshCw className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Booking Requests</h1>
        <p className="text-sm text-slate-500 mt-1">Review the history and current approval status of all sessions.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-4">
        {bookings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No booking requests logged in your profile history.
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div
                key={b.id}
                className="border border-slate-100 rounded-xl p-5 bg-slate-50/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-slate-800 text-sm">
                      {user?.role === 'STUDENT' ? `Mentor: ${b.mentor?.user.name}` : `Student: ${b.student?.name}`}
                    </h3>
                    {getStatusBadge(b.status)}
                  </div>
                  <p className="text-xs text-slate-600 font-semibold">Purpose: {b.purpose}</p>
                  
                  {b.notes && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      "{b.notes}"
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-slate-400 font-medium pt-1">
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

                {/* Interactive operations */}
                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  {user?.role === 'STUDENT' && b.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-xs border border-red-200 hover:bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center space-x-1"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  {user?.role === 'ADMIN' && (
                    <button
                      onClick={() => handleAdminDelete(b.id)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors border border-red-100"
                      title="Admin Delete Record"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
