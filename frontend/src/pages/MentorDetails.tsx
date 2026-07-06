import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Calendar, Clock, Linkedin, FileText, Languages, Briefcase, RefreshCw, X, Check } from 'lucide-react';

interface Mentor {
  id: number;
  userId: number;
  domain: string;
  company: string;
  designation: string;
  experience: number;
  bio: string;
  skills: string; // JSON string
  languages: string; // JSON string
  linkedin: string;
  photo: string;
  availability: string; // JSON string
  user: {
    name: string;
    email: string;
  };
}

export const MentorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Booking Modal State
  const [showModal, setShowModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDuration, setBookingDuration] = useState('30 mins');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  
  const [bookingSubmitLoading, setBookingSubmitLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const data = await apiRequest(`/mentors/${id}`);
        setMentor(data);
      } catch (err) {
        console.error('Error fetching mentor details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 min-h-[calc(100vh-61px)]">
        <RefreshCw className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <p className="text-slate-500">Mentor profile not found.</p>
        <button onClick={() => navigate('/mentors')} className="mt-4 bg-brand text-white px-4 py-2 rounded-lg">
          Back to Listing
        </button>
      </div>
    );
  }

  const skills = JSON.parse(mentor.skills || '[]');
  const languages = JSON.parse(mentor.languages || '[]');
  const availability = JSON.parse(mentor.availability || '{"days":[], "timeSlots":[]}');

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'STUDENT') {
      setBookingError('Only students can request mentorship sessions.');
      return;
    }

    setBookingSubmitLoading(true);
    setBookingError(null);

    try {
      await apiRequest('/booking', {
        method: 'POST',
        body: JSON.stringify({
          mentorId: mentor.id,
          date: bookingDate,
          time: bookingTime,
          duration: bookingDuration,
          purpose: bookingPurpose,
          notes: bookingNotes
        })
      });
      
      setBookingSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setBookingSuccess(false);
        // Clear fields
        setBookingDate('');
        setBookingTime('');
        setBookingPurpose('');
        setBookingNotes('');
      }, 2000);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to submit booking request.');
    } finally {
      setBookingSubmitLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Mentor Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
        <img
          src={mentor.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=face"}
          alt={mentor.user.name}
          className="h-28 w-28 md:h-36 md:w-36 rounded-2xl object-cover border border-slate-100 shadow-sm"
        />

        <div className="flex-1 text-center md:text-left space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{mentor.user.name}</h1>
            <p className="text-brand font-semibold text-sm mt-1">{mentor.designation} @ {mentor.company}</p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-slate-500 font-medium">
            <span className="flex items-center space-x-1">
              <Briefcase className="h-4 w-4 text-slate-400" />
              <span>{mentor.experience} Years Experience ({mentor.domain})</span>
            </span>
            <span className="flex items-center space-x-1">
              <Languages className="h-4 w-4 text-slate-400" />
              <span>Speaks: {languages.join(', ')}</span>
            </span>
          </div>

          {mentor.linkedin && (
            <a
              href={mentor.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 text-slate-500 hover:text-[#0a66c2] text-xs font-semibold"
            >
              <Linkedin className="h-4 w-4 fill-current" />
              <span>LinkedIn Profile</span>
            </a>
          )}
        </div>

        {/* Primary Booking Action */}
        <div className="w-full md:w-auto self-stretch md:self-auto flex items-center">
          <button
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto bg-brand hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active-scale"
          >
            Request Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Bio & Details */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-brand" />
              <span>About Me</span>
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{mentor.bio}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <Briefcase className="h-5 w-5 text-brand" />
              <span>Area of Expertise</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string) => (
                <span
                  key={skill}
                  className="bg-teal-50 border border-teal-100 text-brand text-xs font-bold px-3.5 py-1.5 rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Availability details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-brand" />
            <span>Availability Slots</span>
          </h2>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Available Days</span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {availability.days?.length > 0 ? (
                  availability.days.map((day: string) => (
                    <span
                      key={day}
                      className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-md"
                    >
                      {day}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Not specified. Contact for schedule.</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase">Preferred Hours</span>
              <div className="space-y-1.5 mt-2">
                {availability.timeSlots?.length > 0 ? (
                  availability.timeSlots.map((slot: string) => (
                    <div
                      key={slot}
                      className="flex items-center space-x-2 text-xs text-slate-600 font-medium bg-slate-50 border border-slate-100 rounded-md p-2"
                    >
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{slot}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Flex hours.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 md:p-8 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Book Mentorship Session</h3>
                <p className="text-xs text-slate-500 mt-0.5">With {mentor.user.name}</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Check className="h-6 w-6 animate-pulse" />
                </div>
                <h4 className="font-bold text-slate-800">Booking Submitted!</h4>
                <p className="text-xs text-slate-500">Wait for your mentor to accept or update the status.</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-semibold">
                    {bookingError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Preferred Date */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Preferred Time slot</label>
                    <input
                      type="text"
                      required
                      value={bookingTime}
                      placeholder="e.g. 10:00 AM - 11:00 AM"
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Duration</label>
                    <select
                      value={bookingDuration}
                      onChange={(e) => setBookingDuration(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    >
                      <option>30 mins</option>
                      <option>45 mins</option>
                      <option>60 mins</option>
                    </select>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Session Category / Domain</label>
                    <input
                      type="text"
                      required
                      value={bookingPurpose}
                      placeholder="e.g. AWS Mock Interview"
                      onChange={(e) => setBookingPurpose(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Cover Note / Details</label>
                  <textarea
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    placeholder="Briefly state your academic questions or expectations from this session..."
                    rows={4}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="border border-slate-200 px-4 py-2 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingSubmitLoading}
                    className="bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md active-scale disabled:opacity-50"
                  >
                    {bookingSubmitLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
