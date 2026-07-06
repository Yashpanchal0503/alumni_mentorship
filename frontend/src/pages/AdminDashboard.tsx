import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api.js';
import { 
  Users, 
  Award, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal, 
  Star, 
  RefreshCw, 
  AlertTriangle,
  FileCheck,
  UserX,
  FileSpreadsheet
} from 'lucide-react';

interface MentorMetric {
  id: number;
  name: string;
  specialization: string;
  company: string;
  designation: string;
  photo: string;
  sessions: number;
  rating: number;
  status: string;
}

interface Trend {
  date: string;
  activeSessions: number;
}

interface AlertItem {
  id: number;
  type: string;
  detail: string;
  priority: string;
  time: string;
}

export const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalActiveUsers: 12842,
    verifiedMentors: 1402,
    monthlyBookings: 4920,
  });
  
  const [mentorPerformance, setMentorPerformance] = useState<MentorMetric[]>([]);
  const [engagementTrends, setEngagementTrends] = useState<Trend[]>([]);
  const [moderationQueue, setModerationQueue] = useState<AlertItem[]>([]);
  const [activeTab, setActiveTab] = useState<'Active' | 'Pending' | 'Disabled'>('Active');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/dashboard/admin');
      // Mix mock visual data with DB counts
      setMetrics({
        totalActiveUsers: 12000 + data.metrics.totalActiveUsers,
        verifiedMentors: 1300 + data.metrics.verifiedMentors,
        monthlyBookings: 4800 + data.metrics.monthlyBookings,
      });
      setMentorPerformance(data.mentorPerformance);
      setEngagementTrends(data.engagementTrends);
      setModerationQueue(data.moderationQueue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleActionClick = (mentorName: string) => {
    alert(`Administrative action menu triggered for ${mentorName}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <RefreshCw className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  // Filter performance rows by tab selection
  const filteredPerformance = mentorPerformance.filter(m => m.status === activeTab);

  return (
    <div className="space-y-8">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => alert('Exporting dashboard PDF report...')}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-400" />
            <span>Export Reports</span>
          </button>
          
          <button
            onClick={fetchAdminData}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Active Users */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700">
              <Users className="h-5 w-5" />
            </div>
            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>+12%</span>
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Active Users</p>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
              {metrics.totalActiveUsers.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Verified Mentors */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-teal-600">
              <Award className="h-5 w-5" />
            </div>
            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>+5%</span>
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verified Mentors</p>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
              {metrics.verifiedMentors.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Monthly Bookings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="bg-rose-50 text-rose-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center space-x-1">
              <TrendingDown className="h-3 w-3" />
              <span>-2%</span>
            </span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Monthly Bookings</p>
            <p className="text-3xl font-extrabold text-slate-800 tracking-tight mt-1">
              {metrics.monthlyBookings.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main layout splitting charts & moderation queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement Trends custom graph */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Engagement Trends</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">User activity over the last 30 days</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-500">
              <span className="h-2.5 w-2.5 bg-brand rounded-full"></span>
              <span>Active Sessions</span>
            </div>
          </div>

          {/* CSS simulated bar graphs matching the mockup */}
          <div className="h-64 flex items-end justify-between px-2 pt-6 border-b border-slate-100">
            {engagementTrends.map((t, idx) => {
              // Scale height relative to max activeSessions (assume max is 18)
              const heightPercent = Math.min(100, Math.max(15, (t.activeSessions / 18) * 100));
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  {/* Tooltip */}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded absolute -translate-y-8 shadow-sm">
                    {t.activeSessions}
                  </span>
                  
                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-8 bg-brand-light hover:bg-brand rounded-t-md transition-all cursor-pointer duration-300"
                  />
                  
                  {/* Label */}
                  <span className="text-[9px] text-slate-400 font-bold mt-2 truncate w-full text-center">
                    {t.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Moderation Queue widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Moderation Queue</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Requires immediate attention</p>
          </div>

          <div className="space-y-4 my-6">
            {moderationQueue.map(item => (
              <div
                key={item.id}
                onClick={() => alert(`Moderator view for ${item.type} activated.`)}
                className="flex items-start space-x-3.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className={`p-2.5 rounded-lg mt-0.5 ${
                  item.priority === 'High' 
                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                    : item.priority === 'Medium' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.priority === 'High' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : item.priority === 'Medium' ? (
                    <FileCheck className="h-4 w-4" />
                  ) : (
                    <UserX className="h-4 w-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-xs truncate">{item.type}</h4>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert('Loading full moderation audit logs...')}
            className="w-full text-center text-xs font-bold text-slate-600 hover:text-brand bg-slate-50 hover:bg-slate-100 py-2.5 rounded-xl border border-slate-200/50 transition-colors mt-auto"
          >
            View All Alerts
          </button>
        </div>
      </div>

      {/* Mentor Performance table widget */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-sm">Mentor Performance</h3>

          {/* Table Tab filters */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white text-xs font-bold text-slate-500 shadow-sm">
            {(['Active', 'Pending', 'Disabled'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 transition-colors ${
                  activeTab === tab 
                    ? 'bg-brand-light/20 text-brand' 
                    : 'hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/20">
                <th className="px-6 py-3.5">Mentor</th>
                <th className="px-6 py-3.5">Specialization</th>
                <th className="px-6 py-3.5">Sessions</th>
                <th className="px-6 py-3.5">Rating</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-xs text-slate-400">
                    No mentors found in this category.
                  </td>
                </tr>
              ) : (
                filteredPerformance.map(m => (
                  <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center space-x-3">
                      <img
                        src={m.photo || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face"}
                        alt={m.name}
                        className="h-9 w-9 rounded-full object-cover border border-slate-100"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800">{m.name}</h4>
                        <p className="text-[10px] text-slate-400">{m.designation}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="bg-teal-50 text-[10px] font-bold text-brand px-2.5 py-1 rounded-md">
                        {m.specialization}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {m.sessions}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1 text-slate-600 font-bold">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span>{m.rating}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleActionClick(m.name)}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View All footer link */}
        <div className="px-6 py-4 text-center border-t border-slate-100 bg-slate-50/20">
          <button
            onClick={() => alert('Displaying all registered mentors...')}
            className="text-xs font-bold text-brand hover:underline"
          >
            View All Mentors
          </button>
        </div>
      </div>
    </div>
  );
};
