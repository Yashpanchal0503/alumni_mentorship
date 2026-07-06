import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../utils/api.js';
import { Search, ChevronDown, Check, RefreshCw } from 'lucide-react';

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

export const MentorListing: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Parse initial query params
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [experience, setExperience] = useState('All levels');
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('Most Relevant');

  const domains = ['Technology', 'Finance', 'Healthcare', 'Creative Arts'];

  useEffect(() => {
    // Fetch mentors with filters
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (selectedDomains.length > 0) queryParams.append('domain', selectedDomains.join(','));
        if (experience !== 'All levels') {
          if (experience === 'Entry Level (1-5 yrs)') queryParams.append('experience', '0-5');
          else if (experience === 'Mid Level (6-10 yrs)') queryParams.append('experience', '6-10');
          else if (experience === 'Senior Level (10+ yrs)') queryParams.append('experience', '10+');
        }

        const data = await apiRequest(`/mentors?${queryParams.toString()}`);
        setMentors(data);
      } catch (err) {
        console.error('Error fetching mentors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [search, selectedDomains, experience]);

  const handleDomainChange = (domain: string) => {
    if (selectedDomains.includes(domain)) {
      setSelectedDomains(selectedDomains.filter(d => d !== domain));
    } else {
      setSelectedDomains([...selectedDomains, domain]);
    }
  };

  const handleClearAll = () => {
    setSelectedDomains([]);
    setExperience('All levels');
    setSelectedAvailability([]);
    setSearch('');
    navigate('/mentors');
  };

  const getSortedMentors = () => {
    const list = [...mentors];
    if (sortBy === 'Experience: High to Low') {
      return list.sort((a, b) => b.experience - a.experience);
    }
    if (sortBy === 'Name') {
      return list.sort((a, b) => a.user.name.localeCompare(b.user.name));
    }
    return list; // Most Relevant (default)
  };

  const sortedMentors = getSortedMentors();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Find your Mentor</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-xl">
          Connect with experienced alumni who have navigated your path and are ready to help you grow your career.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-sm">FILTERS</h3>
            <button
              onClick={handleClearAll}
              className="text-xs text-brand hover:underline font-semibold"
            >
              Clear All
            </button>
          </div>

          {/* Domain Category Filter */}
          <div className="mb-6 border-b border-slate-100 pb-5">
            <h4 className="text-xs font-semibold text-slate-700 uppercase mb-3">Domain</h4>
            <div className="space-y-2">
              {domains.map(d => (
                <label key={d} className="flex items-center space-x-2.5 cursor-pointer text-sm text-slate-600 hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(d)}
                    onChange={() => handleDomainChange(d)}
                    className="rounded border-slate-300 text-brand focus:ring-brand h-4 w-4"
                  />
                  <span>{d}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Filter */}
          <div className="mb-6 border-b border-slate-100 pb-5">
            <h4 className="text-xs font-semibold text-slate-700 uppercase mb-3">Experience</h4>
            <div className="relative">
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand appearance-none"
              >
                <option>All levels</option>
                <option>Entry Level (1-5 yrs)</option>
                <option>Mid Level (6-10 yrs)</option>
                <option>Senior Level (10+ yrs)</option>
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase mb-3">Availability</h4>
            <div className="space-y-2">
              {['This week', 'This month'].map(a => (
                <label key={a} className="flex items-center space-x-2.5 cursor-pointer text-sm text-slate-600 hover:text-slate-800">
                  <input
                    type="checkbox"
                    checked={selectedAvailability.includes(a)}
                    onChange={() => {
                      if (selectedAvailability.includes(a)) {
                        setSelectedAvailability(selectedAvailability.filter(x => x !== a));
                      } else {
                        setSelectedAvailability([...selectedAvailability, a]);
                      }
                    }}
                    className="rounded border-slate-300 text-brand focus:ring-brand h-4 w-4"
                  />
                  <span>{a}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3">
          {/* List Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <span className="text-xs font-medium text-slate-500">
              Showing <strong className="text-slate-800">{sortedMentors.length}</strong> mentors {selectedDomains.length > 0 && `in ${selectedDomains.join(', ')}`}
            </span>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <span className="text-xs text-slate-500 font-medium">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none border-none py-1 pr-6 cursor-pointer appearance-none"
                >
                  <option>Most Relevant</option>
                  <option>Experience: High to Low</option>
                  <option>Name</option>
                </select>
                <ChevronDown className="absolute right-0 top-1.5 h-3.5 w-3.5 text-slate-600 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Loader or Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <RefreshCw className="h-8 w-8 text-brand animate-spin" />
            </div>
          ) : sortedMentors.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
              <p className="text-slate-500 text-sm">No mentors match your current search/filters.</p>
              <button
                onClick={handleClearAll}
                className="mt-4 bg-brand text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-brand-dark transition-all shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedMentors.map((m, idx) => {
                const skills = JSON.parse(m.skills || '[]');
                return (
                  <div
                    key={m.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm hover-scale transition-all"
                  >
                    <div>
                      {/* Avatar with Status indicator */}
                      <div className="flex justify-center mb-4 relative">
                        <div className="relative">
                          <img
                            src={m.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"}
                            alt={m.user.name}
                            className="h-20 w-20 rounded-2xl object-cover border border-slate-100 shadow-sm"
                          />
                          {/* Dot indicator matching mockups */}
                          <span className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-white ${
                            idx % 3 === 0 ? 'bg-green-500' : idx % 3 === 1 ? 'bg-orange-500' : 'bg-slate-400'
                          }`} />
                        </div>
                      </div>

                      {/* Mentor Name & Work info */}
                      <div className="text-center mb-4">
                        <h3 className="font-bold text-slate-800 text-base">{m.user.name}</h3>
                        <p className="text-xs text-brand font-semibold mt-0.5">
                          {m.designation} @ {m.company}
                        </p>
                      </div>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                        {skills.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="bg-teal-50 text-[10px] font-bold text-brand px-2.5 py-1 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                        {skills.length > 3 && (
                          <span className="bg-slate-50 text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-md">
                            +{skills.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Bio Snippet */}
                      <p className="text-xs text-slate-500 leading-relaxed text-center line-clamp-3 mb-4">
                        {m.bio}
                      </p>
                    </div>

                    <Link
                      to={`/mentors/${m.id}`}
                      className="w-full bg-slate-50 hover:bg-brand hover:text-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-lg text-center transition-all mt-auto shadow-sm active-scale flex items-center justify-center"
                    >
                      View Profile
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
