
import React from 'react';
import { Member, HBSGroup, Zone } from '../../types';
import { Users, MapPin, AlertTriangle, Activity, MoreHorizontal, Calendar, ArrowRight, UserPlus, Flag, ArrowRightLeft } from 'lucide-react';

interface Props {
   members: Member[];
   zones: Zone[];
   groups: HBSGroup[];
   onNavigate: (tab: 'dashboard' | 'members' | 'structure' | 'settings' | 'register', filters?: any) => void;
}

export const Dashboard: React.FC<Props> = ({ members, zones, groups, onNavigate }) => {
   const totalMembers = members.length;
   const activeMembersCount = members.filter(m => m.status === 'Active').length;
   const redFlaggedCount = members.filter(m => m.isRedFlagged).length;
   const avgParticipation = totalMembers > 0
      ? Math.round(members.reduce((acc, m) => acc + (m.participationScore || 0), 0) / totalMembers)
      : 0;

   // Gender Distribution
   const maleCount = members.filter(m => m.gender === 'Male').length;
   const femaleCount = members.filter(m => m.gender === 'Female').length;
   const unknownGenderCount = totalMembers - (maleCount + femaleCount);
   const malePercentage = totalMembers > 0 ? Math.round((maleCount / totalMembers) * 100) : 0;
   const femalePercentage = totalMembers > 0 ? Math.round((femaleCount / totalMembers) * 100) : 0;

   // Age Group Distribution
   const calculateAge = (dateStr?: string) => {
      if (!dateStr) return -1;
      try {
         const birth = new Date(dateStr);
         if (isNaN(birth.getTime())) return -1;
         const today = new Date();
         let age = today.getFullYear() - birth.getFullYear();
         const m = today.getMonth() - birth.getMonth();
         if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
         return age;
      } catch (e) { return -1; }
   };

   const ageGroups = {
      '0-12': members.filter(m => { const a = calculateAge(m.birthDate); return a >= 0 && a <= 12; }).length,
      '13-18': members.filter(m => { const a = calculateAge(m.birthDate); return a > 12 && a <= 18; }).length,
      '19-35': members.filter(m => { const a = calculateAge(m.birthDate); return a > 18 && a <= 35; }).length,
      '36-50': members.filter(m => { const a = calculateAge(m.birthDate); return a > 35 && a <= 50; }).length,
      '51-65': members.filter(m => { const a = calculateAge(m.birthDate); return a > 50 && a <= 65; }).length,
      '65+': members.filter(m => { const a = calculateAge(m.birthDate); return a > 65; }).length
   };

   const maxAgeCount = Math.max(...Object.values(ageGroups), 1);

   // Membership Growth (Last 6 Months)
   const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
         month: d.toLocaleString('default', { month: 'short' }),
         year: d.getFullYear(),
         monthIdx: d.getMonth()
      };
   }).reverse();

   const growthData = last6Months.map(m => {
      return members.filter(mem => {
         if (!mem.registrationDate) return false;
         const reg = new Date(mem.registrationDate);
         return reg.getMonth() === m.monthIdx && reg.getFullYear() === m.year;
      }).length;
   });

   const totalGrowth = growthData.reduce((a, b) => a + b, 0);
   const growthRate = totalMembers > 0 ? ((totalGrowth / (totalMembers || 1)) * 100).toFixed(1) : '0';

   // Recent Activities (Derived from recent registrations and flagged members)
   const recentActivities = [
      ...members.slice(0, 3).map(m => ({
         icon: UserPlus,
         title: "New Member Added",
         desc: `${m.firstName} ${m.lastName} joined`,
         time: m.registrationDate ? new Date(m.registrationDate).toLocaleDateString() : 'Recently'
      })),
      ...members.filter(m => m.isRedFlagged).slice(0, 2).map(m => ({
         icon: AlertTriangle,
         title: "Follow-Up Required",
         desc: `${m.firstName} marked with red flag`,
         time: "Action needed"
      }))
   ].slice(0, 4);

   const KpiCard = ({ title, value, subtext, icon: Icon, colorClass, trend, trendColor, onClick }: any) => (
      <div
         className={`bg-white p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] ${onClick ? 'cursor-pointer' : ''}`}
         onClick={onClick}
      >
         <div className="flex justify-between items-start">
            <div>
               <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 w-fit mb-4`}>
                  <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
               </div>
               <p className="text-slate-500 text-sm font-medium">{title}</p>
               <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
            </div>
            {trend && <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendColor}`}>{trend}</span>}
         </div>
         {subtext && <p className="text-slate-400 text-xs mt-2">{subtext}</p>}
      </div>
   );

   return (
      <div className="space-y-6 animate-fadeIn pb-10">
         <div className="flex justify-between items-end mb-2">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
               <p className="text-slate-500">Welcome back, Pastor John</p>
            </div>
            <div className="bg-white border border-blue-100 rounded-lg px-4 py-2 text-sm text-slate-600 flex items-center gap-2 shadow-sm">
               <Calendar size={16} className="text-blue-500" />
               <span className="font-medium">Today:</span> {new Date().toLocaleDateString()}
            </div>
         </div>

         {/* KPI Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard
               title="Total Members"
               value={totalMembers.toLocaleString()}
               icon={Users}
               colorClass="bg-blue-600"
               trend="+12%"
               trendColor="bg-blue-50 text-blue-700"
               onClick={() => onNavigate('members')}
            />
            <KpiCard
               title="Zones & Cells"
               value={`${zones.length} / ${groups.length}`}
               subtext="Active Structure"
               icon={MapPin}
               colorClass="bg-cyan-500"
               trend="Active"
               trendColor="bg-cyan-50 text-cyan-700"
               onClick={() => onNavigate('structure')}
            />
            <KpiCard
               title="Need Follow-Up"
               value={redFlaggedCount}
               icon={AlertTriangle}
               colorClass="bg-rose-500"
               trend="Urgent"
               trendColor="bg-rose-50 text-rose-700"
               onClick={() => onNavigate('members', { flagged: true })}
            />
            <KpiCard
               title="Avg Participation"
               value={`${avgParticipation}%`}
               icon={Activity}
               colorClass="bg-emerald-500"
               trend="Good"
               trendColor="bg-emerald-50 text-emerald-700"
            />
         </div>

         {/* Charts Row */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gender Distribution */}
            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800">Gender Distribution</h3>
                  <button className="text-slate-400 hover:text-blue-600"><MoreHorizontal size={20} /></button>
               </div>
               <div className="flex flex-col items-center justify-center py-4">
                  {/* Blue Themed Donut Chart */}
                  <div className="relative w-48 h-48 rounded-full border-[16px] border-slate-50" style={{
                     background: `conic-gradient(#2563EB 0% ${malePercentage}%, #DBEAFE ${malePercentage}% 100%)`,
                     borderRadius: '50%'
                  }}>
                     <div className="absolute inset-0 m-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                        <span className="text-3xl font-bold text-slate-800">{totalMembers}</span>
                        <span className="text-xs text-slate-400 uppercase font-medium">Total</span>
                     </div>
                  </div>
                  <div className="flex w-full justify-between mt-8 px-4">
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <div>
                           <p className="text-xs text-slate-500">Male</p>
                           <p className="font-bold text-slate-800">{malePercentage}% ({maleCount})</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                        <div>
                           <p className="text-xs text-slate-500">Female</p>
                           <p className="font-bold text-slate-800">{femalePercentage}% ({femaleCount})</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Age Group Distribution */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-slate-800">Age Group Distribution</h3>
                  <div className="flex bg-slate-100 rounded-lg p-1">
                     <button className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-medium shadow-sm">Monthly</button>
                     <button className="px-3 py-1 text-slate-500 text-xs font-medium hover:text-slate-800">Yearly</button>
                  </div>
               </div>

               <div className="flex justify-between items-end h-64 px-4 gap-4">
                  {Object.entries(ageGroups).map(([group, count]) => {
                     const height = Math.max(5, Math.round((count / (maxAgeCount || 1)) * 100));
                     return (
                        <div key={group} className="flex flex-col items-center gap-2 flex-1">
                           <div className="w-full bg-blue-50 rounded-t-lg relative group h-full flex items-end">
                              <div
                                 className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600 relative shadow-sm"
                                 style={{ height: `${height}%` }}
                              >
                                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-medium">
                                    {count} Members
                                 </div>
                              </div>
                           </div>
                           <span className="text-xs text-slate-500 font-medium">{group}</span>
                           <span className="text-xs font-bold text-slate-700">{count}</span>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>

         {/* Bottom Row */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Membership Growth */}
            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800">Membership Growth</h3>
                  <select className="bg-slate-50 border border-blue-100 text-slate-600 text-sm rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-100">
                     <option>Last 6 Months</option>
                  </select>
               </div>

               <div className="h-48 flex items-end relative border-b border-slate-100">
                  {/* Real Curve based on growthData */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                     <path
                        d={`M0,${150 - (growthData[0] || 0) * 10} ${growthData.map((v, i) => `L${(i * 100)},${150 - v * 10}`).join(' ')}`}
                        fill="none" stroke="#3B82F6" strokeWidth="3" vectorEffect="non-scaling-stroke"
                     />
                     <path d={`M0,${150 - (growthData[0] || 0) * 10} ${growthData.map((v, i) => `L${(i * 100)},${150 - v * 10}`).join(' ')} V180 H0 Z`} fill="url(#blueGradient)" opacity="0.15" />
                     <defs>
                        <linearGradient id="blueGradient" x1="0" x2="0" y1="0" y2="1">
                           <stop offset="0%" stopColor="#3B82F6" />
                           <stop offset="100%" stopColor="white" />
                        </linearGradient>
                     </defs>
                  </svg>

                  {/* X Axis Labels */}
                  <div className="w-full flex justify-between text-xs text-slate-400 absolute -bottom-6 font-medium">
                     {last6Months.map(m => <span key={m.month}>{m.month}</span>)}
                  </div>
               </div>

               <div className="flex justify-between items-end mt-12">
                  <div>
                     <p className="text-slate-400 text-xs mb-1 font-medium">Total (Last 6 Months)</p>
                     <p className="text-2xl font-bold text-slate-800">+{totalGrowth}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-slate-400 text-xs mb-1 font-medium">Relative Growth</p>
                     <p className="text-2xl font-bold text-blue-600">{growthRate}%</p>
                  </div>
               </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800">Recent Activities</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
               </div>

               <div className="space-y-6">
                  {recentActivities.length > 0 ? recentActivities.map((item, idx) => (
                     <div key={idx} className="flex gap-4 group cursor-default">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 transition-colors shrink-0">
                           <item.icon size={20} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</p>
                           <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                           <p className="text-xs text-slate-400 mt-1 font-medium">{item.time}</p>
                        </div>
                     </div>
                  )) : (
                     <div className="text-center py-10 text-slate-400 italic">No recent activities</div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};
