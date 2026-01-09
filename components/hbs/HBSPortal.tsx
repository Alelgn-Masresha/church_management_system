import React, { useState } from 'react';
import { HBSGroup, HBSMember, HBSSession, Member, PastoralNote } from '../../types';
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

interface Props {
  groups: HBSGroup[];
  members: Member[];
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>;
  submitNote: (noteData: any) => Promise<void>;
  fetchMemberNotes: (memberId: string) => Promise<PastoralNote[]>;
  fetchSessions: (groupId: string) => Promise<HBSSession[]>;
  scheduleSession: (sessionData: any) => Promise<HBSSession>;
  updateSession: (id: string, sessionData: any) => Promise<HBSSession>;
  recordAttendance: (sessionId: string, attendanceData: any) => Promise<void>;
}

export const HBSPortal: React.FC<Props> = ({
  groups, members, updateMember, submitNote, fetchMemberNotes,
  fetchSessions, scheduleSession, updateSession, recordAttendance
}) => {
  // Member View State
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [currentMemberNotes, setCurrentMemberNotes] = useState<PastoralNote[]>([]);

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
  const [newSession, setNewSession] = useState({ topic: '', date: '', startTime: '18:00', endTime: '20:00', leaderId: '' });

  // Attendance & Sessions state
  const [upcomingSessions, setUpcomingSessions] = useState<HBSSession[]>([]);
  const [pastSessions, setPastSessions] = useState<HBSSession[]>([]);
  const [activeSessions, setActiveSessions] = useState<HBSSession[]>([]);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});
  const [nextLeaderId, setNextLeaderId] = useState<string>('');
  const [nextTopic, setNextTopic] = useState<string>('');

  // Member Note Modal state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedMemberForNote, setSelectedMemberForNote] = useState<string | null>(null);
  const [memberNote, setMemberNote] = useState({ title: '', note: '', isRedFlag: false });

  // Add Group Member state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Login State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeGroup, setActiveGroup] = useState<HBSGroup | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const group = groups.find(g => g.name.trim().toLowerCase() === loginUsername.trim().toLowerCase());

    if (group) {
      if (loginPassword === '1234') {
        setActiveGroup(group);
        setIsAuthenticated(true);
        setLoginError('');

        // Fetch real sessions for this group
        const sessions = await fetchSessions(group.id);
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const upcoming = sessions
          .filter(s => s.sessionDate > todayStr && s.status === 'Scheduled')
          .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
        const past = sessions
          .filter(s => s.sessionDate < todayStr || s.status === 'Completed')
          .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
        const active = sessions.filter(s => s.sessionDate === todayStr && s.status === 'Scheduled');

        setUpcomingSessions(upcoming);
        setPastSessions(past);
        setActiveSessions(active);

      } else {
        setLoginError('Invalid password.');
      }
    } else {
      setLoginError('Cell group not found. Please check the name.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-auto h-12 w-12 bg-black text-white rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            HBS Portal Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your cell group name to access the dashboard
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Cell Group Name
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="e.g. Arat Kilo Group"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="hint: 1234"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-2 bg-red-50 border border-red-100 rounded text-red-600 text-sm flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {loginError}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Safe to access activeGroup here because if not authenticated we returned above.
  const currentGroup = activeGroup!;

  // Real data derivation
  const groupMembers = members.filter(m => m.assignedGroupId === currentGroup.id);

  // Add Member: Searchable members are those NOT in the current group
  const searchableMembers = members.filter(m =>
    m.assignedGroupId !== currentGroup.id &&
    (
      m.firstName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.lastName.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      m.mobilePhone.includes(memberSearchQuery)
    )
  ).slice(0, 10); // Limit results

  const handleOpenNoteModal = (memberId: string) => {
    setSelectedMemberForNote(memberId);
    setMemberNote({ title: '', note: '', isRedFlag: false });
    setShowNoteModal(true);
  };

  const handleSubmitNote = async () => {
    if (!selectedMemberForNote || !currentGroup) return;

    const notePayload = {
      memberId: selectedMemberForNote,
      authorId: currentGroup.leaderId,
      title: memberNote.title,
      content: memberNote.note,
      noteType: 'question',
      location: 'Church Office', // Default or derived
      category: 'General',
      isRedFlag: memberNote.isRedFlag,
      status: 'new'
    };

    await submitNote(notePayload);

    // Refresh notes if we are currently viewing this member
    if (viewingMember && viewingMember.id === selectedMemberForNote) {
      const notes = await fetchMemberNotes(selectedMemberForNote);
      setCurrentMemberNotes(notes);
    }

    setShowNoteModal(false);
    setSelectedMemberForNote(null);
    setMemberNote({ title: '', note: '', isRedFlag: false });
  };



  const activeSession = activeSessions[0];
  const nextDisplaySession = activeSession || upcomingSessions[0];

  const filteredMembers = groupMembers.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase());
    // Mock red flag / participation logic as fields might be missing in basic member data
    const matchesRedFlag = !showRedFlagOnly || member.isRedFlagged;
    const matchesLowPart = !showLowParticipation || (member.participationScore || 0) < 30;
    const matchesScore = (member.participationScore || 0) >= participationFilter;
    return matchesSearch && matchesRedFlag && matchesLowPart && matchesScore;
  });



  const handleViewMember = async (member: Member) => {
    setViewingMember(member);
    const notes = await fetchMemberNotes(member.id);
    setCurrentMemberNotes(notes);
  };

  const handleAddMemberToGroup = async (member: Member) => {
    if (confirm(`Are you sure you want to add ${member.firstName} ${member.lastName} to ${currentGroup.name}?`)) {
      await updateMember(member.id, { assignedGroupId: currentGroup.id });
      setShowAddMemberModal(false);
      setMemberSearchQuery('');
      alert(`${member.firstName} has been added to the group.`);
    }
  };

  const getParticipationScore = (memberId: string) => {
    if (pastSessions.length === 0) return 0;
    const attendedSessions = pastSessions.filter(s => s.attendance && s.attendance[memberId]);
    return Math.round((attendedSessions.length / pastSessions.length) * 100);
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
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getDateParts = (dateStr: string) => {
    if (!dateStr) return { month: '', day: '' };
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate()
    };
  };

  // --- Dynamic Dashboard Calculations ---
  const groupAvgScore = groupMembers.length > 0
    ? Math.round(groupMembers.reduce((acc, m) => acc + getParticipationScore(m.id), 0) / groupMembers.length)
    : 0;

  const attendanceTrend = pastSessions.slice(0, 5).reverse().map(s => {
    const presentCount = s.attendance ? Object.values(s.attendance).filter(Boolean).length : 0;
    const total = groupMembers.length || 1;
    return Math.round((presentCount / total) * 100);
  });

  const avgAttendance = pastSessions.length > 0
    ? Math.round(pastSessions.reduce((acc, s) => {
      const presentCount = s.attendance ? Object.values(s.attendance).filter(Boolean).length : 0;
      return acc + (presentCount || 0);
    }, 0) / pastSessions.length)
    : 0;

  const nextSession = activeSessions[0] || upcomingSessions[0];

  const getRelativeTime = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `Starts in ${diffDays} days`;
  };

  const dynamicRedFlags = groupMembers
    .filter(m => getParticipationScore(m.id) < 40)
    .map(m => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      issue: `Low participation score (${getParticipationScore(m.id)})`,
      lastSeen: pastSessions.find(s => s.attendance?.[m.id]) ? formatDate(pastSessions.find(s => s.attendance?.[m.id])!.sessionDate) : 'Never'
    }))
    .slice(0, 3);

  const dynamicActivities = pastSessions.slice(0, 4).map(s => ({
    id: s.id,
    text: `Attendance marked for ${s.topic}`,
    time: getRelativeTime(s.sessionDate),
    avatar: s.leaderFirstName ? s.leaderFirstName[0] : 'S'
  }));

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
                Zone {groups.find(g => g.id === currentGroup.id)?.zoneId || '...'} - {currentGroup.name}
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
                <span className="font-bold">{groupMembers.length}</span>
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
                <h2 className="text-2xl font-bold text-gray-900">{currentGroup.name} Overview</h2>
                <p className="text-amber-700">Weekly Bible Study Group - Location: <span className="font-medium">{currentGroup.location}</span></p>
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
                          strokeDasharray={`${groupAvgScore * 2.51} 251`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{groupAvgScore}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {groupAvgScore > 70 ? 'Excellent' : groupAvgScore > 40 ? 'Above Average' : 'Needs Attention'}
                  </p>
                </div>

                {/* Attendance Trend */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Attendance Trend</span>
                    <Activity size={16} className="text-gray-400" />
                  </div>
                  <div className="flex items-end justify-center gap-2 h-20">
                    {attendanceTrend.length > 0 ? attendanceTrend.map((val, i) => (
                      <div key={i} className="w-6 bg-gray-900 rounded-t" style={{ height: `${val}%` }}></div>
                    )) : (
                      <div className="h-full flex items-center text-gray-300 text-xs italic">No data yet</div>
                    )}
                  </div>
                  <p className="text-xs text-amber-700 mt-3">Last {attendanceTrend.length} sessions</p>
                  <p className="text-lg font-bold text-gray-900">{avgAttendance} avg</p>
                </div>

                {/* Active Members */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Active Members</span>
                    <Users size={16} className="text-gray-400" />
                  </div>
                  <p className="text-4xl font-bold text-gray-900">{groupMembers.length}</p>
                  <p className="text-sm text-green-600 mt-1">Total Members</p>
                </div>

                {/* Next Session */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Next Session</span>
                    <div className={`p-1.5 rounded-lg ${activeSession ? 'bg-green-50 text-green-600 animate-pulse' : 'bg-amber-50 text-amber-600'}`}>
                      <Calendar size={18} />
                    </div>
                  </div>

                  {nextSession ? (
                    <>
                      <div className="flex flex-col gap-0.5 mb-3">
                        <p className="font-black text-2xl text-gray-900">
                          {formatDate(nextSession.sessionDate)}
                        </p>
                        <p className="text-sm font-bold text-gray-500 uppercase flex items-center gap-1.5">
                          <Clock size={12} />
                          {nextSession.startTime || '18:00'}
                        </p>
                      </div>

                      <p className="text-sm font-bold text-amber-700 mb-1 line-clamp-1">{nextSession.topic}</p>
                      <p className="text-xs text-gray-400 font-medium">
                        Leader: <span className="text-gray-900">{nextSession.leaderFirstName || 'TBD'}</span>
                      </p>

                      {activeSessions.some(s => s.id === nextSession.id) ? (
                        <button
                          onClick={() => {
                            const initialAttendance: Record<string, boolean> = {};
                            groupMembers.forEach(m => initialAttendance[m.id] = false);
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
                            {getRelativeTime(nextSession.sessionDate)}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic py-4 text-center">No sessions scheduled</p>
                  )}
                </div>
              </div>

              {/* Red Flags & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Red Flag Alerts */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Red Flag Alerts</h3>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{dynamicRedFlags.length}</span>
                  </div>
                  <div className="space-y-4">
                    {dynamicRedFlags.length > 0 ? dynamicRedFlags.map(flag => (
                      <div key={flag.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <AlertTriangle size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">{flag.name}</p>
                          <p className="text-sm text-gray-600">{flag.issue}</p>
                          {flag.lastSeen && <p className="text-xs text-gray-400 mt-1">Last attended: {flag.lastSeen}</p>}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-gray-400 text-sm italic">No red flags detected</div>
                    )}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Recent Activity</h3>
                    <button className="text-sm text-amber-700 hover:underline">View All</button>
                  </div>
                  <div className="space-y-4">
                    {dynamicActivities.length > 0 ? dynamicActivities.map(activity => (
                      <div key={activity.id} className="flex gap-3 items-start">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">
                          {activity.avatar}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{activity.text}</p>
                          <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-gray-400 text-sm italic">No recent activity</div>
                    )}
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
                    Showing {filteredMembers.length} of {groupMembers.length} members
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
                              <img src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=e5e7eb`} alt="" className="w-full h-full" />
                            </div>
                            <div>
                              <p className="font-medium text-amber-700">{member.firstName} {member.lastName}</p>
                              <p className="text-xs text-gray-500">{member.primaryEmail}</p>
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
                            <span className="text-sm font-medium text-gray-900">{getParticipationScore(member.id)}</span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getParticipationScore(member.id) > 70 ? 'bg-gray-900' : getParticipationScore(member.id) > 40 ? 'bg-gray-600' : 'bg-gray-400'}`}
                                style={{ width: `${getParticipationScore(member.id)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {member.status === 'Active' && <span className="text-sm text-gray-600">Active</span>}
                          {member.isRedFlagged && (
                            <span className="inline-flex items-center gap-1 text-sm text-red-600">
                              <Flag size={12} />
                              Red Flag
                            </span>
                          )}
                          {/* {member.status === 'Moderate' && <span className="text-sm text-gray-500">Moderate</span>} */}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewMember(member)}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                              title="View Member History"
                            >
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
                            {session.startTime || '18:00'} - {session.endTime || '20:00'}
                          </div>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-400" />
                            Leader: {members.find(m => m.id === session.discussionLeaderId)?.firstName || 'TBD'}
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
                              startTime: session.startTime || '18:00',
                              endTime: session.endTime || '20:00',
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
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${session.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {session.status}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(session.sessionDate)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={14} className="text-gray-400" />
                            {session.attendance ? Object.values(session.attendance).filter(Boolean).length : 0} attended
                          </div>
                        </div>
                      </div>
                      <button className="text-sm text-amber-700 hover:underline">View Details</button>
                    </div>
                  </div>
                ))}

                {sessionTab === 'active' && (
                  <div className="animate-fadeIn divide-y divide-gray-100">
                    {activeSessions.length > 0 ? (
                      activeSessions.map(session => (
                        <div key={session.id} className="p-8 bg-blue-50/30 border-l-4 border-blue-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-5">
                              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-blue-200 text-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                                  {getDateParts(session.sessionDate).month}
                                </span>
                                <span className="text-2xl font-black leading-none">
                                  {getDateParts(session.sessionDate).day}
                                </span>
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
                                    <span className="font-bold">{session.startTime || '10:00 AM'} - {session.endTime || '12:00 PM'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-sm">
                                    <User size={16} className="text-blue-500" />
                                    <span>Leader: <span className="font-bold text-gray-900">{members.find(m => m.id === session.discussionLeaderId)?.firstName} {members.find(m => m.id === session.discussionLeaderId)?.lastName}</span></span>
                                  </div>
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm text-sm">
                                    <Users size={16} className="text-blue-500" />
                                    <span className="font-bold">{groupMembers.length} Registered</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  const initialAttendance: Record<string, boolean> = {};
                                  groupMembers.forEach(m => initialAttendance[m.id] = false);
                                  setAttendanceData(initialAttendance);
                                  setNextTopic(session.topic);
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
                  <p className="text-gray-400 text-sm mt-1">{activeSession?.topic || 'Session'} • {activeSession ? formatDate(activeSession.sessionDate) : ''} • {groupMembers.length} Total Members</p>
                </div>
                <button onClick={() => setShowAttendanceModal(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupMembers.map(member => (
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
                            src={`https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=${attendanceData[member.id] ? '111827' : 'e5e7eb'}&color=${attendanceData[member.id] ? 'ffffff' : '6b7280'}`}
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
                            {member.firstName} {member.lastName}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Calendar size={14} className="text-gray-900" />
                        Next Week's Topic
                      </label>
                      <input
                        type="text"
                        value={nextTopic}
                        onChange={(e) => setNextTopic(e.target.value)}
                        placeholder="Enter session topic..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <User size={14} className="text-gray-900" />
                        Assign Next Week's Leader
                      </label>
                      <div className="relative">
                        <select
                          value={nextLeaderId}
                          onChange={(e) => setNextLeaderId(e.target.value)}
                          className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select member to lead next...</option>
                          {groupMembers.map(member => (
                            <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <TrendingUp size={16} />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium italic">
                        {(() => {
                          if (!activeSession) return '';
                          const [y, m, d] = activeSession.sessionDate.split('-').map(Number);
                          const next = new Date(y, m - 1, d);
                          next.setDate(next.getDate() + 7);
                          return `Scheduling for ${next.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • ${activeSession.startTime || '18:00'}`;
                        })()}
                      </p>
                    </div>
                  </div>
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
                        {groupMembers.length - Object.values(attendanceData).filter(Boolean).length}
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
                      onClick={async () => {
                        const currentActiveSession = activeSessions[0] || upcomingSessions.find(s => s.id === activeSession?.id);
                        if (currentActiveSession) {
                          // 1. Record attendance in backend
                          const attendancePayload = Object.entries(attendanceData).map(([memberId, isPresent]) => ({
                            memberId,
                            isPresent
                          }));

                          await recordAttendance(currentActiveSession.id, attendancePayload);

                          // 2. Mark current as completed
                          const updated = await updateSession(currentActiveSession.id, { status: 'Completed' });
                          const sessionWithAttendance = { ...updated, attendance: attendanceData };

                          setPastSessions(prev => [sessionWithAttendance, ...prev]);
                          setUpcomingSessions(prev => prev.filter(s => s.id !== currentActiveSession.id));
                          setActiveSessions(prev => prev.filter(s => s.id !== currentActiveSession.id));

                          // 3. Schedule next week's session if leader assigned
                          if (nextLeaderId) {
                            const [y, m, day] = currentActiveSession.sessionDate.split('-').map(Number);
                            const nextDate = new Date(y, m - 1, day);
                            nextDate.setDate(nextDate.getDate() + 7);
                            const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;

                            const nextSession = await scheduleSession({
                              groupId: currentActiveSession.groupId,
                              sessionDate: nextDateStr,
                              topic: nextTopic || currentActiveSession.topic || 'Weekly Fellowship Discussion',
                              discussionLeaderId: nextLeaderId,
                              startTime: currentActiveSession.startTime || '18:00',
                              endTime: currentActiveSession.endTime || '20:00',
                              status: 'Scheduled'
                            });
                            setUpcomingSessions(prev => [...prev, nextSession]);
                          }
                        }

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
                    <label className="block text-sm font-bold text-gray-700 mb-1">Start Time *</label>
                    <input
                      type="time"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      value={newSession.startTime}
                      onChange={e => setNewSession({ ...newSession, startTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">End Time *</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                    value={newSession.endTime}
                    onChange={e => setNewSession({ ...newSession, endTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Session Leader</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-white"
                    value={newSession.leaderId}
                    onChange={e => setNewSession({ ...newSession, leaderId: e.target.value })}
                  >
                    <option value="">Select a leader...</option>
                    {groupMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
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
                  onClick={async () => {
                    if (editingSession) {
                      const updated = await updateSession(editingSession.id, {
                        topic: newSession.topic,
                        sessionDate: newSession.date,
                        startTime: newSession.startTime,
                        endTime: newSession.endTime,
                        discussionLeaderId: newSession.leaderId
                      });

                      setUpcomingSessions(prev => prev.map(s => s.id === editingSession.id ? updated : s));
                    } else {
                      const session = await scheduleSession({
                        groupId: currentGroup.id,
                        topic: newSession.topic,
                        sessionDate: newSession.date,
                        startTime: newSession.startTime,
                        endTime: newSession.endTime,
                        discussionLeaderId: newSession.leaderId,
                        status: 'Scheduled'
                      });
                      setUpcomingSessions(prev => [session, ...prev]);
                    }
                    setShowScheduleModal(false);
                    setEditingSession(null);
                    setNewSession({ topic: '', date: '', startTime: '18:00', endTime: '20:00', leaderId: '' });
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
                  Submit Question for {members.find(m => m.id === selectedMemberForNote)?.firstName} {members.find(m => m.id === selectedMemberForNote)?.lastName}
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
                            {(member.firstName + ' ' + member.lastName).split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{member.firstName} {member.lastName}</p>
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
      {/* VIEW MEMBER MODAL */}
      {viewingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <User size={20} />
                {viewingMember.firstName} {viewingMember.lastName}
              </h3>
              <button
                onClick={() => setViewingMember(null)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-6 flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={viewingMember.photoUrl || `https://ui-avatars.com/api/?name=${viewingMember.firstName}+${viewingMember.lastName}&background=e5e7eb`}
                    alt=""
                    className="w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone: <span className="text-gray-900 font-medium">{viewingMember.mobilePhone}</span></p>
                  <p className="text-sm text-gray-500">Email: <span className="text-gray-900 font-medium">{viewingMember.primaryEmail}</span></p>
                  <p className="text-sm text-gray-500">Status: <span className={`font-medium ${viewingMember.isRedFlagged ? 'text-red-600' : 'text-green-600'}`}>{viewingMember.isRedFlagged ? 'Red Flag' : 'Active'}</span></p>
                </div>
              </div>

              <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">Question & Note History</h4>

              {(() => {
                const filteredNotes = currentMemberNotes.filter(note => note.type !== 'visitation' && note.noteType !== 'visitation');
                return filteredNotes.length === 0 ? (
                  <p className="text-gray-500 text-sm italic py-4 text-center">No questions or notes recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredNotes.map(note => (
                      <div key={note.id} className={`rounded-lg p-3 border transition-all ${note.isRedFlag ? 'bg-red-50 border-red-200 shadow-sm shadow-red-100' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex flex-col">
                            {note.isRedFlag && (
                              <span className="flex items-center gap-1 text-[10px] font-black text-red-600 uppercase tracking-wider mb-0.5">
                                <Flag size={10} fill="currentColor" />
                                Urgent
                              </span>
                            )}
                            <p className={`text-sm font-bold ${note.isRedFlag ? 'text-red-900' : 'text-gray-900'}`}>{note.title}</p>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(note.date || note.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className={`text-sm mb-2 ${note.isRedFlag ? 'text-red-800' : 'text-gray-600'}`}>{note.description || note.content}</p>
                        <div className="flex justify-between items-center text-xs">
                          <span className={`px-2 py-0.5 rounded-full font-medium ${note.isRedFlag ? 'bg-red-100 text-red-700' : note.type === 'question' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                            {note.type || note.noteType}
                          </span>
                          <span className={`${note.isRedFlag ? 'text-red-400' : 'text-gray-400'}`}>By {note.loggedBy || note.authorName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
