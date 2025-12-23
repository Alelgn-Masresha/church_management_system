
import React, { useState } from 'react';
import { HBSGroup, HBSSession, HBSMember } from '../../types';
import { MOCK_SESSIONS } from '../../data/mockHBS';
import { ArrowLeft, Calendar, UserCheck, Plus, Check, X, UserPlus, Phone, Users } from 'lucide-react';
import { Input, Select } from '../FormControls';

interface Props {
  group: HBSGroup;
  members: HBSMember[];
  onUpdateMembers: (members: HBSMember[]) => void;
  onBack: () => void;
}

export const GroupManager: React.FC<Props> = ({ group, members, onUpdateMembers, onBack }) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'members'>('sessions');
  const [sessions, setSessions] = useState<HBSSession[]>(MOCK_SESSIONS.filter(s => s.groupId === group.id));
  const [showCreateSessionModal, setShowCreateSessionModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingSession, setEditingSession] = useState<HBSSession | null>(null);

  // New Session State
  const [newSession, setNewSession] = useState({
    date: '',
    topic: '',
    discussionLeaderId: ''
  });

  // New Member State
  const [newMember, setNewMember] = useState({
    fullName: '',
    mobilePhone: '',
    role: 'Member' as 'Member' | 'Leader' | 'Assistant'
  });

  // Calculate Next Session Date based on Group Meeting Day
  const getNextMeetingDate = () => {
    if (!group.meetingDay) return '';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDayIndex = days.indexOf(group.meetingDay);
    if (targetDayIndex === -1) return '';

    const today = new Date();
    const currentDayIndex = today.getDay();

    let daysUntil = (targetDayIndex - currentDayIndex + 7) % 7;
    // If today is the day, assume next week if it's already late? 
    // For simplicity, let's default to today if it matches, user can always change it.
    // actually, let's say if we are strictly scheduling "Upcoming", usually it means the *next* occurrence.
    // If daysUntil is 0, let's check time? No, let's just default to 0 (Today) and let user pick next week if they want.

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);

    return nextDate.toISOString().split('T')[0];
  };

  const handleCreateSession = () => {
    const session: HBSSession = {
      id: Math.random().toString(36).substr(2, 9),
      groupId: group.id,
      sessionDate: newSession.date,
      topic: newSession.topic,
      discussionLeaderId: newSession.discussionLeaderId,
      status: 'Scheduled',
      attendance: {}
    };
    setSessions([...sessions, session]);
    setShowCreateSessionModal(false);
    setNewSession({ date: '', topic: '', discussionLeaderId: '' });
  };

  const openCreateSessionModal = () => {
    setNewSession({
      topic: '',
      discussionLeaderId: '',
      date: getNextMeetingDate() // Auto-fill next date
    });
    setShowCreateSessionModal(true);
  };

  const handleAddMember = () => {
    if (!newMember.fullName) return;

    const member: HBSMember = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: newMember.fullName,
      mobilePhone: newMember.mobilePhone || '+251',
      role: newMember.role
    };

    onUpdateMembers([...members, member]);
    setShowAddMemberModal(false);
    setNewMember({ fullName: '', mobilePhone: '', role: 'Member' });
  };

  const toggleAttendance = (memberId: string) => {
    if (!editingSession) return;
    const currentAttendance = editingSession.attendance[memberId] || false;
    const updatedAttendance = { ...editingSession.attendance, [memberId]: !currentAttendance };
    setEditingSession({ ...editingSession, attendance: updatedAttendance });
  };

  // State for Next Leader Assignment in Attendance Modal
  const [nextLeaderId, setNextLeaderId] = useState('');

  const saveAttendance = () => {
    if (!editingSession) return;

    // Mark current session as completed
    const updatedSession = { ...editingSession, status: 'Completed' as const };

    const updatedSessions = sessions.map(s => s.id === editingSession.id ? updatedSession : s);

    // Create NEXT session if a leader is assigned
    if (nextLeaderId) {
      const currentSessionDate = new Date(editingSession.sessionDate);
      const nextDate = new Date(currentSessionDate);
      nextDate.setDate(currentSessionDate.getDate() + 7);
      const nextDateString = nextDate.toISOString().split('T')[0];

      const nextSession: HBSSession = {
        id: Math.random().toString(36).substr(2, 9),
        groupId: group.id,
        sessionDate: nextDateString,
        topic: 'Weekly Meeting', // Default topic, can be edited later
        discussionLeaderId: nextLeaderId,
        status: 'Scheduled',
        attendance: {}
      };
      updatedSessions.push(nextSession);
    }

    setSessions(updatedSessions);
    setEditingSession(null);
    setNextLeaderId(''); // Reset
  };

  const handleOpenAttendance = (session: HBSSession) => {
    setEditingSession(session);
    setNextLeaderId(''); // Ensure clean state
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] flex flex-col animate-slideIn">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center gap-4 bg-gray-50 rounded-t-xl">
        <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200 text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{group.name}</h2>
          <p className="text-sm text-gray-500">{group.zone} • {group.meetingDay}s at {group.meetingTime || 'Time unset'}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'sessions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'members' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}
          >
            Members ({members.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 bg-white relative">

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Weekly Sessions Schedule</h3>
              <button
                onClick={openCreateSessionModal}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
              >
                <Plus size={16} /> Schedule Session
              </button>
            </div>

            <div className="space-y-6">
              {sessions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500">No sessions scheduled.</p>
                </div>
              ) : (
                <>
                  {/* Upcoming Sessions */}
                  {sessions.filter(s => s.status !== 'Completed').length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Upcoming ({sessions.filter(s => s.status !== 'Completed').length})</h4>
                      {sessions
                        .filter(s => s.status !== 'Completed')
                        .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
                        .map(session => (
                          <div key={session.id} className="border border-blue-100 bg-blue-50/30 rounded-lg p-4 hover:border-blue-300 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-lg text-gray-800">{session.topic}</span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                    {session.status}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span className="flex items-center gap-1"><Calendar size={14} className="text-blue-500" /> {session.sessionDate}</span>
                                  <span className="flex items-center gap-1"><UserCheck size={14} className="text-blue-500" /> Leader: {members.find(m => m.id === session.discussionLeaderId)?.fullName || 'Unassigned'}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleOpenAttendance(session)}
                                className="px-3 py-1.5 border border-blue-200 text-blue-600 bg-white rounded text-sm hover:bg-blue-50 font-medium"
                              >
                                Mark Attendance
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Past Sessions History */}
                  {sessions.filter(s => s.status === 'Completed').length > 0 && (
                    <div className="space-y-3 pt-4">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">History ({sessions.filter(s => s.status === 'Completed').length})</h4>
                      {sessions
                        .filter(s => s.status === 'Completed')
                        .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()) // Descending
                        .map(session => {
                          const presentCount = Object.values(session.attendance).filter(Boolean).length;
                          // find leader name
                          const leaderName = members.find(m => m.id === session.discussionLeaderId)?.fullName || 'Unknown';

                          return (
                            <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors group">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-700 decoration-gray-400">{session.topic}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                      Completed
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {session.sessionDate}</span>
                                    <span className="flex items-center gap-1"><UserCheck size={14} /> Leader: {leaderName}</span>
                                  </div>
                                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                    <Users size={12} />
                                    <span className="font-medium">{presentCount}</span> participants
                                  </div>
                                </div>
                                <button
                                  onClick={() => setEditingSession(session)}
                                  className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded text-sm hover:bg-white hover:text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800">Group Members</h3>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                <UserPlus size={16} /> Add Member
              </button>
            </div>

            {members.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <UserPlus size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No members in this group yet.</p>
                <button onClick={() => setShowAddMemberModal(true)} className="text-blue-600 text-sm font-medium hover:underline mt-2">Add First Member</button>
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Full Name</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Phone</th>
                      <th className="px-6 py-3 text-center">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map(member => {
                      // Calculate Stats
                      const completedSessions = sessions.filter(s => s.status === 'Completed');
                      const presentCount = completedSessions.filter(s => s.attendance[member.id]).length;
                      const totalSessions = completedSessions.length;
                      const participationRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

                      return (
                        <tr key={member.id} className="bg-white hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                              {member.fullName.charAt(0)}
                            </div>
                            {member.fullName}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.role === 'Leader' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            {member.mobilePhone}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className={`font-bold ${participationRate > 75 ? 'text-green-600' : participationRate > 40 ? 'text-yellow-600' : 'text-red-500'}`}>
                                {participationRate}%
                              </span>
                              <span className="text-xs text-gray-400">
                                {presentCount}/{totalSessions}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateSessionModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Schedule New Session</h3>
              <button onClick={() => setShowCreateSessionModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Input
                label="Session Topic"
                amharicLabel="የጥናት ርዕስ"
                value={newSession.topic}
                onChange={e => setNewSession({ ...newSession, topic: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-xs font-normal text-gray-500">(ቀን)</span>
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                  {newSession.date} <span className="text-xs text-gray-400 ml-2">(Automatically calculated based on {group.meetingDay}s)</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateSessionModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleCreateSession} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-scaleIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add Group Member</h3>
              <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <Input
                label="Full Name"
                amharicLabel="ሙሉ ስም"
                value={newMember.fullName}
                onChange={e => setNewMember({ ...newMember, fullName: e.target.value })}
              />
              <Input
                label="Mobile Phone"
                amharicLabel="ስልክ ቁጥር"
                value={newMember.mobilePhone}
                onChange={e => setNewMember({ ...newMember, mobilePhone: e.target.value })}
                placeholder="+251"
              />
              <Select
                label="Role"
                amharicLabel="ኃላፊነት"
                value={newMember.role}
                onChange={e => setNewMember({ ...newMember, role: e.target.value as any })}
                options={[
                  { label: 'Member (አባል)', value: 'Member' },
                  { label: 'Leader (መሪ)', value: 'Leader' },
                  { label: 'Assistant (ረዳት)', value: 'Assistant' },
                ]}
              />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddMemberModal(false)} className="flex-1 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button
                  onClick={handleAddMember}
                  disabled={!newMember.fullName}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {editingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] animate-scaleIn">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mark Attendance</h3>
                <p className="text-sm text-gray-500">{editingSession.topic} • {editingSession.sessionDate}</p>
              </div>
              <button onClick={() => setEditingSession(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {members.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No members to mark attendance for.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map(member => {
                    const isPresent = editingSession.attendance[member.id];
                    return (
                      <div
                        key={member.id}
                        onClick={() => toggleAttendance(member.id)}
                        className={`p-4 rounded-lg border cursor-pointer flex items-center justify-between transition-all select-none
                                ${isPresent ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'}
                              `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                    ${isPresent ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-500'}
                                  `}>
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className={`font-medium ${isPresent ? 'text-gray-900' : 'text-gray-500'}`}>{member.fullName}</p>
                            <p className="text-xs text-gray-400">{member.role}</p>
                          </div>
                        </div>
                        {isPresent && <Check size={20} className="text-green-600" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Assign Next Leader Section - Only for incomplete sessions */}
            {editingSession.status !== 'Completed' && (
              <div className="px-6 py-4 bg-blue-50 border-t border-b border-blue-100">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Assign Leader for Next Week</h4>
                <p className="text-xs text-gray-500 mb-3">Who will lead the study next week?</p>
                <Select
                  label=""
                  value={nextLeaderId}
                  onChange={e => setNextLeaderId(e.target.value)}
                  options={[
                    { label: 'Select next leader...', value: '' },
                    ...members.map(m => ({ label: m.fullName, value: m.id }))
                  ]}
                />
              </div>
            )}

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{Object.values(editingSession.attendance).filter(Boolean).length}</span> Present / {members.length} Total
              </div>
              <button
                onClick={saveAttendance}
                disabled={editingSession.status !== 'Completed' && !nextLeaderId} // Require next leader if not already completed
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingSession.status === 'Completed' ? 'Close' : 'Save & Create Next Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
