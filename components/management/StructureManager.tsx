import React, { useState } from 'react';
import { HBSGroup, Member, Zone } from '../../types';
import { Plus, Edit2, Trash2, Users, MapPin, X, Search, Check, User, ArrowLeft, Phone, BadgeCheck } from 'lucide-react';

interface Props {
   groups: HBSGroup[];
   members: Member[];
   zones: Zone[];
   onAddGroup: (group: HBSGroup) => void;
   onUpdateGroup: (id: string, group: Partial<HBSGroup>) => void;
   onDeleteGroup: (id: string) => void;
   onAddZone: (zone: Zone) => void;
   onUpdateZone: (id: string, zone: Partial<Zone>) => void;
   onDeleteZone: (id: string) => void;
}

export const StructureManager: React.FC<Props> = ({
   groups, members, zones, onAddGroup, onUpdateGroup, onDeleteGroup, onAddZone, onUpdateZone, onDeleteZone
}) => {
   const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || '');
   const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
   const [editingZone, setEditingZone] = useState<Zone | null>(null);
   const [editingCell, setEditingCell] = useState<HBSGroup | null>(null);

   // Modal States
   const [showAddZoneModal, setShowAddZoneModal] = useState(false);
   const [showAddCellModal, setShowAddCellModal] = useState(false);
   const [showEditZoneModal, setShowEditZoneModal] = useState(false);
   const [showEditCellModal, setShowEditCellModal] = useState(false);

   // New Zone Form State
   const [newZone, setNewZone] = useState({ name: '', area: '' });

   // New Cell Form State
   const [newCell, setNewCell] = useState({ name: '', leaderId: '', location: '' });
   const [leaderSearch, setLeaderSearch] = useState('');
   const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);

   // Filtered members for leader search
   const filteredMembers = members.filter(m =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(leaderSearch.toLowerCase())
   ).slice(0, 5);

   const handleAddZone = () => {
      if (!newZone.name) return;
      onAddZone({ id: '', name: newZone.name, area: newZone.area });
      setNewZone({ name: '', area: '' });
      setShowAddZoneModal(false);
   };

   const handleAddCell = () => {
      if (!newCell.name) return;
      const group: HBSGroup = {
         id: '', // Backend will generate
         name: newCell.name,
         zoneId: selectedZoneId,
         location: newCell.location || 'Church Campus',
         leaderId: newCell.leaderId,
         meetingDay: 'Wednesday', // Default
         status: 'Active'
      };
      onAddGroup(group);
      setNewCell({ name: '', leaderId: '', location: '' });
      setLeaderSearch('');
      setShowAddCellModal(false);
   };

   const handleUpdateZone = () => {
      if (!editingZone || !editingZone.name) return;
      onUpdateZone(editingZone.id, { name: editingZone.name, area: editingZone.area });
      setEditingZone(null);
      setShowEditZoneModal(false);
   };

   const handleDeleteZone = (id: string) => {
      const cellCount = groups.filter(g => g.zoneId === id).length;
      if (cellCount > 0) {
         alert(`Cannot delete this zone because it contains ${cellCount} active cells. Please remove or move the cells first.`);
         return;
      }
      if (window.confirm("Are you sure you want to delete this zone?")) {
         onDeleteZone(id);
         // If we deleted the currently selected zone, select another one if available
         if (id === selectedZoneId) {
            const remaining = zones.filter(z => z.id !== id);
            if (remaining.length > 0) setSelectedZoneId(remaining[0].id);
            else setSelectedZoneId('');
         }
      }
   };

   const handleUpdateCell = () => {
      if (!editingCell || !editingCell.name) return;
      onUpdateGroup(editingCell.id, editingCell);
      setEditingCell(null);
      setShowEditCellModal(false);
   };

   // Filter groups for current zone
   const zoneGroups = groups.filter(g => g.zoneId === selectedZoneId);
   const currentZone = zones.find(z => z.id === selectedZoneId);

   // Detail View Logic
   if (selectedCellId) {
      const cell = groups.find(g => g.id === selectedCellId);
      const cellMembers = members.filter(m => m.assignedGroupId === selectedCellId);
      const cellLeader = members.find(m => m.id === cell?.leaderId);

      if (!cell) return <div>Cell not found</div>;

      return (
         <div className="animate-fadeIn space-y-6">
            <button
               onClick={() => setSelectedCellId(null)}
               className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
               <ArrowLeft size={16} /> Back to Group Management
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                     <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{cell.name}</h1>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide
                           ${cell.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                        `}>
                           {cell.status || 'Active'}
                        </span>
                     </div>
                     <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5">
                           <MapPin size={16} /> {cell.location}
                        </span>
                        <span className='h-4 w-px bg-gray-300'></span>
                        <span className="flex items-center gap-1.5">
                           <Users size={16} /> {cellMembers.length} Members
                        </span>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                     <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cell Leader</p>
                        <p className="font-bold text-gray-900">{cellLeader ? `${cellLeader.firstName} ${cellLeader.lastName}` : 'Unassigned'}</p>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                        <img
                           src={cellLeader?.photoUrl || `https://ui-avatars.com/api/?name=${cellLeader?.firstName || '?'}+${cellLeader?.lastName || '?'}&background=random`}
                           alt=""
                           className="w-full h-full object-cover"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Members List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
               <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Assigned Members</h3>
                  <button className="text-xs font-bold text-blue-600 hover:underline">
                     + Assign New Member
                  </button>
               </div>

               {cellMembers.length > 0 ? (
                  <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                           <tr>
                              <th className="px-6 py-3">Member Name</th>
                              <th className="px-6 py-3">Phone</th>
                              <th className="px-6 py-3 text-center">Status</th>
                              <th className="px-6 py-3 text-center">Role</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {cellMembers.map(member => (
                              <tr key={member.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                                          <img src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`} alt="" />
                                       </div>
                                       <div>
                                          <p className="font-bold text-gray-900">{member.firstName} {member.lastName}</p>
                                          <p className="text-xs text-blue-600">{member.memberId || 'Pending ID'}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4 text-gray-600 font-medium">
                                    {member.mobilePhone}
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                                       Active
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-center">
                                    {member.id === cell.leaderId ? (
                                       <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                          <BadgeCheck size={12} /> Leader
                                       </span>
                                    ) : (
                                       <span className="text-gray-400 text-xs">Member</span>
                                    )}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               ) : (
                  <div className="p-12 text-center text-gray-400">
                     <Users size={48} className="mx-auto mb-3 text-gray-200" />
                     <p>No members currently assigned to this cell.</p>
                  </div>
               )}
            </div>
         </div>
      );
   }

   return (
      <div className="animate-fadeIn">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">Group Management <span className="text-gray-400 font-normal text-sm ml-2">Zones & Cells</span></h1>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Export</button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Zones */}
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-900">Zones</h3>
                  <button
                     onClick={() => setShowAddZoneModal(true)}
                     className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-800"
                  >
                     <Plus size={14} /> Add New Zone
                  </button>
               </div>

               <div className="space-y-3">
                  {zones.map(zone => (
                     <div
                        key={zone.id}
                        onClick={() => setSelectedZoneId(zone.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group relative
                         ${selectedZoneId === zone.id
                              ? 'bg-white border-black shadow-md ring-1 ring-black'
                              : 'bg-white border-gray-200 hover:border-gray-400'}
                      `}
                     >
                        <div className="flex justify-between items-start">
                           <div>
                              <h4 className="font-bold text-gray-900">{zone.name}</h4>
                              <p className="text-xs text-gray-500 mt-1">{zone.area}</p>
                           </div>
                           <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingZone(zone);
                                    setShowEditZoneModal(true);
                                 }}
                                 className="text-gray-400 hover:text-blue-600"
                              >
                                 <Edit2 size={14} />
                              </button>
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteZone(zone.id);
                                 }}
                                 className="text-gray-400 hover:text-red-600"
                              >
                                 <Trash2 size={14} />
                              </button>
                           </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 font-medium">
                           <Users size={14} />
                           {groups.filter(g => g.zoneId === zone.id).length} Cells
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Right Column: Cells */}
            <div className="lg:col-span-2 space-y-4">
               <div className="flex justify-between items-center mb-2">
                  <div>
                     <h3 className="text-lg font-bold text-gray-900">Cells in {currentZone?.name || '...'}</h3>
                     <p className="text-xs text-gray-500">{zoneGroups.length} active cells</p>
                  </div>
                  <button
                     onClick={() => {
                        setLeaderSearch('');
                        setShowAddCellModal(true);
                     }}
                     className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-800"
                  >
                     <Plus size={14} /> Add New Cell
                  </button>
               </div>

               <div className="space-y-3">
                  {zoneGroups.map(group => {
                     const leader = members.find(m => m.id === group.leaderId);
                     const memberCount = members.filter(m => m.assignedGroupId === group.id).length;
                     return (
                        <div
                           key={group.id}
                           onClick={() => setSelectedCellId(group.id)}
                           className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                           <div className="flex justify-between items-start">
                              <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{group.name}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                     ${group.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}
                                  `}>
                                       {group.status || 'Active'}
                                    </span>
                                 </div>
                                 <p className="text-sm text-gray-500">{group.location}</p>

                                 <div className="mt-4 flex items-center gap-4">
                                    {leader ? (
                                       <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                             <img src={`https://ui-avatars.com/api/?name=${leader.firstName}+${leader.lastName}&background=random`} alt="" />
                                          </div>
                                          <span className="text-sm text-gray-700 font-medium">{leader.firstName} {leader.lastName}</span>
                                       </div>
                                    ) : (
                                       <span className="text-sm text-gray-400 italic">No Leader Assigned</span>
                                    )}
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                       <Users size={14} /> {memberCount} members
                                    </div>
                                 </div>
                              </div>

                              <div className="flex gap-2">
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       setEditingCell(group);
                                       const currentLeader = members.find(m => m.id === group.leaderId);
                                       setLeaderSearch(currentLeader ? `${currentLeader.firstName} ${currentLeader.lastName}` : '');
                                       setShowEditCellModal(true);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                                 >
                                    <Edit2 size={16} />
                                 </button>
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       if (window.confirm("Delete this cell?")) onDeleteGroup(group.id);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     );
                  })}
                  {zoneGroups.length === 0 && (
                     <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <p className="text-gray-400 text-sm">No cells found in this zone.</p>
                     </div>
                  )}
               </div>
            </div>

         </div>

         {/* Add Zone Modal */}
         {showAddZoneModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
                  <div className="bg-black p-6 text-white flex justify-between items-center">
                     <div>
                        <h3 className="text-xl font-bold">Create New Zone</h3>
                        <p className="text-gray-400 text-xs mt-1">Define a new geographical area for cell groups.</p>
                     </div>
                     <button onClick={() => setShowAddZoneModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="p-8 space-y-5">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Zone Name</label>
                        <input
                           autoFocus
                           type="text"
                           value={newZone.name}
                           onChange={e => setNewZone({ ...newZone, name: e.target.value })}
                           placeholder="e.g. North District"
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Area Description</label>
                        <textarea
                           value={newZone.area}
                           onChange={e => setNewZone({ ...newZone, area: e.target.value })}
                           placeholder="e.g. Primary residential area near the city center"
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all h-24 resize-none"
                        />
                     </div>
                     <div className="pt-2 flex gap-3">
                        <button
                           onClick={() => setShowAddZoneModal(false)}
                           className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleAddZone}
                           disabled={!newZone.name}
                           className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-black/20"
                        >
                           Create Zone
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Add Cell Modal */}
         {showAddCellModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
                  <div className="bg-black p-6 text-white flex justify-between items-center shrink-0">
                     <div>
                        <h3 className="text-xl font-bold">Launch New Cell</h3>
                        <p className="text-gray-400 text-xs mt-1">Adding a new unit in <span className="text-white font-bold">{currentZone?.name}</span></p>
                     </div>
                     <button onClick={() => setShowAddCellModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="p-8 space-y-6 overflow-y-auto">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cell Name</label>
                        <input
                           autoFocus
                           type="text"
                           value={newCell.name}
                           onChange={e => setNewCell({ ...newCell, name: e.target.value })}
                           placeholder="e.g. Goshen Fellowship"
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                        />
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Meeting Location</label>
                        <div className="relative">
                           <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                           <input
                              type="text"
                              value={newCell.location}
                              onChange={e => setNewCell({ ...newCell, location: e.target.value })}
                              placeholder="Address or Landmark"
                              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                           />
                        </div>
                     </div>

                     <div className="space-y-1.5 relative">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cell Leader</label>
                        <div className="relative">
                           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                           <input
                              type="text"
                              placeholder="Search members by name..."
                              value={leaderSearch}
                              onChange={e => {
                                 setLeaderSearch(e.target.value);
                                 setShowLeaderDropdown(true);
                              }}
                              onFocus={() => setShowLeaderDropdown(true)}
                              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                           />
                           {newCell.leaderId && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-100 text-green-700 p-1 rounded-full">
                                 <Check size={14} />
                              </div>
                           )}
                        </div>

                        {showLeaderDropdown && leaderSearch && (
                           <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[70] animate-fadeIn">
                              {filteredMembers.length > 0 ? (
                                 filteredMembers.map(member => (
                                    <button
                                       key={member.id}
                                       onClick={() => {
                                          setNewCell({ ...newCell, leaderId: member.id });
                                          setLeaderSearch(`${member.firstName} ${member.lastName}`);
                                          setShowLeaderDropdown(false);
                                       }}
                                       className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0"
                                    >
                                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                          <User size={16} />
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold text-gray-900">{member.firstName} {member.lastName}</p>
                                          <p className="text-[10px] text-gray-400 font-medium">{member.mobilePhone}</p>
                                       </div>
                                       {newCell.leaderId === member.id && <Check size={16} className="ml-auto text-black" />}
                                    </button>
                                 ))
                              ) : (
                                 <div className="p-4 text-center text-gray-400 text-sm">No members found</div>
                              )}
                           </div>
                        )}
                     </div>

                     <div className="pt-4 flex gap-3 shrink-0 bg-white">
                        <button
                           onClick={() => setShowAddCellModal(false)}
                           className="flex-1 py-3 text-sm font-bold text-gray-400 hover:bg-gray-100 rounded-xl transition-colors border"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleAddCell}
                           disabled={!newCell.name || !newCell.leaderId}
                           className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-black/20"
                        >
                           Launch Cell
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Edit Zone Modal */}
         {showEditZoneModal && editingZone && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleIn">
                  <div className="bg-black p-6 text-white flex justify-between items-center">
                     <h3 className="text-xl font-bold">Edit Zone</h3>
                     <button onClick={() => setShowEditZoneModal(false)}><X size={20} /></button>
                  </div>
                  <div className="p-8 space-y-5">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Zone Name</label>
                        <input
                           type="text"
                           value={editingZone.name}
                           onChange={e => setEditingZone({ ...editingZone, name: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Area Description</label>
                        <textarea
                           value={editingZone.area}
                           onChange={e => setEditingZone({ ...editingZone, area: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl h-24 resize-none"
                        />
                     </div>
                     <div className="pt-2 flex gap-3">
                        <button onClick={() => setShowEditZoneModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                        <button onClick={handleUpdateZone} className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800">Save Changes</button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Edit Cell Modal */}
         {showEditCellModal && editingCell && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scaleIn">
                  <div className="bg-black p-6 text-white flex justify-between items-center">
                     <h3 className="text-xl font-bold">Edit Cell</h3>
                     <button onClick={() => setShowEditCellModal(false)}><X size={20} /></button>
                  </div>
                  <div className="p-8 space-y-6">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cell Name</label>
                        <input
                           type="text"
                           value={editingCell.name}
                           onChange={e => setEditingCell({ ...editingCell, name: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
                        <input
                           type="text"
                           value={editingCell.location}
                           onChange={e => setEditingCell({ ...editingCell, location: e.target.value })}
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                        />
                     </div>
                     <div className="space-y-1.5 relative">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cell Leader</label>
                        <div className="relative">
                           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                           <input
                              type="text"
                              placeholder="Search members by name..."
                              value={leaderSearch}
                              onChange={e => {
                                 setLeaderSearch(e.target.value);
                                 setShowLeaderDropdown(true);
                              }}
                              onFocus={() => setShowLeaderDropdown(true)}
                              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all"
                           />
                           {editingCell.leaderId && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-100 text-green-700 p-1 rounded-full">
                                 <Check size={14} />
                              </div>
                           )}
                        </div>

                        {showLeaderDropdown && leaderSearch && (
                           <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden z-[70] animate-fadeIn">
                              {filteredMembers.length > 0 ? (
                                 filteredMembers.map(member => (
                                    <button
                                       key={member.id}
                                       onClick={() => {
                                          setEditingCell({ ...editingCell, leaderId: member.id });
                                          setLeaderSearch(`${member.firstName} ${member.lastName}`);
                                          setShowLeaderDropdown(false);
                                       }}
                                       className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0"
                                    >
                                       <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                          <User size={16} />
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold text-gray-900">{member.firstName} {member.lastName}</p>
                                          <p className="text-[10px] text-gray-400 font-medium">{member.mobilePhone}</p>
                                       </div>
                                       {editingCell.leaderId === member.id && <Check size={16} className="ml-auto text-black" />}
                                    </button>
                                 ))
                              ) : (
                                 <div className="p-4 text-center text-gray-400 text-sm">No members found</div>
                              )}
                           </div>
                        )}
                     </div>
                     <div className="pt-4 flex gap-3">
                        <button onClick={() => setShowEditCellModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                        <button onClick={handleUpdateCell} className="flex-1 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800">Save Changes</button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
