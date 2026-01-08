
import React, { useState } from 'react';
import { Member, HBSGroup, FormData, Zone } from '../../types';
import { Dashboard } from './Dashboard';
import { MemberDirectory } from './MemberDirectory';
import { StructureManager } from './StructureManager';
import { AssignCounsels } from './AssignCounsels';
import { Settings as SettingsPage } from './Settings';
import { RegistrationWizard } from '../RegistrationWizard';
import { LayoutDashboard, Users, GitGraph, Settings, Menu, UserPlus, Bell, Search, MessageSquare, UserCheck } from 'lucide-react';

interface Props {
   members: Member[];
   zones: Zone[];
   groups: HBSGroup[];
   updateMember: (id: string, updates: Partial<Member>) => void;
   updateMembers: (updates: { id: string, data: Partial<Member> }[]) => void;
   onRegisterMember: (data: FormData) => void;
   structureActions: {
      addGroup: (g: HBSGroup) => void;
      updateGroup: (id: string, g: Partial<HBSGroup>) => void;
      deleteGroup: (id: string) => void;
      addZone: (z: Zone) => void;
      updateZone: (id: string, z: Partial<Zone>) => void;
      deleteZone: (id: string) => void;
   };
   newQuestionCount?: number;
}

export const ManagementPortal: React.FC<Props> = (props) => {
   const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'structure' | 'settings' | 'register' | 'counsels'>('dashboard');
   const [sidebarOpen, setSidebarOpen] = useState(true);
   const [deepLinkedMemberId, setDeepLinkedMemberId] = useState<string | null>(null);
   const [initialFilters, setInitialFilters] = useState<any>(null);
   const [showNotifications, setShowNotifications] = useState(false);

   const handleNotificationClick = (memberId: string) => {
      setDeepLinkedMemberId(memberId);
      setActiveTab('members');
      setShowNotifications(false);
   };

   const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
      <button
         onClick={() => setActiveTab(id)}
         className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
        ${activeTab === id ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
      `}
      >
         <Icon size={20} />
         {sidebarOpen && <span>{label}</span>}
      </button>
   );

   return (
      <div className="flex h-screen bg-slate-50 overflow-hidden">
         {/* Sidebar */}
         <div className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
               {sidebarOpen && <h2 className="font-bold tracking-wide text-blue-100">ADMIN PORTAL</h2>}
               <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                  <Menu size={20} />
               </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
               <NavItem id="dashboard" label="Overview" icon={LayoutDashboard} />
               <NavItem id="members" label="Members Directory" icon={Users} />
               <NavItem id="counsels" label="Assign Counsels" icon={UserCheck} />
               <NavItem id="register" label="Registration" icon={UserPlus} />
               <NavItem id="structure" label="Zone & Cells" icon={GitGraph} />
               <NavItem id="settings" label="Settings" icon={Settings} />
            </nav>

            <div className="p-4 border-t border-slate-800">
               <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold shadow-lg shadow-blue-900/30">A</div>
                  {sidebarOpen && (
                     <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate text-slate-200">Administrator</p>
                        <p className="text-xs text-slate-500 truncate">System Manager</p>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Main Content Area */}
         <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
            {/* Topbar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 relative z-20">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 rounded-lg lg:hidden">
                     <Menu size={20} className="text-slate-600" />
                  </div>
                  <div>
                     <h1 className="text-lg font-bold text-slate-900 capitalize leading-tight">
                        {activeTab === 'dashboard' ? 'Overview' : activeTab}
                     </h1>
                     <p className="text-xs text-slate-400 font-medium">Management System Portal</p>
                  </div>
               </div>

               <div className="flex items-center gap-6">
                  {/* Search Bar */}
                  <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg w-64 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                     <Search size={16} className="text-slate-400" />
                     <input type="text" placeholder="Search anything..." className="bg-transparent border-none outline-none text-sm w-full" />
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center gap-4 border-l border-slate-200 pl-6 text-slate-500">
                     <div className="relative">
                        <button
                           onClick={() => setShowNotifications(!showNotifications)}
                           className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-500'}`}
                        >
                           <Bell size={20} />
                           {(props.newQuestionCount || 0) > 0 && (
                              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 pointer-events-none">
                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                 <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] items-center justify-center text-white font-bold leading-none">
                                    {props.newQuestionCount}
                                 </span>
                              </span>
                           )}
                        </button>

                        {showNotifications && (
                           <>
                              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)}></div>
                              <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 animate-slideDown z-40">
                                 <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                                    <MessageSquare size={16} className="text-blue-600" />
                                    Recent Questions
                                 </h4>
                                 <div className="space-y-1">
                                    <div
                                       onClick={() => handleNotificationClick('m1')}
                                       className="p-3 rounded-xl bg-amber-50 border border-amber-100 cursor-pointer hover:bg-amber-100 transition-all group/item"
                                    >
                                       <div className="flex justify-between items-start mb-1">
                                          <p className="text-xs font-black text-slate-900 line-clamp-1 group-hover/item:text-amber-800">Questions from Abebe Bikila</p>
                                          <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-bold uppercase">New</span>
                                       </div>
                                       <p className="text-[10px] text-slate-500 line-clamp-1">"Deep explanation of Spirit of adoption..."</p>
                                       <p className="text-[9px] text-slate-400 mt-2 font-medium">2 minutes ago • HBS Cell 3</p>
                                    </div>
                                    <div
                                       onClick={() => handleNotificationClick('m3')}
                                       className="p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all group/item"
                                    >
                                       <div className="flex justify-between items-start mb-1">
                                          <p className="text-xs font-bold text-slate-900 line-clamp-1 group-hover/item:text-blue-600">Counseling request from Almaz Ayana</p>
                                       </div>
                                       <p className="text-[10px] text-slate-500 line-clamp-1">"Sarah missed two consecutive Sunday..."</p>
                                       <p className="text-[9px] text-slate-400 mt-2 font-medium">1 hour ago • Phone Check-in</p>
                                    </div>
                                 </div>
                                 <button className="w-full mt-4 py-2 bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-colors">
                                    View All Notifications
                                 </button>
                              </div>
                           </>
                        )}
                     </div>
                     <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                        <Users size={16} />
                     </div>
                  </div>
               </div>
            </header>

            <div className="flex-1 overflow-auto p-4 md:p-8">
               <div className="max-w-7xl mx-auto h-full">
                  {activeTab !== 'settings' && activeTab !== 'dashboard' && (
                     <header className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">
                           {activeTab === 'members' && 'Member Management'}
                           {activeTab === 'counsels' && 'Counsels Assignment'}
                           {activeTab === 'register' && 'New Member Registration'}
                           {activeTab === 'structure' && 'Church Structure'}
                        </h1>
                        <p className="text-slate-500 text-sm">
                           {activeTab === 'members' && 'Search, filter, update and manage church members.'}
                           {activeTab === 'counsels' && 'Select and assign members as follow-up counsels.'}
                           {activeTab === 'register' && 'Register a new member into the system.'}
                           {activeTab === 'structure' && 'Manage Zones and assign Cell Leaders.'}
                        </p>
                     </header>
                  )}

                  {activeTab === 'dashboard' && (
                     <Dashboard
                        members={props.members}
                        onNavigate={(tab, filters) => {
                           setActiveTab(tab);
                           if (filters) setInitialFilters(filters);
                        }}
                     />
                  )}

                  {activeTab === 'members' && (
                     <MemberDirectory
                        members={props.members}
                        zones={props.zones}
                        groups={props.groups}
                        onUpdateMember={props.updateMember}
                        onAddMember={() => setActiveTab('register')}
                        initialSelectedMemberId={deepLinkedMemberId}
                        onClearDeepLink={() => setDeepLinkedMemberId(null)}
                        initialFilters={initialFilters}
                        onClearFilters={() => setInitialFilters(null)}
                     />
                  )}

                  {activeTab === 'register' && (
                     <RegistrationWizard onSuccess={props.onRegisterMember} />
                  )}

                  {activeTab === 'structure' && (
                     <StructureManager
                        groups={props.groups}
                        members={props.members}
                        zones={props.zones}
                        onAddGroup={props.structureActions.addGroup}
                        onUpdateGroup={props.structureActions.updateGroup}
                        onDeleteGroup={props.structureActions.deleteGroup}
                        onAddZone={props.structureActions.addZone}
                        onUpdateZone={props.structureActions.updateZone}
                        onDeleteZone={props.structureActions.deleteZone}
                     />
                  )}

                  {activeTab === 'counsels' && (
                     <AssignCounsels
                        members={props.members}
                        rootCounselId={(() => {
                           const pastors = props.members.filter(m => m.role === 'Pastor');
                           return pastors.length === 1 ? pastors[0].id : undefined;
                        })()}
                        onAssignCounsels={(ids, targetId) => {
                           const updates = ids.map(id => ({
                              id,
                              data: { assignedCounselId: targetId }
                           }));
                           props.updateMembers(updates);
                           alert(`${ids.length} members have been assigned successfully.`);
                        }}
                        onRemoveMember={(id, isCounselRole) => {
                           // If removing from assignment, set to null (which converts to DB NULL)
                           props.updateMember(id, { assignedCounselId: null });
                        }}
                        onReplaceMember={(oldId, newId, successorId) => {
                           const oldMember = props.members.find(m => m.id === oldId);
                           const newMember = props.members.find(m => m.id === newId);
                           if (!oldMember || !newMember) return;
                           const updates: { id: string, data: Partial<Member> }[] = [];

                           const oldParent = oldMember.assignedCounselId;
                           const newParent = newMember.assignedCounselId;

                           // 1. Successor takes New Member's former position (spot under their boss)
                           if (successorId) {
                              updates.push({ id: successorId, data: { role: newMember.role, assignedCounselId: newParent } });
                              // New member's old team now reports to Successor
                              props.members.forEach(m => {
                                 if (m.assignedCounselId === newId && m.id !== successorId) {
                                    updates.push({ id: m.id, data: { assignedCounselId: successorId } });
                                 }
                              });
                           }

                           // 2. New Member takes Old Member's former position
                           // SAFETY: If the Old boss was the New member (Upstream Move), 
                           // the New member should now report to the Successor.
                           let targetParent = oldParent;
                           if (targetParent === newId && successorId) targetParent = successorId;
                           // Final safety: never point to self
                           if (targetParent === newId) targetParent = null;

                           updates.push({ id: newId, data: { role: oldMember.role, assignedCounselId: targetParent } });

                           // 3. Old Member's team now reports to New Member
                           props.members.forEach(m => {
                              if (m.assignedCounselId === oldId && m.id !== newId) {
                                 updates.push({ id: m.id, data: { assignedCounselId: newId } });
                              }
                           });

                           // 4. Old Member becomes unassigned
                           updates.push({ id: oldId, data: { role: 'Member', assignedCounselId: null } });

                           props.updateMembers(updates);
                           alert(`${newMember.firstName} is now the leader. Hierarchy updated successfully.`);
                        }}
                        onSwapMembers={(id1, id2) => {
                           const m1 = props.members.find(m => m.id === id1);
                           const m2 = props.members.find(m => m.id === id2);
                           if (!m1 || !m2) return;
                           const updates: { id: string, data: Partial<Member> }[] = [];

                           const m1WasParentOfM2 = m2.assignedCounselId === id1;
                           const m2WasParentOfM1 = m1.assignedCounselId === id2;

                           if (m1WasParentOfM2) {
                              // Parent -> m1 -> m2  becomes  Parent -> m2 -> m1
                              updates.push({ id: id2, data: { role: m1.role, assignedCounselId: m1.assignedCounselId } });
                              updates.push({ id: id1, data: { role: m2.role, assignedCounselId: id2 } });
                           } else if (m2WasParentOfM1) {
                              // Parent -> m2 -> m1  becomes  Parent -> m1 -> m2
                              updates.push({ id: id1, data: { role: m2.role, assignedCounselId: m2.assignedCounselId } });
                              updates.push({ id: id2, data: { role: m1.role, assignedCounselId: id1 } });
                           } else {
                              // Standard swap of unrelated branches
                              updates.push({ id: id1, data: { role: m2.role, assignedCounselId: m2.assignedCounselId } });
                              updates.push({ id: id2, data: { role: m1.role, assignedCounselId: m1.assignedCounselId } });
                           }

                           // Subordinate hand-off
                           props.members.forEach(m => {
                              if (m.id === id1 || m.id === id2) return;
                              if (m.assignedCounselId === id1) updates.push({ id: m.id, data: { assignedCounselId: id2 } });
                              else if (m.assignedCounselId === id2) updates.push({ id: m.id, data: { assignedCounselId: id1 } });
                           });

                           props.updateMembers(updates);
                           alert(`Swapped positions of ${m1.firstName} and ${m2.firstName}.`);
                        }}
                     />
                  )}

                  {activeTab === 'settings' && (
                     <SettingsPage members={props.members} onUpdateMember={props.updateMember} onUpdateMembers={props.updateMembers} />
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};
