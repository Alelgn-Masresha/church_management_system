import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { RegistrationWizard } from './components/RegistrationWizard';
import { HBSPortal } from './components/hbs/HBSPortal';
import { ManagementPortal } from './components/management/ManagementPortal';
import { Member, HBSGroup, Zone } from './types';
import { MOCK_FULL_MEMBERS, MOCK_GROUPS, MOCK_ZONES } from './data/mockData';

export default function App() {
  // Global State (In a real app, this would be in a Context or Redux store)
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<HBSGroup[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  // Fetch data from API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes, zonesRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/groups'),
          fetch('/api/zones')
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          // Transform snake_case to camelCase
          const mappedUsers = usersData.map((u: any) => ({
            ...u,
            firstName: u.first_name,
            middleName: u.middle_name,
            lastName: u.last_name,
            mobilePhone: u.mobile_phone,
            extraMobile: u.extra_mobile,
            homePhone: u.home_phone,
            workPhone: u.work_phone,
            primaryEmail: u.primary_email,
            secondaryEmail: u.secondary_email,
            subCity: u.sub_city,
            houseNumber: u.house_number,
            religiousBackground: u.religious_background,
            dateOfSalvation: u.date_of_salvation,
            isBaptized: u.is_baptized,
            baptismDate: u.baptism_date,
            previousChurchName: u.previous_church_name,
            maritalStatus: u.marital_status,
            spouseName: u.spouse_name,
            marriageDate: u.marriage_date,
            professionalStatus: u.professional_status,
            assignedGroupId: u.assigned_group_id,
            assignedCounselId: u.assigned_counselor_id,
            registrationDate: u.registration_date,
            memberId: u.member_id,
            // Ensure arrays/objects are handled if they come as null
            ministries: [],
            children: [],
            socials: {},
            educationHistory: []
          }));
          setMembers(mappedUsers);
        }

        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          // Map group data if necessary
          setGroups(groupsData);
        }

        if (zonesRes.ok) {
          const zonesData = await zonesRes.json();
          // Map zone data if necessary
          const mappedZones = zonesData.map((z: any) => ({
            name: z.name,
            area: z.area_description
          }));
          setZones(mappedZones);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

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

  /* 
   * Actions interacting with Backend
   */

  // Single Member Update
  const handleUpdateMember = async (id: string, updates: Partial<Member>) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        // Optimistic update
        setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
      } else {
        console.error("Failed to update member");
      }
    } catch (e) {
      console.error("Error updating member:", e);
    }
  };

  // Batch Members Update
  const handleUpdateMembers = async (updates: { id: string, data: Partial<Member> }[]) => {
    try {
      const response = await fetch('/api/users/batch/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        // Optimistic update
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
      } else {
        console.error("Failed to batch update members");
      }
    } catch (e) {
      console.error("Error batch updating members:", e);
    }
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
