
import React, { useState } from 'react';
import { Shield, Bell, Sliders, Edit2, Trash2, Plus } from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState<'roles' | 'notifications' | 'system'>('roles');

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
                         <p className="text-xs text-gray-500">4 total users</p>
                      </div>
                      <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black">
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
                               <th className="px-6 py-4 font-bold text-xs uppercase text-gray-500">Status</th>
                               <th className="px-6 py-4 font-bold text-xs uppercase text-gray-500 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                            {[
                               {name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'Admin', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson'},
                               {name: 'Michael Chen', email: 'm.chen@company.com', role: 'Manager', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Michael+Chen'},
                               {name: 'Emily Rodriguez', email: 'emily.r@company.com', role: 'Editor', status: 'Active', avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez'},
                               {name: 'David Kim', email: 'd.kim@company.com', role: 'Viewer', status: 'Inactive', avatar: 'https://ui-avatars.com/api/?name=David+Kim'},
                            ].map((user, idx) => (
                               <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 flex items-center gap-3">
                                     <img src={user.avatar} className="w-8 h-8 rounded-full bg-gray-200" alt="" />
                                     <span className="font-bold text-gray-900">{user.name}</span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                  <td className="px-6 py-4">
                                     <select className="bg-white border border-gray-200 rounded px-2 py-1 text-sm outline-none focus:border-blue-500">
                                        <option>{user.role}</option>
                                        <option>Admin</option>
                                        <option>Viewer</option>
                                     </select>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'Active' ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {user.status}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                     <div className="flex justify-end gap-2">
                                        <button className="text-gray-400 hover:text-blue-600"><Edit2 size={16}/></button>
                                        <button className="text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
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
                               <span className="text-gray-600 text-sm flex items-center gap-2"><Shield size={14} className="text-gray-400"/> {label}</span>
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
                            <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 checked:right-0 checked:border-blue-600" defaultChecked/>
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
