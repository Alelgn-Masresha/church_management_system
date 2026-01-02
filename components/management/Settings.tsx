import React, { useState } from 'react';
import { Shield, Bell, Sliders, Edit2, Trash2, Plus, Search, X, Check } from 'lucide-react';
import { Member } from '../../types';

interface Props {
   members: Member[];
   onUpdateMember: (id: string, updates: Partial<Member>) => void;
   onUpdateMembers: (updates: { id: string; data: Partial<Member> }[]) => void;
}

export const Settings: React.FC<Props> = ({ members, onUpdateMember, onUpdateMembers }) => {
   const [activeTab, setActiveTab] = useState<'roles' | 'notifications' | 'system'>('roles');

   // Role Management State
   const [showAddModal, setShowAddModal] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
   const [selectedRole, setSelectedRole] = useState<Member['role']>('Admin');

   const systemUsers = members.filter(m =>
      ['Admin', 'Pastor', 'Zone Leader'].includes(m.role)
   );

   const searchedMembers = members.filter(m => {
      if (!searchQuery.trim()) return false;
      const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || m.mobilePhone.includes(searchQuery);
   }).slice(0, 5);

   const handleAddRoleMember = () => {
      if (selectedMemberId && selectedRole) {
         if (selectedRole === 'Pastor') {
            const currentPastor = members.find(m => m.role === 'Pastor');
            if (currentPastor && currentPastor.id !== selectedMemberId) {
               // Demote current pastor and promote new one
               onUpdateMembers([
                  { id: currentPastor.id, data: { role: 'Member' } },
                  { id: selectedMemberId, data: { role: 'Pastor' } }
               ]);
            } else {
               onUpdateMember(selectedMemberId, { role: selectedRole });
            }
         } else {
            onUpdateMember(selectedMemberId, { role: selectedRole });
         }
         setShowAddModal(false);
         setSelectedMemberId(null);
         setSearchQuery('');
      }
   };

   const menuItems = [
      { id: 'roles', label: 'User Role Management', icon: Shield },
      { id: 'notifications', label: 'Notification Settings', icon: Bell },
      { id: 'system', label: 'System Preferences', icon: Sliders },
   ];

   return (
      <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn h-full">
         {/* Settings Sidebar */}
         <div className="w-full lg:w-64 flex-shrink-0">
            <div className="mb-6">
               <h2 className="text-lg font-bold text-gray-900">Admin Settings</h2>
               <p className="text-xs text-gray-500">System Configuration</p>
            </div>
            <div className="space-y-1">
               {menuItems.map(item => (
                  <button
                     key={item.id}
                     onClick={() => setActiveTab(item.id as any)}
                     className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${activeTab === item.id ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}
                   `}
                  >
                     <item.icon size={18} />
                     {item.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Settings Content */}
         <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-8 min-h-[600px]">
            {activeTab === 'roles' && (
               <div className="space-y-6">
                  <div>
                     <h2 className="text-xl font-bold text-gray-900">User Role Management</h2>
                     <p className="text-sm text-gray-500 mt-1">Manage user permissions and access levels across the system</p>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                     <div className="flex justify-between items-center mb-6">
                        <div>
                           <h3 className="font-bold text-gray-800">Active Users</h3>
                           <p className="text-xs text-gray-500">{systemUsers.length} total users</p>
                        </div>
                        <button
                           onClick={() => setShowAddModal(true)}
                           className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black"
                        >
                           <Plus size={16} /> Add New User
                        </button>
                     </div>

                     <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-sm">
                           <thead className="bg-white border-b border-gray-100">
                              <tr>
                                 <th className="px-6 py-4 font-bold text-xs uppercase text-gray-500">User</th>
                                 <th className="px-6 py-4 font-bold text-xs uppercase text-gray-500">Email</th>
                                 <th className="px-6 py-4 font-bold text-xs uppercase text-gray-500">Current Role</th>
                                 <th className="px-6 py-4 font-bold text-xs uppercase text-gray-500 border-l border-gray-100">Status</th>
                                 <th className="px-6 py-4 font-bold text-xs uppercase text-gray-500 text-right">Actions</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                              {systemUsers.map((user, idx) => (
                                 <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                                          {user.firstName[0]}{user.lastName[0]}
                                       </div>
                                       <span className="font-bold text-gray-900">{user.firstName} {user.lastName}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{user.primaryEmail || 'N/A'}</td>
                                    <td className="px-6 py-4">
                                       <select
                                          value={user.role}
                                          onChange={(e) => {
                                             const newRole = e.target.value as any;
                                             if (newRole === 'Pastor') {
                                                const currentPastor = members.find(m => m.role === 'Pastor');
                                                if (currentPastor && currentPastor.id !== user.id) {
                                                   if (confirm(`There is already a Pastor (${currentPastor.firstName}). Setting ${user.firstName} as Pastor will demote ${currentPastor.firstName} to Member. Proceed?`)) {
                                                      onUpdateMembers([
                                                         { id: currentPastor.id, data: { role: 'Member' } },
                                                         { id: user.id, data: { role: 'Pastor' } }
                                                      ]);
                                                   }
                                                   return;
                                                }
                                             }
                                             onUpdateMember(user.id, { role: newRole });
                                          }}
                                          className="bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500 font-medium"
                                       >
                                          <option value="Admin">Admin</option>
                                          <option value="Pastor">Pastor</option>
                                          <option value="Zone Leader">Zone Leader</option>
                                          <option value="Member">Demote to Member</option>
                                       </select>
                                    </td>
                                    <td className="px-6 py-4">
                                       <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                          {user.status}
                                       </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                       <div className="flex justify-end gap-2">
                                          <button className="text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                          <button
                                             onClick={() => {
                                                if (confirm(`Are you sure you want to demote ${user.firstName}?`)) {
                                                   onUpdateMember(user.id, { role: 'Member' });
                                                }
                                             }}
                                             className="text-gray-400 hover:text-red-600"
                                          >
                                             <Trash2 size={16} />
                                          </button>
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                        {systemUsers.length === 0 && (
                           <div className="p-12 text-center text-gray-500 italic">
                              No administrative users found.
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Add User Modal */}
                  {showAddModal && (
                     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-zoomIn">
                           <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                              <div>
                                 <h3 className="text-xl font-bold">Assign New Role</h3>
                                 <p className="text-xs text-gray-400 mt-1">Search member and select administrative role</p>
                              </div>
                              <button onClick={() => setShowAddModal(false)} className="hover:bg-white/10 p-2 rounded-lg transition-colors">
                                 <X size={20} />
                              </button>
                           </div>

                           <div className="p-6 space-y-6">
                              {/* Search Section */}
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700">Search Member</label>
                                 <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                       type="text"
                                       placeholder="Enter name or phone number..."
                                       value={searchQuery}
                                       onChange={(e) => setSearchQuery(e.target.value)}
                                       className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    />
                                 </div>

                                 {/* Search Results */}
                                 {searchQuery.trim() && (
                                    <div className="mt-2 border border-blue-100 rounded-xl bg-blue-50/30 overflow-hidden divide-y divide-blue-50">
                                       {searchedMembers.map(m => (
                                          <button
                                             key={m.id}
                                             onClick={() => {
                                                setSelectedMemberId(m.id);
                                                setSearchQuery(`${m.firstName} ${m.lastName}`);
                                             }}
                                             className={`w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-blue-50
                                                        ${selectedMemberId === m.id ? 'bg-blue-100 text-blue-900' : 'text-gray-600'}
                                                    `}
                                          >
                                             <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-blue-400 border border-blue-200">
                                                   {m.firstName[0]}
                                                </div>
                                                <div>
                                                   <p className="text-sm font-bold">{m.firstName} {m.lastName}</p>
                                                   <p className="text-[10px]">{m.mobilePhone} • {m.role}</p>
                                                </div>
                                             </div>
                                             {selectedMemberId === m.id && <Check size={16} className="text-blue-600" />}
                                          </button>
                                       ))}
                                       {searchedMembers.length === 0 && (
                                          <p className="p-4 text-center text-xs text-gray-400 italic">No members found matching "{searchQuery}"</p>
                                       )}
                                    </div>
                                 )}
                              </div>

                              {/* Role Selection */}
                              <div className="space-y-2">
                                 <label className="text-sm font-bold text-gray-700">Assign Role</label>
                                 <div className="grid grid-cols-3 gap-3">
                                    {['Admin', 'Pastor', 'Zone Leader'].map(role => (
                                       <button
                                          key={role}
                                          onClick={() => setSelectedRole(role as any)}
                                          className={`p-3 rounded-xl border-2 text-xs font-bold transition-all
                                                    ${selectedRole === role
                                                ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm'
                                                : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'
                                             }
                                                `}
                                       >
                                          {role}
                                       </button>
                                    ))}
                                 </div>
                              </div>

                              <div className="pt-4 flex gap-3">
                                 <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                 >
                                    Cancel
                                 </button>
                                 <button
                                    disabled={!selectedMemberId}
                                    onClick={handleAddRoleMember}
                                    className="flex-[1.5] px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-900/20"
                                 >
                                    Assign Role
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            )}

            {activeTab === 'notifications' && (
               <div className="space-y-8">
                  <div>
                     <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <h3 className="text-gray-700 font-bold mb-4">User Activity Notifications</h3>
                        <div className="space-y-4">
                           {['New user registration', 'Role change requests', 'Failed login attempts'].map(label => (
                              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                                 <span className="text-gray-600 text-sm">{label}</span>
                                 <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                                       Email <input type="checkbox" className="toggle-checkbox" defaultChecked />
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                                       In-App <input type="checkbox" className="toggle-checkbox" defaultChecked />
                                    </label>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div>
                        <h3 className="text-gray-700 font-bold mb-4">System Notifications</h3>
                        <div className="space-y-4">
                           {['System errors', 'Security alerts', 'Scheduled maintenance'].map(label => (
                              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50">
                                 <span className="text-gray-600 text-sm flex items-center gap-2"><Shield size={14} className="text-gray-400" /> {label}</span>
                                 <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                                       Email <input type="checkbox" className="toggle-checkbox" defaultChecked />
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                                       In-App <input type="checkbox" className="toggle-checkbox" defaultChecked />
                                    </label>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'system' && (
               <div className="space-y-8">
                  <div>
                     <h2 className="text-xl font-bold text-gray-900">System Preferences</h2>
                  </div>

                  <div className="space-y-8">
                     <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Security Settings</h3>
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="font-bold text-gray-900 text-sm">Two-factor authentication</p>
                              <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
                           </div>
                           <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                              <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-blue-600" defaultChecked />
                              <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">System Behavior</h3>
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="font-bold text-gray-900 text-sm">Maintenance mode</p>
                              <p className="text-xs text-gray-500">Enable system-wide maintenance mode</p>
                           </div>
                           <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                              <input type="checkbox" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300" />
                              <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100 flex justify-end gap-3">
                     <button className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                     <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black">Save Changes</button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};
