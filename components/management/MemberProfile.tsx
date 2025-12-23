import React, { useState } from 'react';
import { Member, PastoralNote } from '../../types';
import { ArrowLeft, Plus, Flag, MessageCircle, Phone, Home, Filter, Download, User, Calendar, Cross, Droplets, X, AlertTriangle, Check } from 'lucide-react';
import { Select } from '../FormControls';

interface Props {
   member: Member;
   onBack: () => void;
   onUpdate: (id: string, updates: Partial<Member>) => void;
}

// Mock pastoral notes data
const MOCK_PASTORAL_NOTES: PastoralNote[] = [
   {
      id: 'pn1',
      date: '2025-01-12',
      type: 'redFlag',
      title: 'Spiritual Concern - Faith Crisis',
      category: 'RED FLAG',
      description: 'Sarah expressed doubts about her faith during our meeting. She mentioned feeling disconnected from God and questioning fundamental beliefs. Recommended follow-up counseling session within the week. Assigned Pastor David for additional support.',
      loggedBy: 'Pastor John Williams',
      location: 'Home Visit',
      isRedFlag: true
   },
   {
      id: 'pn2',
      date: '2024-12-28',
      type: 'followUp',
      title: 'Follow-up Visit - Prayer Request',
      category: 'Follow-up',
      description: "Visited Sarah to pray for her mother's health situation. She seemed more at peace and grateful for the church's support. Her mother is scheduled for surgery next month. We prayed together and discussed ways the church community can help during this time.",
      loggedBy: 'Pastor John Williams',
      location: 'Church Office',
      isRedFlag: false
   },
   {
      id: 'pn3',
      date: '2024-12-15',
      type: 'phone',
      title: 'Phone Check-in',
      category: 'Routine',
      description: 'Called to check on Sarah after she missed two consecutive Sunday services. She mentioned work has been demanding but expressed desire to return. Encouraged her to prioritize spiritual health and offered flexible small group options.',
      loggedBy: 'Elder Mary Thompson',
      location: 'Phone Call',
      isRedFlag: false
   },
   {
      id: 'pn4',
      date: '2025-12-23',
      type: 'question',
      title: 'Question regarding Romans 8:15',
      category: 'Bible Study Question',
      description: 'Member is asking for a deeper explanation of "Spirit of adoption" and how it differs from legal adoption in our cultural context.',
      loggedBy: 'HBS Leader Johnson',
      location: 'Church Office',
      isRedFlag: false,
      status: 'new'
   }
];

const calculateAge = (birthDate: string): number => {
   if (!birthDate) return 0;
   const today = new Date();
   const birth = new Date(birthDate);
   let age = today.getFullYear() - birth.getFullYear();
   const monthDiff = today.getMonth() - birth.getMonth();
   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
   }
   return age;
};

const formatDate = (dateStr: string): string => {
   if (!dateStr) return 'Not recorded';
   const date = new Date(dateStr);
   return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const NoteIcon = ({ type, status }: { type: PastoralNote['type'], status?: PastoralNote['status'] }) => {
   switch (type) {
      case 'redFlag':
         return <Flag size={18} className="text-gray-600" />;
      case 'phone':
         return <Phone size={18} className="text-gray-600" />;
      case 'followUp':
         return <MessageCircle size={18} className="text-gray-600" />;
      case 'question':
         return (
            <div className="relative">
               <MessageCircle size={18} className={`${status === 'answered' ? 'text-gray-300' : 'text-amber-600 animate-pulse'}`} />
            </div>
         );
      case 'visitation':
         return <Home size={18} className="text-gray-600" />;
      default:
         return <MessageCircle size={18} className="text-gray-600" />;
   }
};

export const MemberProfile: React.FC<Props> = ({ member, onBack, onUpdate }) => {
   const [activeTab, setActiveTab] = useState<'pastoral' | 'spiritual' | 'family'>('pastoral');
   const [showAddNoteModal, setShowAddNoteModal] = useState(false);
   const [pastoralNotes, setPastoralNotes] = useState<PastoralNote[]>(member.pastoralNotes || MOCK_PASTORAL_NOTES);

   const [newNote, setNewNote] = useState({
      title: '',
      description: '',
      isRedFlag: false
   });

   const handleAddNote = () => {
      const note: PastoralNote = {
         id: Math.random().toString(36).substr(2, 9),
         date: new Date().toISOString().split('T')[0],
         type: newNote.isRedFlag ? 'redFlag' : 'question',
         title: newNote.title,
         category: 'Member Inquiry', // Default simplified category
         description: newNote.description,
         loggedBy: 'Current User', // In real app, get from auth
         location: 'Church Office', // Default simplified location
         isRedFlag: newNote.isRedFlag
      };

      const updatedNotes = [note, ...pastoralNotes];
      setPastoralNotes(updatedNotes);
      onUpdate(member.id, { pastoralNotes: updatedNotes, isRedFlagged: newNote.isRedFlag || member.isRedFlagged });
      setShowAddNoteModal(false);
      setNewNote({ title: '', description: '', isRedFlag: false });
   };

   const handleToggleAnswered = (noteId: string) => {
      const updatedNotes = pastoralNotes.map(n =>
         n.id === noteId ? { ...n, status: n.status === 'answered' ? 'new' : 'answered' } : n
      ) as PastoralNote[];
      setPastoralNotes(updatedNotes);
      onUpdate(member.id, { pastoralNotes: updatedNotes });
   };

   const age = calculateAge(member.birthDate);

   return (
      <div className="space-y-6 animate-fadeIn">
         {/* Back Button */}
         <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
         >
            <ArrowLeft size={16} />
            <span>Back to Members List</span>
         </button>

         {/* Profile Header Card */}
         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-6">
               {/* Avatar */}
               <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-md">
                  <img
                     src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=f3f4f6&color=374151&size=128`}
                     alt="Profile"
                     className="w-full h-full object-cover"
                  />
               </div>

               {/* Member Info */}
               <div className="flex-1">
                  <div className="flex items-start justify-between">
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900">{member.firstName} {member.lastName}</h1>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                           <span>Member ID: <span className="font-medium text-gray-700">#{member.memberId || 'M-' + member.id.slice(0, 4).toUpperCase()}</span></span>
                           <span className="text-gray-300">|</span>
                           <span>Age: <span className="font-medium text-gray-700">{age || 'N/A'}</span></span>
                           <span className="text-gray-300">|</span>
                           <span>Member Since: <span className="font-medium text-gray-700">{formatDate(member.registrationDate)}</span></span>
                        </div>

                        {/* Spiritual Milestones */}
                        <div className="flex items-center gap-4 mt-3">
                           <div className="flex items-center gap-2 text-sm">
                              <Cross size={14} className="text-amber-600" />
                              <span className="text-gray-600">Salvation: <span className="font-medium text-gray-800">{formatDate(member.dateOfSalvation)}</span></span>
                           </div>
                           <div className="flex items-center gap-2 text-sm">
                              <Droplets size={14} className="text-blue-600" />
                              <span className="text-gray-600">Baptism: <span className="font-medium text-gray-800">{formatDate(member.baptismDate)}</span></span>
                           </div>
                        </div>
                     </div>

                     {/* Add Note Button */}
                     <button
                        onClick={() => setShowAddNoteModal(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                     >
                        <Plus size={16} />
                        Add Question / Note
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Tab Navigation */}
         <div className="border-b border-gray-200">
            <nav className="flex gap-6">
               <button
                  onClick={() => setActiveTab('pastoral')}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pastoral'
                     ? 'border-gray-900 text-gray-900'
                     : 'border-transparent text-gray-500 hover:text-gray-700'
                     }`}
               >
                  Questions & Notes
               </button>
               <button
                  onClick={() => setActiveTab('spiritual')}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'spiritual'
                     ? 'border-gray-900 text-gray-900'
                     : 'border-transparent text-gray-500 hover:text-gray-700'
                     }`}
               >
                  Spiritual History
               </button>
               <button
                  onClick={() => setActiveTab('family')}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'family'
                     ? 'border-gray-900 text-gray-900'
                     : 'border-transparent text-gray-500 hover:text-gray-700'
                     }`}
               >
                  Family Information
               </button>
            </nav>
         </div>

         {/* Tab Content */}
         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">

            {/* Pastoral Notes Tab */}
            {activeTab === 'pastoral' && (
               <div>
                  {/* Header with Filter/Export */}
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-lg font-bold text-gray-900">Member Questions & Notes</h2>
                     <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                           <Filter size={14} />
                           Filter
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                           <Download size={14} />
                           Export
                        </button>
                     </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-4">
                     {pastoralNotes.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                           <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                           <p className="text-gray-500">No pastoral notes recorded yet.</p>
                           <button
                              onClick={() => setShowAddNoteModal(true)}
                              className="mt-3 text-sm text-blue-600 font-medium hover:underline"
                           >
                              Add the first note
                           </button>
                        </div>
                     ) : (
                        pastoralNotes.map((note) => (
                           <div key={note.id} className="border-l-4 border-gray-200 pl-4 py-3 hover:bg-gray-50 transition-colors rounded-r-lg">
                              <div className="flex items-start gap-4">
                                 {/* Icon */}
                                 <div className="mt-1">
                                    <NoteIcon type={note.type} status={note.status} />
                                 </div>

                                 {/* Content */}
                                 <div className="flex-1">
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between">
                                       <div>
                                          {note.isRedFlag && (
                                             <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded mb-2">
                                                <AlertTriangle size={12} />
                                                RED FLAG
                                             </span>
                                          )}
                                          <div className="flex items-center gap-2">
                                             <h4 className={`font-semibold ${note.status === 'answered' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                {note.title}
                                             </h4>
                                             {note.status === 'answered' && (
                                                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                                   <Check size={10} /> Answered
                                                </span>
                                             )}
                                          </div>
                                       </div>
                                       <div className="flex items-center gap-3">
                                          <span className="text-sm text-gray-500">{formatDate(note.date)}</span>
                                       </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{note.description}</p>

                                    {/* Footer */}
                                    <div className="flex items-end justify-between mt-3 text-xs text-gray-500">
                                       <div className="flex items-center gap-4">
                                          <span className="flex items-center gap-1">
                                             <User size={12} />
                                             Logged by: <span className="font-medium">{note.loggedBy}</span>
                                          </span>
                                          <span className="flex items-center gap-1">
                                             {note.location === 'Home Visit' && <Home size={12} />}
                                             {note.location === 'Phone Call' && <Phone size={12} />}
                                             {note.location === 'Church Office' && <Calendar size={12} />}
                                             {note.location}
                                          </span>
                                       </div>

                                       {/* Mobile-Friendly "Mark Answered" Button Box */}
                                       {note.type === 'question' && note.status !== 'answered' && (
                                          <div
                                             onClick={() => handleToggleAnswered(note.id)}
                                             className="bg-white border-2 border-emerald-500 p-2 rounded-xl flex items-center gap-3 shadow-md hover:bg-emerald-50 transition-all cursor-pointer active:scale-95 group focus-within:ring-2 focus-within:ring-emerald-500"
                                          >
                                             <div className="w-5 h-5 rounded border-2 border-emerald-500 flex items-center justify-center bg-white group-hover:bg-emerald-100">
                                                <Check size={14} className="text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                             </div>
                                             <span className="font-black text-emerald-700 uppercase tracking-tighter text-[11px]">Mark as Answered</span>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            )}

            {/* Spiritual History Tab */}
            {activeTab === 'spiritual' && (
               <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900">Spiritual Journey</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-4">
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                           <div className="flex items-center gap-2 mb-2">
                              <Cross size={18} className="text-amber-600" />
                              <h4 className="font-bold text-gray-900">Salvation</h4>
                           </div>
                           <p className="text-sm text-gray-600">{formatDate(member.dateOfSalvation)}</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                           <div className="flex items-center gap-2 mb-2">
                              <Droplets size={18} className="text-blue-600" />
                              <h4 className="font-bold text-gray-900">Baptism</h4>
                           </div>
                           <p className="text-sm text-gray-600">{formatDate(member.baptismDate)}</p>
                           <p className="text-xs text-gray-500 mt-1">Baptized: {member.isBaptized || 'Not recorded'}</p>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                           <h4 className="font-bold text-gray-900 mb-2">Religious Background</h4>
                           <p className="text-sm text-gray-600">{member.religiousBackground || 'Not recorded'}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                           <h4 className="font-bold text-gray-900 mb-2">Discipleship Status</h4>
                           <p className="text-sm text-gray-600">
                              Currently in discipleship: {member.currentlyInDiscipleship || 'Not recorded'}
                           </p>
                           {member.discipleshipLeader && (
                              <p className="text-xs text-gray-500 mt-1">Leader: {member.discipleshipLeader}</p>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Ministries */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                     <h4 className="font-bold text-gray-900 mb-3">Ministry Involvement</h4>
                     {member.ministries && member.ministries.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                           {member.ministries.map((ministry, idx) => (
                              <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200">
                                 {ministry}
                              </span>
                           ))}
                        </div>
                     ) : (
                        <p className="text-sm text-gray-500">No ministry assignments recorded.</p>
                     )}
                  </div>
               </div>
            )}

            {/* Family Information Tab */}
            {activeTab === 'family' && (
               <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900">Family Information</h2>

                  {/* Marital Status */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                     <h4 className="font-bold text-gray-900 mb-3">Marital Status</h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                           <p className="text-gray-500">Status</p>
                           <p className="font-medium text-gray-900">{member.maritalStatus || 'Not recorded'}</p>
                        </div>
                        {member.maritalStatus === 'Married' && (
                           <>
                              <div>
                                 <p className="text-gray-500">Spouse Name</p>
                                 <p className="font-medium text-gray-900">{member.spouseName || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-gray-500">Spouse Phone</p>
                                 <p className="font-medium text-gray-900">{member.spouseMobile || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-gray-500">Spouse Member?</p>
                                 <p className="font-medium text-gray-900">{member.isSpouseMember || 'N/A'}</p>
                              </div>
                           </>
                        )}
                     </div>
                  </div>

                  {/* Children */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                     <h4 className="font-bold text-gray-900 mb-3">Children</h4>
                     {member.children && member.children.length > 0 ? (
                        <div className="space-y-3">
                           {member.children.map((child) => (
                              <div key={child.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                                 <div>
                                    <p className="font-medium text-gray-900">{child.fullName}</p>
                                    <p className="text-xs text-gray-500">{child.gender} • Born: {formatDate(child.birthDate)}</p>
                                 </div>
                                 <div className="flex gap-2">
                                    {child.isChristian && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Christian</span>}
                                    {child.isMember && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Member</span>}
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <p className="text-sm text-gray-500">No children recorded.</p>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* Add Note Modal */}
         {showAddNoteModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl animate-scaleIn overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-lg text-gray-900">Submit New Question or Note</h3>
                     <button onClick={() => setShowAddNoteModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
                        <input
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                           placeholder="e.g. Question regarding baptism, prayer request, etc."
                           value={newNote.title}
                           onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
                        <textarea
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                           rows={4}
                           placeholder="Detailed notes about the visit or interaction..."
                           value={newNote.description}
                           onChange={e => setNewNote({ ...newNote, description: e.target.value })}
                        />
                     </div>

                     <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <input
                           type="checkbox"
                           id="redFlag"
                           checked={newNote.isRedFlag}
                           onChange={e => setNewNote({ ...newNote, isRedFlag: e.target.checked })}
                           className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <label htmlFor="redFlag" className="text-sm font-medium text-red-800">
                           Mark as Red Flag (Urgent pastoral attention needed)
                        </label>
                     </div>
                  </div>

                  <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                     <button
                        onClick={() => setShowAddNoteModal(false)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleAddNote}
                        disabled={!newNote.title || !newNote.description}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                     >
                        Submit Question / Note
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};