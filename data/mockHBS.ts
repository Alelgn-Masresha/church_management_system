
import { HBSGroup, HBSMember, HBSSession } from '../types';

export const MOCK_ZONES = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5', 'Zone 6'];

export const MOCK_GROUPS: HBSGroup[] = [
  { id: 'g1', name: 'Arat Kilo Group', zone: 'Zone 1', location: 'Arat Kilo, House 102', leaderId: 'm1', meetingDay: 'Wednesday' },
  { id: 'g2', name: 'Sidist Kilo Group', zone: 'Zone 1', location: 'Sidist Kilo, Near Campus', leaderId: 'm5', meetingDay: 'Thursday' },
  { id: 'g3', name: 'Bole Group', zone: 'Zone 2', location: 'Bole Medhanealem', leaderId: 'm10', meetingDay: 'Tuesday' },
  { id: 'g4', name: 'Megenagna Group', zone: 'Zone 3', location: 'Megenagna Area', leaderId: 'm15', meetingDay: 'Friday' },
];

export const MOCK_MEMBERS: Record<string, HBSMember[]> = {
  'g1': [
    { id: 'm1', fullName: 'Abebe Bikila', mobilePhone: '+251911000000', role: 'Leader' },
    { id: 'm2', fullName: 'Kebede Michael', mobilePhone: '+251911000001', role: 'Member' },
    { id: 'm3', fullName: 'Almaz Ayana', mobilePhone: '+251911000002', role: 'Member' },
    { id: 'm4', fullName: 'Tirunesh Dibaba', mobilePhone: '+251911000003', role: 'Member' },
  ],
  'g2': [
    { id: 'm5', fullName: 'Haile Gebrselassie', mobilePhone: '+251911000004', role: 'Leader' },
    { id: 'm6', fullName: 'Kenenisa Bekele', mobilePhone: '+251911000005', role: 'Member' },
  ],
  'g3': [],
  'g4': []
};

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
