
import React, { useState } from 'react';
import { RegistrationWizard } from './components/RegistrationWizard';
import { HBSPortal } from './components/hbs/HBSPortal';
import { ManagementPortal } from './components/management/ManagementPortal';
import { Church, Users, FileText, Menu, X, ShieldCheck } from 'lucide-react';
import { Member, HBSGroup, FormData, Zone } from './types';
import { MOCK_FULL_MEMBERS, MOCK_GROUPS, MOCK_ZONES } from './data/mockData';

export default function App() {
  const [activeModule, setActiveModule] = useState<'registration' | 'hbs' | 'admin'>('registration');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global State (In a real app, this would be in a Context or Redux store)
  const [members, setMembers] = useState<Member[]>(MOCK_FULL_MEMBERS);
  const [groups, setGroups] = useState<HBSGroup[]>(MOCK_GROUPS);
  const [zones, setZones] = useState<Zone[]>(MOCK_ZONES);
  const [newQuestionCount, setNewQuestionCount] = useState(2); // Mock initial count

  // Actions
  const handleNewRegistration = (data: FormData) => {
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

  // Structure Actions
  const structureActions = {
    addGroup: (g: HBSGroup) => setGroups(prev => [...prev, g]),
    updateGroup: (id: string, g: Partial<HBSGroup>) => setGroups(prev => prev.map(grp => grp.id === id ? { ...grp, ...g } : grp)),
    deleteGroup: (id: string) => setGroups(prev => prev.filter(g => g.id !== id)),
    addZone: (z: Zone) => setZones(prev => [...prev, z])
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
              <Church size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight tracking-tight text-gray-900">Summit Church CMS</h1>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">System Portal</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveModule('registration')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                 ${activeModule === 'registration'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}
               `}
            >
              <FileText size={18} />
              Registration
            </button>
            <button
              onClick={() => setActiveModule('hbs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                 ${activeModule === 'hbs'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}
               `}
            >
              <Users size={18} />
              HBS Portal
            </button>
            <button
              onClick={() => setActiveModule('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                 ${activeModule === 'admin'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}
               `}
            >
              <ShieldCheck size={18} />
              Admin / Pastor
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-2 animate-slideDown absolute w-full shadow-xl z-50">
            <button
              onClick={() => { setActiveModule('registration'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                 ${activeModule === 'registration' ? 'bg-blue-50 text-blue-900' : 'text-gray-600'}
               `}
            >
              <FileText size={20} /> New Member Registration
            </button>
            <button
              onClick={() => { setActiveModule('hbs'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                 ${activeModule === 'hbs' ? 'bg-blue-50 text-blue-900' : 'text-gray-600'}
               `}
            >
              <Users size={20} /> HBS Leader Portal
            </button>
            <button
              onClick={() => { setActiveModule('admin'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                 ${activeModule === 'admin' ? 'bg-blue-50 text-blue-900' : 'text-gray-600'}
               `}
            >
              <ShieldCheck size={20} /> Admin & Pastor
            </button>
          </div>
        )}
      </header>

      <main className={`flex-grow ${activeModule === 'admin' ? '' : 'py-8 px-4 sm:px-6 lg:px-8'}`}>
        <div className={`${activeModule === 'admin' ? '' : 'max-w-6xl mx-auto'}`}>
          {activeModule === 'registration' && (
            <RegistrationWizard onSuccess={handleNewRegistration} />
          )}
          {activeModule === 'hbs' && (
            <HBSPortal />
          )}
          {activeModule === 'admin' && (
            <ManagementPortal
              members={members}
              zones={zones}
              groups={groups}
              updateMember={handleUpdateMember}
              structureActions={structureActions}
              onRegisterMember={handleNewRegistration}
              newQuestionCount={newQuestionCount}
            />
          )}
        </div>
      </main>
    </div>
  );
}
