
import React, { useState } from 'react';
import { Member, Zone, HBSGroup } from '../../types';
import { Search, Filter, FileText, Plus, MoreVertical, Flag, Check, AlertCircle, X, MapPin, Phone, Users as UsersIcon, ChevronRight, ChevronDown } from 'lucide-react';
import { MemberProfile } from './MemberProfile';

interface Props {
   members: Member[];
   zones: Zone[];
   groups: HBSGroup[];
   onUpdateMember: (id: string, updates: Partial<Member>) => void;
   onAddMember: () => void;
   initialSelectedMemberId?: string | null;
   onClearDeepLink?: () => void;
   initialFilters?: {
      unassigned?: boolean;
      flagged?: boolean;
      unansweredFlagged?: boolean;
      selectedZone?: string;
   } | null;
   onClearFilters?: () => void;
}

export const MemberDirectory: React.FC<Props> = ({
   members, zones, groups, onUpdateMember, onAddMember,
   initialSelectedMemberId, onClearDeepLink,
   initialFilters, onClearFilters
}) => {
   const [view, setView] = useState<'list' | 'profile'>('list');
   const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
   const [searchTerm, setSearchTerm] = useState('');

   // Filter State
   const [showFilterDropdown, setShowFilterDropdown] = useState(false);
   const [activeFilters, setActiveFilters] = useState({
      unassigned: false,
      flagged: false,
      unansweredFlagged: false,
      selectedZone: ''
   });

   // Assignment Modal State
   const [showAssignModal, setShowAssignModal] = useState(false);
   const [memberToAssign, setMemberToAssign] = useState<Member | null>(null);
   const [selectedZone, setSelectedZone] = useState<string>('');
   const [selectedCell, setSelectedCell] = useState<string>('');

   React.useEffect(() => {
      if (initialSelectedMemberId) {
         setSelectedMemberId(initialSelectedMemberId);
         setView('list'); // Default to list so filters can be seen, or profile if we want direct link
         // Actually if it's a deep link to a member, we usually want profile
         setView('profile');
         if (onClearDeepLink) {
            onClearDeepLink();
         }
      }
   }, [initialSelectedMemberId, onClearDeepLink]);

   React.useEffect(() => {
      if (initialFilters) {
         setActiveFilters(prev => ({ ...prev, ...initialFilters }));
         if (onClearFilters) {
            onClearFilters();
         }
      }
   }, [initialFilters, onClearFilters]);

   const filteredMembers = members.filter(member => {
      // Search filter
      const matchesSearch =
         member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (member.memberId && member.memberId.includes(searchTerm));

      if (!matchesSearch) return false;

      // Unassigned filter
      if (activeFilters.unassigned && member.assignedGroupId) return false;

      // Flagged filter
      if (activeFilters.flagged && !member.isRedFlagged) return false;

      // Unanswered Flagged filter
      if (activeFilters.unansweredFlagged) {
         const hasUnansweredFlag = member.pastoralNotes?.some(n => n.isRedFlag && n.status !== 'answered');
         if (!hasUnansweredFlag) return false;
      }

      // Zone filter
      if (activeFilters.selectedZone) {
         const group = groups.find(g => g.id === member.assignedGroupId);
         const zone = zones.find(z => z.name === activeFilters.selectedZone);
         if (!group || !zone || group.zoneId !== zone.id) return false;
      }

      return true;
   });

   const handleMemberClick = (member: Member) => {
      setSelectedMemberId(member.id);
      setView('profile');
   };

   const handleOpenAssignModal = (member: Member) => {
      setMemberToAssign(member);
      setSelectedZone('');
      setSelectedCell('');
      setShowAssignModal(true);
   };

   const handleAssignMember = () => {
      if (memberToAssign && selectedCell) {
         onUpdateMember(memberToAssign.id, {
            assignedGroupId: selectedCell,
            participationScore: 100 // Reset/Set initial participation
         });
         setShowAssignModal(false);
         setMemberToAssign(null);
         alert(`Successfully assigned ${memberToAssign.firstName} to selected cell!`);
      }
   };



   if (view === 'profile' && selectedMemberId) {
      const member = members.find(m => m.id === selectedMemberId);
      if (member) {
         return <MemberProfile member={member} onBack={() => setView('list')} onUpdate={onUpdateMember} />;
      }
   }

   return (
      <div className="space-y-6 animate-fadeIn">
         {/* Header & Controls */}
         <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
               <input
                  type="text"
                  placeholder="Search by name or document number..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex gap-2 w-full md:w-auto relative">
               {/* Filter Dropdown */}
               <div className="relative">
                  <button
                     onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showFilterDropdown ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                  >
                     <Filter size={16} />
                     <span>Filters</span>
                     {(activeFilters.unassigned || activeFilters.flagged || activeFilters.unansweredFlagged || activeFilters.selectedZone) && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                     )}
                     <ChevronDown size={14} className={`transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showFilterDropdown && (
                     <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowFilterDropdown(false)}></div>
                        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-40 p-4 animate-scaleIn origin-top-right">
                           <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Advanced Filters</span>
                              <button
                                 onClick={() => setActiveFilters({ unassigned: false, flagged: false, unansweredFlagged: false, selectedZone: '' })}
                                 className="text-[10px] font-bold text-blue-600 hover:underline"
                              >
                                 Clear All
                              </button>
                           </div>

                           <div className="space-y-4">
                              {/* Zone Selector */}
                              <div>
                                 <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Filter by Zone</label>
                                 <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={activeFilters.selectedZone}
                                    onChange={e => setActiveFilters({ ...activeFilters, selectedZone: e.target.value })}
                                 >
                                    <option value="">All Zones</option>
                                    {zones.map(z => (
                                       <option key={z.name} value={z.name}>{z.name}</option>
                                    ))}
                                 </select>
                              </div>

                              {/* Checkbox Filters */}
                              <div className="space-y-2">
                                 <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Status Filters</label>

                                 <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                                    <input
                                       type="checkbox"
                                       checked={activeFilters.unassigned}
                                       onChange={e => setActiveFilters({ ...activeFilters, unassigned: e.target.checked })}
                                       className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Unassigned Members</span>
                                 </label>

                                 <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                                    <input
                                       type="checkbox"
                                       checked={activeFilters.flagged}
                                       onChange={e => setActiveFilters({ ...activeFilters, flagged: e.target.checked })}
                                       className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                    />
                                    <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Flagged (Urgent)</span>
                                 </label>

                                 <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
                                    <input
                                       type="checkbox"
                                       checked={activeFilters.unansweredFlagged}
                                       onChange={e => setActiveFilters({ ...activeFilters, unansweredFlagged: e.target.checked })}
                                       className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <div className="flex flex-col">
                                       <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Unanswered Flagged</span>
                                       <span className="text-[10px] text-gray-400">Questions needing attention</span>
                                    </div>
                                 </label>
                              </div>
                           </div>

                           <button
                              onClick={() => setShowFilterDropdown(false)}
                              className="w-full mt-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-black transition-all"
                           >
                              Apply Filters
                           </button>
                        </div>
                     </>
                  )}
               </div>

               <button
                  onClick={onAddMember}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
               >
                  <Plus size={16} />
                  New Member
               </button>
            </div>
         </div>

         {/* Member Table */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                     <tr>
                        <th className="px-6 py-4 font-bold text-gray-600">Name</th>
                        <th className="px-6 py-4 font-bold text-gray-600">Mobile Phone</th>
                        <th className="px-6 py-4 font-bold text-gray-600 text-center">Red Flag</th>
                        <th className="px-6 py-4 font-bold text-gray-600 text-center">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                     {filteredMembers.map(member => (
                        <tr key={member.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleMemberClick(member)}>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                    <img
                                       src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`}
                                       alt=""
                                       className="w-full h-full object-cover"
                                    />
                                 </div>
                                 <div>
                                    <p className="font-bold text-gray-900">{member.firstName} {member.lastName}</p>
                                    <p className="text-xs text-blue-600 font-medium">ID: {member.memberId || 'N/A'}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-gray-600">
                              {member.mobilePhone}
                           </td>

                           <td className="px-6 py-4 text-center">
                              {member.isRedFlagged ? (
                                 <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                                    <Flag size={10} fill="currentColor" /> Flagged
                                 </span>
                              ) : (
                                 <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-100">
                                    <Check size={10} /> Clear
                                 </span>
                              )}
                           </td>
                           <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-2">
                                 {!member.assignedGroupId && (
                                    <button
                                       className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded uppercase hover:bg-black transition-all"
                                       onClick={() => handleOpenAssignModal(member)}
                                    >
                                       Assign
                                    </button>
                                 )}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center text-gray-500 text-xs">
               <span>Showing 1 to {Math.min(25, filteredMembers.length)} of {filteredMembers.length} members</span>
               <div className="flex gap-2">
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">Previous</button>
                  <button className="px-3 py-1 bg-blue-600 text-white border border-blue-600 rounded">1</button>
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">2</button>
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">3</button>
                  <span className="px-2 py-1">...</span>
                  <button className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50">Next</button>
               </div>
            </div>
         </div>

         {/* ASSIGNMENT MODAL */}
         {showAssignModal && memberToAssign && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowAssignModal(false)}></div>
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative animate-slideUp overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                     <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-gray-900">Member Assignment</h2>
                        <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600 p-1 bg-white rounded-full shadow-sm">
                           <X size={20} />
                        </button>
                     </div>

                     <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-xl border-2 border-blue-100">
                           {memberToAssign.firstName[0]}{memberToAssign.lastName[0]}
                        </div>
                        <div className="flex-1 space-y-1">
                           <p className="text-lg font-black text-gray-900">{memberToAssign.firstName} {memberToAssign.lastName}</p>
                           <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-gray-500">
                              <span className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" /> {memberToAssign.subCity || 'Location N/A'}</span>
                              <span className="flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {memberToAssign.mobilePhone}</span>
                           </div>
                           <p className="text-[10px] text-blue-600 uppercase font-black tracking-widest mt-1">ID: {memberToAssign.memberId || 'PENDING'}</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-8 space-y-8">
                     {/* Step 1: Select Zone */}
                     <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Step 1: Select Zone</label>
                        <div className="grid grid-cols-2 gap-3">
                           {zones.map(zone => (
                              <button
                                 key={zone.id}
                                 onClick={() => { setSelectedZone(zone.id); setSelectedCell(''); }}
                                 className={`p-4 rounded-xl border-2 text-left transition-all relative group ${selectedZone === zone.id
                                    ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50'
                                    : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                                    }`}
                              >
                                 <p className={`font-black text-sm uppercase ${selectedZone === zone.id ? 'text-blue-700' : 'text-gray-600'}`}>{zone.name}</p>
                                 <p className="text-[10px] font-bold text-gray-400 mt-1">{groups.filter(g => g.zoneId === zone.id).length} Active Cells</p>
                                 {selectedZone === zone.id && (
                                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                       <Check size={12} />
                                    </div>
                                 )}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Step 2: Select Cell */}
                     <div className={`${!selectedZone && 'opacity-30 pointer-events-none transition-opacity'}`}>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Step 2: Assign Cell</label>
                        {selectedZone ? (
                           <div className="space-y-3">
                              {groups.filter(g => g.zoneId === selectedZone).length > 0 ? (
                                 groups.filter(g => g.zoneId === selectedZone).map(group => (
                                    <button
                                       key={group.id}
                                       onClick={() => setSelectedCell(group.id)}
                                       className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${selectedCell === group.id
                                          ? 'border-emerald-500 bg-emerald-50/30'
                                          : 'border-gray-100 hover:bg-gray-50 shadow-sm'
                                          }`}
                                    >
                                       <div className="flex items-center gap-3">
                                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black ${selectedCell === group.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                                             }`}>
                                             <UsersIcon size={18} />
                                          </div>
                                          <div className="text-left">
                                             <p className={`font-black uppercase text-sm ${selectedCell === group.id ? 'text-emerald-700' : 'text-gray-700'}`}>{group.name}</p>
                                             <p className="text-[10px] font-bold text-gray-400">Led by {group.leaderId}</p>
                                          </div>
                                       </div>
                                       {selectedCell === group.id && <Check size={20} className="text-emerald-500" />}
                                    </button>
                                 ))
                              ) : (
                                 <div className="text-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <p className="text-sm font-bold text-gray-400">No cells found in this zone</p>
                                 </div>
                              )}
                           </div>
                        ) : (
                           <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                              <p className="text-sm font-bold text-gray-400 italic">Please select a zone first</p>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                     <button
                        onClick={() => setShowAssignModal(false)}
                        className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-black uppercase tracking-tight hover:bg-gray-50 transition-all shadow-sm"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleAssignMember}
                        disabled={!selectedCell}
                        className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-black uppercase tracking-widest hover:bg-black disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-gray-900/20 active:scale-95 group"
                     >
                        Complete Assignment
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
