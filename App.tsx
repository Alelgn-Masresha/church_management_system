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
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  // Fetch data from API
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes, zonesRes, notesRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/groups'),
          fetch('/api/zones'),
          fetch('/api/pastoral-notes/recent')
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
            isRedFlagged: u.is_red_flagged,
            photoUrl: u.photo_url,
            // Ensure arrays/objects are handled if they come as null
            ministries: [],
            children: [],
            socials: {},
            educationHistory: []
          }));
          setMembers(mappedUsers);

          // Set current user to first admin or first user
          const admin = mappedUsers.find((m: any) => m.role === 'Admin' || m.role === 'Pastor');
          setCurrentUser(admin || mappedUsers[0] || null);
        }

        if (zonesRes.ok) {
          const zonesData = await zonesRes.json();
          const mappedZones = zonesData.map((z: any) => ({
            id: z.id,
            name: z.name,
            area: z.area_description
          }));
          setZones(mappedZones);
        }

        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          const mappedGroups = groupsData.map((g: any) => ({
            id: g.id,
            name: g.name,
            zoneId: g.zone_id,
            location: g.location,
            leaderId: g.leader_id,
            meetingDay: g.meeting_day,
            status: g.status
          }));
          setGroups(mappedGroups);
        }

        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setRecentNotes(notesData);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const newQuestionCount = recentNotes.filter(n => n.status === 'new').length;

  // Actions
  const handleMemberRegistered = (u: any) => {
    try {
      if (!u) return;

      const mappedUser: Member = {
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
        photoUrl: u.photo_url,
        ministries: [],
        children: [],
        socials: {},
        educationHistory: []
      };
      setMembers(prev => [mappedUser, ...prev]);
      // Alert is already handled by the wizard or we can keep it here
    } catch (e) {
      console.error("Failed to map registered member:", e);
    }
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
    addGroup: async (g: HBSGroup) => {
      try {
        const body = {
          name: g.name,
          zoneId: g.zoneId,
          leaderId: g.leaderId,
          location: g.location,
          meetingDay: g.meetingDay,
          meetingTime: g.meetingTime,
          status: g.status
        };
        const res = await fetch('/api/groups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          const newGroup = await res.json();
          const mapped: HBSGroup = {
            id: newGroup.id,
            name: newGroup.name,
            zoneId: newGroup.zone_id,
            location: newGroup.location,
            leaderId: newGroup.leader_id,
            meetingDay: newGroup.meeting_day,
            status: newGroup.status
          };
          setGroups(prev => [...prev, mapped]);
        }
      } catch (e) {
        console.error("Failed to add group:", e);
      }
    },
    updateGroup: async (id: string, g: Partial<HBSGroup>) => {
      try {
        // Map frontend camelCase to backend snake_case if needed, or rely on controller mapping if it was consistent.
        // But controller uses camelCase inputs from req.body? Let's check model...
        // Model uses CamelCase keys in `allowedFields` map!
        // 'zoneId': 'zone_id', 'leaderId': 'leader_id', etc. OK.
        const res = await fetch(`/api/groups/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(g)
        });
        if (res.ok) {
          setGroups(prev => prev.map(grp => grp.id === id ? { ...grp, ...g } : grp));
        }
      } catch (e) {
        console.error("Failed to update group:", e);
      }
    },
    deleteGroup: async (id: string) => {
      try {
        const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setGroups(prev => prev.filter(g => g.id !== id));
        }
      } catch (e) {
        console.error("Failed to delete group:", e);
      }
    },
    addZone: async (z: Zone) => {
      try {
        const res = await fetch('/api/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: z.name, areaDescription: z.area }) // Backend expects areaDescription
        });
        if (res.ok) {
          const newZone = await res.json();
          setZones(prev => [...prev, { id: newZone.id, name: newZone.name, area: newZone.area_description }]);
        }
      } catch (e) {
        console.error("Failed to add zone:", e);
      }
    },
    updateZone: async (id: string, z: Partial<Zone>) => {
      try {
        const body: any = {};
        if (z.name) body.name = z.name;
        if (z.area) body.areaDescription = z.area; // Map to backend field

        const res = await fetch(`/api/zones/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          setZones(prev => prev.map(zone => zone.id === id ? { ...zone, ...z } : zone));
        }
      } catch (e) {
        console.error("Failed to update zone:", e);
      }
    },
    deleteZone: async (id: string) => {
      try {
        const res = await fetch(`/api/zones/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setZones(prev => prev.filter(z => z.id !== id));
        }
      } catch (e) {
        console.error("Failed to delete zone:", e);
      }
    }
  };

  const handleSubmitNote = async (noteData: any) => {
    try {
      const response = await fetch('/api/pastoral-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });

      if (response.ok) {
        // If it's a red flag, update the member's state optimistically
        if (noteData.isRedFlag) {
          setMembers(prev => prev.map(m => m.id === noteData.memberId ? { ...m, isRedFlagged: true } : m));
        }
        alert("Note submitted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to submit note:", errorData.error);
        alert(`Error: ${errorData.error || "Failed to submit note"}`);
      }
    } catch (e) {
      console.error("Error submitting note:", e);
      alert("Network error. Please check your connection.");
    }
  };

  const fetchMemberNotes = async (memberId: string) => {
    try {
      const res = await fetch(`/api/pastoral-notes/member/${memberId}`);
      if (res.ok) {
        const data = await res.json();
        // Map DB fields to Frontend types if necessary
        return data.map((n: any) => ({
          id: n.id,
          date: n.created_at,
          type: n.note_type,
          title: n.title,
          category: n.category,
          description: n.content,
          loggedBy: n.author_first_name ? `${n.author_first_name} ${n.author_last_name}` : 'Unknown',
          location: n.location,
          isRedFlag: n.is_red_flag,
          status: n.status
        }));
      }
      return [];
    } catch (e) {
      console.error("Error fetching notes:", e);
      return [];
    }
  };

  const fetchSessionsByGroup = async (groupId: string) => {
    try {
      const res = await fetch(`/api/hbs-sessions/group/${groupId}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (e) {
      console.error("Error fetching sessions:", e);
      return [];
    }
  };

  const handleScheduleSession = async (sessionData: any) => {
    try {
      const res = await fetch('/api/hbs-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      if (!res.ok) throw new Error("Failed to schedule session");
      return await res.json();
    } catch (e) {
      console.error("Error scheduling session:", e);
      throw e;
    }
  };

  const handleUpdateSession = async (id: string, sessionData: any) => {
    try {
      const res = await fetch(`/api/hbs-sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      if (!res.ok) throw new Error("Failed to update session");
      return await res.json();
    } catch (e) {
      console.error("Error updating session:", e);
      throw e;
    }
  };

  const handleRecordAttendance = async (sessionId: string, attendanceData: any) => {
    try {
      const res = await fetch(`/api/hbs-sessions/${sessionId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData)
      });
      if (!res.ok) throw new Error("Failed to record attendance");
      return await res.json();
    } catch (e) {
      console.error("Error recording attendance:", e);
      throw e;
    }
  };

  return (
    <div className="h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/hbs-portal" element={
          <HBSPortal
            groups={groups}
            members={members}
            updateMember={handleUpdateMember}
            submitNote={handleSubmitNote}
            fetchMemberNotes={fetchMemberNotes}
            fetchSessions={fetchSessionsByGroup}
            scheduleSession={handleScheduleSession}
            updateSession={handleUpdateSession}
            recordAttendance={handleRecordAttendance}
          />
        } />
        <Route path="/admin" element={
          <ManagementPortal
            members={members}
            zones={zones}
            groups={groups}
            updateMember={handleUpdateMember}
            updateMembers={handleUpdateMembers}
            structureActions={structureActions}
            onRegisterMember={handleMemberRegistered}
            newQuestionCount={newQuestionCount}
            recentNotes={recentNotes}
            submitNote={handleSubmitNote}
            fetchMemberNotes={fetchMemberNotes}
            currentUser={currentUser}
          />
        } />
      </Routes>
    </div>
  );
}
