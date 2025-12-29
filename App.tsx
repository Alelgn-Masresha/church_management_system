import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { RegistrationWizard } from './components/RegistrationWizard';
import { HBSPortal } from './components/hbs/HBSPortal';
import { ManagementPortal } from './components/management/ManagementPortal';
import { Member, HBSGroup, Zone } from './types';
import { MOCK_FULL_MEMBERS, MOCK_GROUPS, MOCK_ZONES } from './data/mockData';

export default function App() {
  // Global State (In a real app, this would be in a Context or Redux store)
  const [members, setMembers] = useState<Member[]>(MOCK_FULL_MEMBERS);
  const [groups, setGroups] = useState<HBSGroup[]>(MOCK_GROUPS);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [newQuestionCount, setNewQuestionCount] = useState(2); // Mock initial count

  // Actions
  const handleNewRegistration = (data: any) => {
    const newMember: Member = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      role: 'Member',
      status: 'Active',
      registrationDate: new Date().toISOString().split('T')[0]
    };
    setMembers(prev => [newMember, ...prev]);
  };

  const handleUpdateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleUpdateMembers = (updates: { id: string, data: Partial<Member> }[]) => {
    setMembers(prev => {
      const newMembers = [...prev];
      updates.forEach(u => {
        const idx = newMembers.findIndex(m => m.id === u.id);
        if (idx !== -1) {
          newMembers[idx] = { ...newMembers[idx], ...u.data };
        }
      });
      return newMembers;
    });
  };

  // Structure Actions
  const structureActions = {
    addGroup: (g: HBSGroup) => setGroups(prev => [...prev, g]),
    updateGroup: (id: string, g: Partial<HBSGroup>) => setGroups(prev => prev.map(grp => grp.id === id ? { ...grp, ...g } : grp)),
    deleteGroup: (id: string) => setGroups(prev => prev.filter(g => g.id !== id)),
    addZone: (z: Zone) => setZones(prev => [...prev, z])
  };

  return (
    <div className="h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/hbs-portal" element={<HBSPortal />} />
        <Route path="/admin" element={
          <ManagementPortal
            members={members}
            zones={zones}
            groups={groups}
            updateMember={handleUpdateMember}
            updateMembers={handleUpdateMembers}
            structureActions={structureActions}
            onRegisterMember={handleNewRegistration}
            newQuestionCount={newQuestionCount}
          />
        } />
      </Routes>
    </div>
  );
}
