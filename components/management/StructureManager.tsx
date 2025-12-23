import React, { useState } from 'react';
import { HBSGroup, Member, Zone } from '../../types';
import { Plus, Edit2, Trash2, Users, MapPin, X, Search, Check, User } from 'lucide-react';

interface Props {
   groups: HBSGroup[];
   members: Member[];
   zones: Zone[];
   onAddGroup: (group: HBSGroup) => void;
   onUpdateGroup: (id: string, group: Partial<HBSGroup>) => void;
   onDeleteGroup: (id: string) => void;
   onAddZone: (zone: Zone) => void;
}

export const StructureManager: React.FC<Props> = ({
   groups, members, zones, onAddGroup, onUpdateGroup, onDeleteGroup, onAddZone
}) => {
   const [selectedZone, setSelectedZone] = useState<string>(zones[0]?.name || '');

   // Modal States
   const [showAddZoneModal, setShowAddZoneModal] = useState(false);
   const [showAddCellModal, setShowAddCellModal] = useState(false);

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
      onAddZone({ name: newZone.name, area: newZone.area });
      setNewZone({ name: '', area: '' });
      setShowAddZoneModal(false);
   };

   const handleAddCell = () => {
      if (!newCell.name) return;
      const group: HBSGroup = {
         id: Math.random().toString(36).substr(2, 9),
         name: newCell.name,
         zone: selectedZone,
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

   // Filter groups for current zone
   const zoneGroups = groups.filter(g => g.zone === selectedZone);

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
                        key={zone.name}
                        onClick={() => setSelectedZone(zone.name)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer group relative
                         ${selectedZone === zone.name
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
                              <button className="text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                              <button className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                           </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 font-medium">
                           <Users size={14} />
                           {groups.filter(g => g.zone === zone.name).length} Cells
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Right Column: Cells */}
            <div className="lg:col-span-2 space-y-4">
               <div className="flex justify-between items-center mb-2">
                  <div>
                     <h3 className="text-lg font-bold text-gray-900">Cells in {selectedZone}</h3>
                     <p className="text-xs text-gray-500">{zoneGroups.length} active cells</p>
                  </div>
                  <button
                     onClick={() => setShowAddCellModal(true)}
                     className="bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-800"
                  >
                     <Plus size={14} /> Add New Cell
                  </button>
               </div>

               <div className="space-y-3">
                  {zoneGroups.map(group => {
                     const leader = members.find(m => m.id === group.leaderId);
                     return (
                        <div key={group.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex justify-between items-start">
                              <div>
                                 <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-bold text-gray-900 text-lg">{group.name}</h4>
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
                                       <Users size={14} /> 24 members
                                    </div>
                                 </div>
                              </div>

                              <div className="flex gap-2">
                                 <button className="text-gray-400 hover:text-gray-600 p-1"><Edit2 size={16} /></button>
                                 <button className="text-gray-400 hover:text-gray-600 p-1"><Trash2 size={16} /></button>
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
                        <p className="text-gray-400 text-xs mt-1">Adding a new unit in <span className="text-white font-bold">{selectedZone}</span></p>
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
      </div>
   );
};
