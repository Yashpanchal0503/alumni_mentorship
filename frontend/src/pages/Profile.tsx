import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { apiRequest } from '../utils/api.js';
import { Save, User, Briefcase, CheckCircle, RefreshCw } from 'lucide-react';

// Generic person avatar SVG (used as fallback)
export const DefaultAvatar: React.FC<{ className?: string }> = ({ className = 'h-20 w-20' }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="40" fill="#e2e8f0" />
    <circle cx="40" cy="30" r="13" fill="#94a3b8" />
    <ellipse cx="40" cy="65" rx="22" ry="15" fill="#94a3b8" />
  </svg>
);

export const Profile: React.FC = () => {
  const { user, updateUserLocal } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');

  // Mentor-specific states
  const [domain, setDomain] = useState(user?.mentorProfile?.domain || 'Technology');
  const [company, setCompany] = useState(user?.mentorProfile?.company || '');
  const [designation, setDesignation] = useState(user?.mentorProfile?.designation || '');
  const [experience, setExperience] = useState(user?.mentorProfile?.experience || 0);
  const [bio, setBio] = useState(user?.mentorProfile?.bio || '');

  const getSkillsStr = () => {
    try {
      const parsed = JSON.parse(user?.mentorProfile?.skills || '[]');
      return parsed.join(', ');
    } catch {
      return '';
    }
  };

  const getLanguagesStr = () => {
    try {
      const parsed = JSON.parse(user?.mentorProfile?.languages || '[]');
      return parsed.join(', ');
    } catch {
      return '';
    }
  };

  const getAvailability = () => {
    try {
      return JSON.parse(user?.mentorProfile?.availability || '{"days":[], "timeSlots":[]}');
    } catch {
      return { days: [], timeSlots: [] };
    }
  };

  const [skills, setSkills] = useState(getSkillsStr());
  const [languages, setLanguages] = useState(getLanguagesStr());

  const av = getAvailability();
  const [avDays, setAvDays] = useState(av.days.join(', '));
  const [avSlots, setAvSlots] = useState(av.timeSlots.join(', '));
  const [linkedin, setLinkedin] = useState(user?.mentorProfile?.linkedin || '');
  const [photo, setPhoto] = useState(user?.photo || user?.mentorProfile?.photo || '');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMentor = user?.role === 'MENTOR';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      // Update general profile (name and photo only — role is immutable)
      const updatedUser = await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, photo }),
      });

      let finalUser = { ...updatedUser };

      // If user is a MENTOR, save mentor profile details
      if (isMentor && updatedUser.mentorProfile) {
        const skillsArray = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        const languagesArray = languages.split(',').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
        const daysArray = avDays.split(',').map((d: string) => d.trim()).filter((d: string) => d.length > 0);
        const slotsArray = avSlots.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);

        const updatedProfile = await apiRequest(`/mentor/${updatedUser.mentorProfile.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            domain,
            company,
            designation,
            experience: parseInt(experience as any),
            bio,
            skills: skillsArray,
            languages: languagesArray,
            linkedin,
            photo,
            availability: { days: daysArray, timeSlots: slotsArray }
          })
        });

        finalUser.mentorProfile = updatedProfile;
      }

      updateUserLocal(finalUser);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error saving profile.');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = user?.role === 'MENTOR' ? 'Alumni Mentor' : user?.role === 'ADMIN' ? 'Administrator' : 'Student';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Update your name, photo, and public profile information.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Status flags */}
        {success && (
          <div className="p-4 bg-green-50 border-b border-green-200 text-green-700 text-xs font-semibold flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Profile saved successfully!</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* General credentials section */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center space-x-2 pb-2 border-b border-slate-100">
              <User className="h-4 w-4 text-slate-400" />
              <span>General Information</span>
            </h3>

            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar Preview */}
              {photo ? (
                <img
                  src={photo}
                  alt="Profile Preview"
                  className="h-20 w-20 rounded-2xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="flex-shrink-0">
                  <DefaultAvatar className="h-20 w-20 rounded-2xl" />
                </div>
              )}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address (Read-only)</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Profile Photo URL</label>
                  <input
                    type="text"
                    value={photo}
                    placeholder="https://example.com/photo.jpg"
                    onChange={(e) => setPhoto(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Account Role</label>
                  <div className="w-full border border-slate-100 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-500 flex items-center space-x-2">
                    <span className="font-semibold text-slate-700">{roleLabel}</span>
                    <span className="text-[10px] text-slate-400">(set at registration)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mentor Profile details section — only shown to mentors */}
          {isMentor && (
            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center space-x-2 pb-2 border-b border-slate-100">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <span>Mentor Public Profile Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Domain selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Domain</label>
                  <select
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Creative Arts</option>
                  </select>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    placeholder="Senior Architect"
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                {/* Company */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Company</label>
                  <input
                    type="text"
                    value={company}
                    placeholder="TechGiant"
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">LinkedIn Profile Link</label>
                  <input
                    type="text"
                    value={linkedin}
                    placeholder="https://linkedin.com/in/username"
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Skills and Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={skills}
                    placeholder="React, Node, System Design, AWS"
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Languages (comma-separated)</label>
                  <input
                    type="text"
                    value={languages}
                    placeholder="English, Greek, French"
                    onChange={(e) => setLanguages(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Availability Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Available Days (comma-separated)</label>
                  <input
                    type="text"
                    value={avDays}
                    placeholder="Monday, Wednesday, Friday"
                    onChange={(e) => setAvDays(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Time Slots (comma-separated)</label>
                  <input
                    type="text"
                    value={avSlots}
                    placeholder="10:00 AM - 11:00 AM, 3:00 PM - 4:00 PM"
                    onChange={(e) => setAvSlots(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Biography / Career Summary</label>
                <textarea
                  value={bio}
                  rows={5}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell students about your career path, domain focus, and session offerings..."
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end border-t border-slate-100 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-brand hover:bg-brand-dark text-white text-xs font-bold py-2.5 px-6 rounded-xl flex items-center space-x-2 shadow-md active-scale disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
