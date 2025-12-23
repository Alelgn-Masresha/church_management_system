
import { HBSGroup, HBSMember, HBSSession, Member, INITIAL_DATA, Zone } from '../types';

export const MOCK_ZONES: Zone[] = [
  { name: 'North District', area: 'Primary residential area' },
  { name: 'South District', area: 'Business & Commercial hub' },
  { name: 'East District', area: 'Highland community' },
  { name: 'West District', area: 'Modern expansion zone' },
];

export const MOCK_GROUPS: HBSGroup[] = [
  { id: 'g1', name: 'Alpha Cell', zone: 'North District', location: 'Maple Street Community Center', leaderId: 'm1', meetingDay: 'Wednesday', status: 'Active' },
  { id: 'g2', name: 'Beta Cell', zone: 'North District', location: 'Oak Avenue Fellowship Hall', leaderId: 'm5', meetingDay: 'Thursday', status: 'Active' },
  { id: 'g3', name: 'Gamma Cell', zone: 'North District', location: 'Pine Street Library', leaderId: 'm10', meetingDay: 'Tuesday', status: 'Planning' },
  { id: 'g4', name: 'Delta Cell', zone: 'South District', location: 'Megenagna Area', leaderId: 'm15', meetingDay: 'Friday', status: 'Active' },
];

export const MOCK_SESSIONS: HBSSession[] = [
  {
    id: 's1',
    groupId: 'g1',
    sessionDate: '2023-10-25',
    topic: 'Faith and Works',
    discussionLeaderId: 'm2',
    status: 'Completed',
    attendance: { 'm1': true, 'm2': true, 'm3': false, 'm4': true }
  },
  {
    id: 's2',
    groupId: 'g1',
    sessionDate: '2023-11-01',
    topic: 'The Power of Prayer',
    discussionLeaderId: 'm1',
    status: 'Scheduled',
    attendance: {}
  }
];

// Helper to generate random members
const generateMembers = (count: number): Member[] => {
  const statuses = ['Active', 'Active', 'Active', 'Transferred', 'Inactive'];
  const roles = ['Member', 'Member', 'Member', 'Leader'];
  const eduLevels = ['1', '2', '3', '3', '3', '4', '6'];
  const profStatus = ['Employed', 'Employed', 'Student', 'Self-Employed', 'Housewife'];

  return Array.from({ length: count }).map((_, i) => {
    const isFemale = Math.random() > 0.5;
    const gender = isFemale ? 'Female' : 'Male';
    const firstNames = isFemale ? ['Almaz', 'Sarah', 'Tigist', 'Emily', 'Aster'] : ['Abebe', 'Michael', 'Dawit', 'David', 'Samuel'];
    const lastNames = ['Alemu', 'Johnson', 'Tesfaye', 'Rodriguez', 'Kim'];
    const idx = i + 1;

    return {
      ...INITIAL_DATA,
      id: `m${idx}`,
      memberId: `2024${String(idx).padStart(3, '0')}`,
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      middleName: lastNames[Math.floor(Math.random() * lastNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      mobilePhone: `+251911${String(i).padStart(6, '0')}`,
      gender: gender,
      birthDate: `19${80 + Math.floor(Math.random() * 20)}-01-01`,
      maritalStatus: Math.random() > 0.6 ? 'Married' : 'Single',
      professionalStatus: profStatus[Math.floor(Math.random() * profStatus.length)],
      educationHistory: [{
        id: `edu${i}`, type: 'Degree', level: eduLevels[Math.floor(Math.random() * eduLevels.length)],
        institution: 'AAU', startYear: '2010', endYear: '2014'
      }],
      status: statuses[Math.floor(Math.random() * statuses.length)] as any,
      role: roles[Math.floor(Math.random() * roles.length)] as any,
      registrationDate: new Date().toISOString().split('T')[0],
      assignedGroupId: Math.random() > 0.7 ? `g${Math.floor(Math.random() * 4) + 1}` : undefined,
      participationScore: Math.floor(Math.random() * 40) + 60, // 60-100
      isRedFlagged: Math.random() > 0.9,
    };
  });
};

export const MOCK_FULL_MEMBERS: Member[] = generateMembers(125); // Increased count for dashboards
