
import React, { useState } from 'react';
import { HBSGroup, HBSMember, HBSSession } from '../../types';
import { MOCK_SESSIONS, MOCK_GROUPS, MOCK_MEMBERS } from '../../data/mockHBS';
import {
  LayoutDashboard, Users, Calendar, Settings, Bell, Search,
  Phone, AlertTriangle, Flag, ChevronLeft, ChevronRight,
  Plus, Edit, Check, Clock, User, TrendingUp, Activity,
  Download, Filter, MessageCircle, X, Home, FileText
} from 'lucide-react';
import { Input, Select } from '../FormControls';

// Mock data for the dashboard
const MOCK_ACTIVITIES = [
  { id: '1', text: 'Emma Wilson submitted prayer request', time: '2 hours ago', avatar: 'EW' },
  { id: '2', text: 'John Smith marked attendance for Jan 18 session', time: '1 day ago', avatar: 'JS' },
  { id: '3', text: 'Sarah Mitchell uploaded study materials', time: '2 days ago', avatar: 'SM' },
  { id: '4', text: 'Group discussion notes updated', time: '3 days ago', avatar: 'GD' },
];

const MOCK_RED_FLAGS = [
  { id: '1', name: 'Michael Chen', issue: 'Missed 3 consecutive sessions', lastSeen: 'Dec 14, 2024' },
  { id: '2', name: 'Jennifer Lopez', issue: 'Low participation score (32)', note: 'Pastoral note: Personal struggles' },
  { id: '3', name: 'David Kim', issue: 'Requested prayer support', note: 'Follow-up needed' },
];

const MOCK_DIRECTORY_MEMBERS = [
  { id: 'm1', fullName: 'Sarah Johnson', email: 'sarah.j@email.com', mobilePhone: '(123) 456-7890', participationScore: 85, status: 'Active' as const, role: 'Leader' as const },
  { id: 'm2', fullName: 'Michael Chen', email: 'm.chen@email.com', mobilePhone: '(123) 456-7891', participationScore: 25, status: 'Red Flag' as const, role: 'Member' as const },
  { id: 'm3', fullName: 'Emma Rodriguez', email: 'emma.r@email.com', mobilePhone: '(123) 456-7892', participationScore: 72, status: 'Moderate' as const, role: 'Member' as const },
  { id: 'm4', fullName: 'John Smith', email: 'john.s@email.com', mobilePhone: '(123) 456-7893', participationScore: 91, status: 'Active' as const, role: 'Member' as const },
  { id: 'm5', fullName: 'Lisa Wang', email: 'lisa.w@email.com', mobilePhone: '(123) 456-7894', participationScore: 45, status: 'Moderate' as const, role: 'Member' as const },
];

const MOCK_REGISTERED_MEMBERS = [
  { id: 'rm1', fullName: 'Abebe Bikila', email: 'abebe.b@email.com', mobilePhone: '+251911223344' },
  { id: 'rm2', fullName: 'Kebede Michael', email: 'kebede.m@email.com', mobilePhone: '+251911556677' },
  { id: 'rm3', fullName: 'Almaz Ayana', email: 'almaz.a@email.com', mobilePhone: '+251911889900' },
  { id: 'rm4', fullName: 'Tirunesh Dibaba', email: 'tiru.d@email.com', mobilePhone: '+251911112233' },
  { id: 'rm5', fullName: 'Daniel Tekle', email: 'dan.t@email.com', mobilePhone: '+251912334455' },
  { id: 'rm6', fullName: 'Martha Hailu', email: 'martha.h@email.com', mobilePhone: '+251912667788' },
];

const MOCK_UPCOMING_SESSIONS: HBSSession[] = [
  { id: 's0', groupId: 'g1', sessionDate: '2025-12-22', topic: 'Active Fellowship Discussion', discussionLeaderId: 'm1', status: 'Scheduled', attendance: {} },
  { id: 's1', groupId: 'g1', sessionDate: '2025-12-30', topic: 'Prayer & Fellowship', discussionLeaderId: 'm1', status: 'Scheduled', attendance: {} },
  { id: 's2', groupId: 'g1', sessionDate: '2025-01-05', topic: 'Bible Study - Romans Chapter 8', discussionLeaderId: 'm2', status: 'Scheduled', attendance: {} },
];

const MOCK_PAST_SESSIONS: HBSSession[] = [
  { id: 's3', groupId: 'g1', sessionDate: '2025-12-15', topic: 'New Year Prayer Meeting', discussionLeaderId: 'm1', status: 'Completed', attendance: { 'm1': true, 'm2': true, 'm3': false } },
  { id: 's4', groupId: 'g1', sessionDate: '2025-12-08', topic: 'End of Year Reflection', discussionLeaderId: 'm3', status: 'Completed', attendance: { 'm1': true, 'm2': false, 'm3': true } },
];

type NavItem = 'dashboard' | 'members' | 'sessions' | 'settings';

export const HBSPortal = () => {
  const [activeNav, setActiveNav] = useState<NavItem>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Members state
  const [searchTerm, setSearchTerm] = useState('');
  const [showRedFlagOnly, setShowRedFlagOnly] = useState(false);
  const [showLowParticipation, setShowLowParticipation] = useState(false);
  const [participationFilter, setParticipationFilter] = useState(0);

  // Sessions state
  const [sessionTab, setSessionTab] = useState<'upcoming' | 'past' | 'active'>('active');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSession, setEditingSession] = useState<HBSSession | null>(null);
  const [newSession, setNewSession] = useState({ topic: '', date: '', time: '10:00', leaderId: '' });

  // Attendance & Sessions state
  const [upcomingSessions, setUpcomingSessions] = useState<HBSSession[]>(MOCK_UPCOMING_SESSIONS);
  const [pastSessions, setPastSessions] = useState<HBSSession[]>(MOCK_PAST_SESSIONS);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [nextLeaderId, setNextLeaderId] = useState<string>('');

  // Member Note Modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedMemberForNote, setSelectedMemberForNote] = useState<string | null>(null);
  const [memberNote, setMemberNote] = useState({ title: '', note: '', isRedFlag: false });

  // Add Group Member state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [groupMembers, setGroupMembers] = useState(MOCK_DIRECTORY_MEMBERS);

  const handleOpenNoteModal = (memberId: string) => {
    setSelectedMemberForNote(memberId);
    setMemberNote({ title: '', note: '', isRedFlag: false });
    setShowNoteModal(true);
  };

  const handleSubmitNote = () => {
    // In a real app, save the note to the backend
    console.log('Note/Question submitted:', { memberId: selectedMemberForNote, ...memberNote });

    // Simulate notification to pastor
    alert(`Question submitted for ${MOCK_DIRECTORY_MEMBERS.find(m => m.id === selectedMemberForNote)?.fullName}. Pastor has been notified.`);

    setShowNoteModal(false);
    setSelectedMemberForNote(null);
    setMemberNote({ title: '', note: '', isRedFlag: false });
  };

  const currentGroup = MOCK_GROUPS[0]; // For demo, use first group

  const activeSession = upcomingSessions.find(s => s.sessionDate === '2025-12-22');
  const nextDisplaySession = activeSession || upcomingSessions[0];

  const filteredMembers = groupMembers.filter(member => {
    const matchesSearch = member.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRedFlag = !showRedFlagOnly || member.status === 'Red Flag';
    const matchesLowPart = !showLowParticipation || member.participationScore < 30;
    const matchesScore = member.participationScore >= participationFilter;
    return matchesSearch && matchesRedFlag && matchesLowPart && matchesScore;
  });

  const searchableMembers = MOCK_REGISTERED_MEMBERS.filter(m =>
    !groupMembers.find(gm => gm.fullName === m.fullName) &&
    (m.fullName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.mobilePhone.includes(memberSearchQuery))
  );

  const handleAddMemberToGroup = (member: typeof MOCK_REGISTERED_MEMBERS[0]) => {
    const newGroupMember = {
      id: member.id,
      fullName: member.fullName,
      email: member.email,
      mobilePhone: member.mobilePhone,
      participationScore: 100, // New members start with high potential!
      status: 'Active' as const,
      role: 'Member' as const
    };

    setGroupMembers([...groupMembers, newGroupMember]);
    setShowAddMemberModal(false);
    setMemberSearchQuery('');
    alert(`${member.fullName} has been added to the group!`);
  };

  const NavButton = ({ id, label, icon: Icon }: { id: NavItem, label: string, icon: any }) => (
    <button
      onClick={() => setActiveNav(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
        ${activeNav === id
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100'
        }
        ${sidebarCollapsed ? 'justify-center' : ''}
      `}
    >
      <Icon size={20} />
      {!sidebarCollapsed && <span>{label}</span>}
    </button>
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex h-full min-h-[700px] bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Users size={16} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="font-bold text-gray-900">HBS Portal</h1>
              <p className="text-xs text-gray-500">Leader Dashboard</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <NavButton id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavButton id="members" label="Group Directory" icon={Users} />
          <NavButton id="sessions" label="Sessions" icon={Calendar} />
          <NavButton id="settings" label="Settings" icon={Settings} />
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-4 border-t border-gray-200 text-gray-400 hover:text-gray-600 flex items-center justify-center"
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-gray-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">
              {activeNav === 'dashboard' && 'HBS Leader Dashboard'}
              {activeNav === 'members' && 'My Group Directory'}
              {activeNav === 'sessions' && 'Session Management'}
              {activeNav === 'settings' && 'Settings'}
            </h1>
            {activeNav === 'members' && (
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                Zone Alpha - Cell 3
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {activeNav === 'sessions' && (
              <button
                onClick={() => setShowScheduleModal(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors"
              >
                <Plus size={16} />
                Schedule New Session
              </button>
            )}
            {activeNav === 'members' && (
              <div className="flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm">
                <span className="font-bold">{MOCK_DIRECTORY_MEMBERS.length}</span>
                <span>Total Members</span>
              </div>
            )}
            <button className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
              <img src="https://ui-avatars.com/api/?name=User&background=e5e7eb" alt="" className="w-full h-full" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">

          {/* DASHBOARD VIEW */}
          {activeNav === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Group Overview Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Group Alpha Overview</h2>
                <p className="text-amber-700">Weekly Bible Study Group - Led by <span className="font-medium">Pastor Johnson</span></p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Participation Score */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Group Participation Score</span>
                    <TrendingUp size={16} className="text-gray-400" />
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                        <circle cx="48" cy="48" r="40" stroke="#1f2937" strokeWidth="8" fill="none"
                          strokeDasharray={`${85 * 2.51} 251`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">85</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">Above Average</p>
                </div>

                {/* Attendance Trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Attendance Trend</span>
                    <Activity size={16} className="text-gray-400" />
                  </div>
                  <div className="flex items-end justify-center gap-2 h-20">
                    {[60, 80, 45, 90, 70].map((val, i) => (
                      <div key={i} className="w-6 bg-gray-900 rounded-t" style={{ height: `${val}%` }}></div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-700 mt-3">Last 4 sessions</p>
                  <p className="text-lg font-bold text-gray-900">12 avg</p>
                </div>

                {/* Active Members */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Active Members</span>
                    <Users size={16} className="text-gray-400" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900">18</p>
                  <p className="text-sm text-green-600 mt-1">↑ +2 this month</p>
                </div>

                {/* Next Session */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Next Session</span>
                    <div className={`p-1.5 rounded-lg ${activeSession ? 'bg-green-50 text-green-600 animate-pulse' : 'bg-amber-50 text-amber-600'}`}>
                      <Calendar size={18} />
                    </div>
                  </div>

                  {nextDisplaySession ? (
                    <>
                      <div className="flex flex-col gap-0.5 mb-3">
                        <p className="font-black text-2xl text-gray-900">
                          {new Date(nextDisplaySession.sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-sm font-bold text-gray-500 uppercase flex items-center gap-1.5">
                          <Clock size={12} />
                          10:00 AM
                        </p>
                      </div>

                      <p className="text-sm font-bold text-amber-700 mb-1 line-clamp-1">{nextDisplaySession.topic}</p>
                      <p className="text-xs text-gray-400 font-medium">
                        Leader: <span className="text-gray-900">{MOCK_DIRECTORY_MEMBERS.find(m => m.id === nextDisplaySession.discussionLeaderId)?.fullName || 'TBD'}</span>
                      </p>

                      {activeSession ? (
                        <button
                          onClick={() => {
                            const initialAttendance: Record<string, boolean> = {};
                            MOCK_DIRECTORY_MEMBERS.forEach(m => initialAttendance[m.id] = false);
                            setAttendanceData(initialAttendance);
                            setShowAttendanceModal(true);
                          }}
                          className="w-full mt-4 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-black hover:bg-black transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                        >
                          <Activity size={16} />
                          Start Attendance
                        </button>
                      ) : (
                        <div className="mt-4 pt-3 border-t border-gray-50">
                          <button
                            disabled
                            className="w-full bg-gray-100 text-gray-400 py-2.5 rounded-xl text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <Clock size={16} />
                            Starts in 3 days
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic py-4">No sessions scheduled</p>
                  )}
                </div>
              </div>

              {/* Red Flags & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Red Flag Alerts */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Red Flag Alerts</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{MOCK_RED_FLAGS.length}</span>
                  </div>
                  <div className="space-y-4">
                    {MOCK_RED_FLAGS.map(flag => (
                      <div key={flag.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <AlertTriangle size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{flag.name}</p>
                          <p className="text-sm text-gray-600">{flag.issue}</p>
                          {flag.lastSeen && <p className="text-xs text-gray-400 mt-1">Last attended: {flag.lastSeen}</p>}
                          {flag.note && <p className="text-xs text-gray-400 mt-1">{flag.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Recent Activity</h3>
                    <button className="text-sm text-amber-700 hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                    {MOCK_ACTIVITIES.map(activity => (
                      <div key={activity.id} className="flex gap-3 items-start">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                          {activity.avatar}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{activity.text}</p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MEMBERS DIRECTORY VIEW */}
          {activeNav === 'members' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Search & Filters */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-amber-700">Search & Filters</h3>
                  <button
                    onClick={() => { setSearchTerm(''); setShowRedFlagOnly(false); setShowLowParticipation(false); setParticipationFilter(0); }}
                    className="text-sm text-amber-700 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Members</label>
                    <div className="relative">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div className="flex gap-4 mt-3">
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={showRedFlagOnly}
                          onChange={e => setShowRedFlagOnly(e.target.checked)}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        Show Red Flag Members Only
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={showLowParticipation}
                          onChange={e => setShowLowParticipation(e.target.checked)}
                          className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        Low Participation (&lt;30)
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Participation Score</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={participationFilter}
                      onChange={e => setParticipationFilter(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>0</span>
                      <span>50+</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Group Members</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    Showing {filteredMembers.length} of {MOCK_DIRECTORY_MEMBERS.length} members
                    <button className="p-1.5 hover:bg-gray-100 rounded"><Download size={16} /></button>
                  </div>
                </div>

                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Mobile Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Participation Score</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMembers.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                              <img src={`https://ui-avatars.com/api/?name=${member.fullName}&background=e5e7eb`} alt="" className="w-full h-full" />
                            </div>
                            <div>
                              <p className="font-medium text-amber-700">{member.fullName}</p>
                              <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} className="text-gray-400" />
                            {member.mobilePhone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">{member.participationScore}</span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${member.participationScore > 70 ? 'bg-gray-900' : member.participationScore > 40 ? 'bg-gray-600' : 'bg-gray-400'}`}
                                style={{ width: `${member.participationScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {member.status === 'Active' && <span className="text-sm text-gray-600">Active</span>}
                          {member.status === 'Red Flag' && (
                            <span className="inline-flex items-center gap-1 text-sm text-red-600">
                              <Flag size={12} />
                              Red Flag
                            </span>
                          )}
                          {member.status === 'Moderate' && <span className="text-sm text-gray-500">Moderate</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
                              <User size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenNoteModal(member.id)}
                              className="p-1.5 hover:bg-gray-100 rounded text-amber-600 hover:text-amber-700 font-bold"
                              title="Ask a Question / Note"
                            >
                              <MessageCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    Show
                    <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                    </select>
                    per page
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded text-gray-400"><ChevronLeft size={16} /></button>
                    <button className="w-8 h-8 bg-gray-900 text-white rounded text-sm font-medium">1</button>
                    <button className="w-8 h-8 hover:bg-gray-100 rounded text-sm text-gray-600">2</button>
                    <button className="w-8 h-8 hover:bg-gray-100 rounded text-sm text-gray-600">3</button>
                    <button className="p-2 hover:bg-gray-100 rounded text-gray-400"><ChevronRight size={16} /></button>
                  </div>
                </div>

                {/* Add Member Button */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-center">
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-dashed border-gray-300 text-gray-600 rounded-xl font-bold hover:border-amber-500 hover:text-amber-700 hover:bg-amber-50/30 transition-all active:scale-95 group shadow-sm"
                  >
                    <Plus size={20} className="text-gray-400 group-hover:text-amber-600" />
                    Add Group Member
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SESSIONS VIEW */}
          {activeNav === 'sessions' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="flex gap-6">
                  <button
                    onClick={() => setSessionTab('upcoming')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${sessionTab === 'upcoming' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'
                      }`}
                  >
                    Upcoming Sessions
                  </button>
                  <button
                    onClick={() => setSessionTab('past')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${sessionTab === 'past' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'
                      }`}
                  >
                    Past Sessions
                  </button>
                  <button
                    onClick={() => setSessionTab('active')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${sessionTab === 'active' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500'
                      }`}
                  >
                    Active Sessions (Now)
                  </button>
                </nav>
              </div>

              {/* Sessions List */}
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {sessionTab === 'upcoming' && upcomingSessions.map(session => (
                  <div key={session.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-amber-700">{session.topic}</h3>
                          <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded">Upcoming</span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(session.sessionDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            10:00 AM - 11:30 AM
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-400" />
                            Leader: {MOCK_DIRECTORY_MEMBERS.find(m => m.id === session.discussionLeaderId)?.fullName || 'TBD'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingSession(session);
                            setNewSession({
                              topic: session.topic,
                              date: session.sessionDate,
                              time: '10:00', // Mock time as it's not in the data structure yet
                              leaderId: session.discussionLeaderId
                            });
                            setShowScheduleModal(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded border border-gray-200"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {sessionTab === 'past' && pastSessions.map(session => (
                  <div key={session.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-700">{session.topic}</h3>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">Completed</span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(session.sessionDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            {Object.values(session.attendance).filter(Boolean).length} attended
                          </div>
                        </div>
                      </div>
                      <button className="text-sm text-amber-700 hover:underline">View Details</button>
                    </div>
                  </div>
                ))}

                {sessionTab === 'active' && (
                  <div className="animate-fadeIn">
                    {upcomingSessions.filter(s => s.sessionDate === '2025-12-22').length > 0 ? (
                      upcomingSessions.filter(s => s.sessionDate === '2025-12-22').map(session => (
                        <div key={session.id} className="p-8 bg-blue-50/30 border-l-4 border-blue-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-5">
                              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-blue-200 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Dec</span>
                                <span className="text-2xl font-black leading-none">22</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-2xl font-black text-gray-900">{session.topic}</h3>
                                  <div className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold animate-pulse">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    LIVE NOW
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-4 text-gray-600">
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-sm">
                                    <Clock size={16} className="text-blue-500" />
                                    <span className="font-bold">2:00 PM - 4:00 PM</span>
                                  </div>
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-sm">
                                    <User size={16} className="text-blue-500" />
                                    <span>Leader: <span className="font-bold text-gray-900">{MOCK_DIRECTORY_MEMBERS.find(m => m.id === session.discussionLeaderId)?.fullName}</span></span>
                                  </div>
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-sm">
                                    <Users size={16} className="text-blue-500" />
                                    <span className="font-bold">18 Registered</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              {/* <button
                                onClick={() => {
                                  setEditingSession(session);
                                  setNewSession({
                                    topic: session.topic,
                                    date: session.sessionDate,
                                    time: '14:00',
                                    leaderId: session.discussionLeaderId
                                  });
                                  setShowScheduleModal(true);
                                }}
                                className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                              >
                                <Edit size={18} />
                                Edit Session
                              </button> */}
                              <button
                                onClick={() => {
                                  const initialAttendance: Record<string, boolean> = {};
                                  MOCK_DIRECTORY_MEMBERS.forEach(m => initialAttendance[m.id] = false);
                                  setAttendanceData(initialAttendance);
                                  setShowAttendanceModal(true);
                                }}
                                className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-xl shadow-gray-200 hover:bg-black transition-all hover:-translate-y-1 flex items-center gap-2"
                              >
                                <Activity size={18} />
                                Start Session
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <Clock size={48} className="mx-auto text-gray-200 mb-4" />
                        <h4 className="font-bold text-gray-900 text-lg">No sessions scheduled for right now</h4>
                        <p className="text-sm mt-1">Sessions appear here when it's time to meet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
          }

          {/* SETTINGS VIEW */}
          {
            activeNav === 'settings' && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 animate-fadeIn">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Group Settings</h2>
                <p className="text-gray-500">Settings panel coming soon...</p>
              </div>
            )
          }
        </main >

        {/* Footer */}
        < footer className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between text-sm text-gray-500" >
          <span>© 2025 HBS Management System. All rights reserved.</span>
          <div className="flex gap-4">
            <button className="hover:text-gray-700">Help</button>
            <button className="hover:text-gray-700">Settings</button>
          </div>
        </footer >
      </div >

      {/* Attendance Modal */}
      {
        showAttendanceModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scaleIn flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-900 text-white">
                <div>
                  <h3 className="font-bold text-xl">Session Attendance</h3>
                  <p className="text-gray-400 text-sm mt-1">{activeSession?.topic || 'Session'} • Dec 22, 2025 • {MOCK_DIRECTORY_MEMBERS.length} Total Members</p>
                </div>
                <button onClick={() => setShowAttendanceModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_DIRECTORY_MEMBERS.map(member => (
                    <div
                      key={member.id}
                      onClick={() => setAttendanceData(prev => ({ ...prev, [member.id]: !prev[member.id] }))}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer select-none
                      ${attendanceData[member.id]
                          ? 'border-gray-900 bg-white shadow-md'
                          : 'border-transparent bg-white hover:border-gray-200'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={`https://ui-avatars.com/api/?name=${member.fullName}&background=${attendanceData[member.id] ? '111827' : 'e5e7eb'}&color=${attendanceData[member.id] ? 'ffffff' : '6b7280'}`}
                            alt=""
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                          />
                          {attendanceData[member.id] && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 rounded-full border-2 border-white flex items-center justify-center">
                              <Check size={8} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${attendanceData[member.id] ? 'text-gray-900' : 'text-gray-600'}`}>
                            {member.fullName}
                          </p>
                          <p className="text-xs text-gray-400">Regular Participant</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                      ${attendanceData[member.id] ? 'bg-gray-900 border-gray-900' : 'border-gray-200'}
                    `}>
                        {attendanceData[member.id] && <Check size={14} className="text-white" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User size={14} className="text-gray-900" />
                    Assign Next Week's Session Leader
                  </label>
                  <div className="relative">
                    <select
                      value={nextLeaderId}
                      onChange={(e) => setNextLeaderId(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select member to lead next...</option>
                      {MOCK_DIRECTORY_MEMBERS.map(member => (
                        <option key={member.id} value={member.id}>{member.fullName}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 font-medium italic">Scheduling for Dec 29, 2025 • 2:00 PM</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-900 leading-none">
                        {Object.values(attendanceData).filter(Boolean).length}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Present</p>
                    </div>
                    <div className="h-8 w-px bg-gray-100"></div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-400 leading-none">
                        {MOCK_DIRECTORY_MEMBERS.length - Object.values(attendanceData).filter(Boolean).length}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Absent</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAttendanceModal(false)}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => {
                        // Logic to reschedule and save
                        const currentActiveSession = upcomingSessions.find(s => s.sessionDate === '2025-12-22');
                        if (currentActiveSession) {
                          // 1. Mark current as completed and move to past
                          const completedSession: HBSSession = {
                            ...currentActiveSession,
                            status: 'Completed',
                            attendance: attendanceData
                          };
                          setPastSessions(prev => [completedSession, ...prev]);
                          setUpcomingSessions(prev => prev.filter(s => s.id !== currentActiveSession.id));

                          // 2. Schedule next week's session
                          if (nextLeaderId) {
                            const nextSession: HBSSession = {
                              id: `s-next-${Date.now()}`,
                              groupId: currentActiveSession.groupId,
                              sessionDate: '2025-12-29',
                              topic: 'Divine Restoration & Purpose', // Example topic for next week
                              discussionLeaderId: nextLeaderId,
                              status: 'Scheduled',
                              attendance: {}
                            };
                            setUpcomingSessions(prev => [...prev, nextSession]);
                          }
                        }

                        console.log('Attendance saved and next session scheduled with leader:', nextLeaderId);
                        setShowAttendanceModal(false);
                        setNextLeaderId('');
                      }}
                      disabled={!nextLeaderId}
                      className="px-8 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      Submit Attendance
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Schedule/Edit Session Modal */}
      {
        showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-scaleIn">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">{editingSession ? 'Edit Session' : 'Schedule New Session'}</h3>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setEditingSession(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Session Topic *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="e.g. Bible Study - Romans Chapter 8"
                    value={newSession.topic}
                    onChange={e => setNewSession({ ...newSession, topic: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      value={newSession.date}
                      onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Time *</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      value={newSession.time}
                      onChange={e => setNewSession({ ...newSession, time: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Session Leader</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                    value={newSession.leaderId}
                    onChange={e => setNewSession({ ...newSession, leaderId: e.target.value })}
                  >
                    <option value="">Select a leader...</option>
                    {MOCK_DIRECTORY_MEMBERS.map(m => (
                      <option key={m.id} value={m.id}>{m.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setEditingSession(null);
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingSession) {
                      setUpcomingSessions(prev => prev.map(s => s.id === editingSession.id ? {
                        ...s,
                        topic: newSession.topic,
                        sessionDate: newSession.date,
                        discussionLeaderId: newSession.leaderId
                      } : s));
                    } else {
                      // Logic for new session
                      const nextSession: HBSSession = {
                        id: `s-custom-${Date.now()}`,
                        groupId: 'g1',
                        sessionDate: newSession.date,
                        topic: newSession.topic,
                        discussionLeaderId: newSession.leaderId,
                        status: 'Scheduled',
                        attendance: {}
                      };
                      setUpcomingSessions(prev => [...prev, nextSession]);
                    }
                    setShowScheduleModal(false);
                    setEditingSession(null);
                    setNewSession({ topic: '', date: '', time: '10:00', leaderId: '' });
                  }}
                  disabled={!newSession.topic || !newSession.date}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black disabled:opacity-50"
                >
                  {editingSession ? 'Save Changes' : 'Schedule Session'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Add Member Note Modal */}
      {
        showNoteModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-scaleIn">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <MessageCircle size={20} className="text-amber-600" />
                  Submit Question for {MOCK_DIRECTORY_MEMBERS.find(m => m.id === selectedMemberForNote)?.fullName}
                </h3>
                <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Red Flag Checkbox */}
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                  <input
                    type="checkbox"
                    id="redFlagNote"
                    checked={memberNote.isRedFlag}
                    onChange={e => setMemberNote({ ...memberNote, isRedFlag: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="redFlagNote" className="text-sm font-medium text-red-800">
                    <span className="flex items-center gap-1">
                      <Flag size={14} />
                      Mark as Urgent (Notify Pastor Immediately)
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="e.g. Follow-up needed, Prayer request, etc."
                    value={memberNote.title}
                    onChange={e => setMemberNote({ ...memberNote, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description / Question *</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    rows={4}
                    placeholder="Enter detailed notes about the member..."
                    value={memberNote.note}
                    onChange={e => setMemberNote({ ...memberNote, note: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNote}
                  disabled={!memberNote.title || !memberNote.note}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  Send to Pastor
                </button>
              </div>
            </div>
          </div>
        )
      }
      {/* ADD MEMBER MODAL */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAddMemberModal(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-slideUp overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-black text-gray-900">Add New Member</h2>
                <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-500 font-medium">Search the register to add a member to this group</p>
            </div>

            <div className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="search member"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none font-medium"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {memberSearchQuery.length > 0 ? (
                  searchableMembers.length > 0 ? (
                    searchableMembers.map(member => (
                      <div
                        key={member.id}
                        onClick={() => handleAddMemberToGroup(member)}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold group-hover:bg-amber-100 group-hover:text-amber-700">
                            {member.fullName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{member.fullName}</p>
                            <p className="text-[10px] text-gray-500 font-medium">{member.mobilePhone}</p>
                          </div>
                        </div>
                        <Plus size={18} className="text-gray-300 group-hover:text-amber-600" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users size={32} className="mx-auto text-gray-200 mb-2" />
                      <p className="text-sm text-gray-400 font-medium">No members found</p>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <Search size={32} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400 font-medium">Type to search registered members</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};
