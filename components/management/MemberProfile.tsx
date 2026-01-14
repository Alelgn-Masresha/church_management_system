import React, { useState, useEffect } from 'react';
import { Member, PastoralNote } from '../../types';
import { ArrowLeft, Plus, Flag, MessageCircle, Phone, Home, Filter, Download, User, Calendar, Cross, Droplets, X, AlertTriangle, Check, Edit, MapPin, Briefcase, Heart, BookOpen, Users as UsersIcon } from 'lucide-react';
import { PersonalAndAddress } from '../sections/PersonalAndAddress';
import { ReligiousAndMinistry } from '../sections/ReligiousAndMinistry';
import { FamilyInfo } from '../sections/FamilyInfo';
import { ProfessionalInfo } from '../sections/ProfessionalInfo';

interface Props {
   member: Member;
   onBack: () => void;
   onUpdate: (id: string, updates: Partial<Member>) => void;
   submitNote: (data: any) => Promise<void>;
   fetchMemberNotes: (id: string) => Promise<any[]>;
   currentUser: Member | null;
}

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

const NoteIcon = ({ type, status }: { type: PastoralNote['type'] | string, status?: PastoralNote['status'] }) => {
   switch (type) {
      case 'redFlag':
         return <Flag size={18} className="text-red-600" />;
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

const DetailItem = ({ label, value, className = "" }: { label: string; value: any; className?: string }) => (
   <div className={`space-y-1 ${className}`}>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</span>
      <p className="text-sm font-bold text-gray-800 break-words">{value || 'N/A'}</p>
   </div>
);

export const MemberProfile: React.FC<Props> = ({ member, onBack, onUpdate, submitNote, fetchMemberNotes, currentUser }) => {
   const [activeTab, setActiveTab] = useState<'pastoral' | 'spiritual' | 'family' | 'details'>('pastoral');
   const [detailsCategory, setDetailsCategory] = useState<'personal' | 'address' | 'testimony' | 'ministry' | 'family' | 'professional'>('personal');
   const [isEditing, setIsEditing] = useState(false);
   const [editData, setEditData] = useState<Member>(member);
   const [showAddNoteModal, setShowAddNoteModal] = useState(false);
   const [pastoralNotes, setPastoralNotes] = useState<any[]>([]);
   const [loadingNotes, setLoadingNotes] = useState(false);

   const [newNote, setNewNote] = useState({
      title: '',
      description: '',
      isRedFlag: false
   });

   useEffect(() => {
      setEditData(member);
   }, [member]);

   useEffect(() => {
      const loadNotes = async () => {
         setLoadingNotes(true);
         try {
            const notes = await fetchMemberNotes(member.id);
            setPastoralNotes(notes);
         } catch (error) {
            console.error("Error loading notes:", error);
         } finally {
            setLoadingNotes(false);
         }
      };
      loadNotes();
   }, [member.id, fetchMemberNotes]);

   const handleAddNote = async () => {
      try {
         const notePayload = {
            memberId: member.id,
            authorId: currentUser?.id || member.id, // Fallback to a valid UUID
            title: newNote.title,
            content: newNote.description,
            noteType: newNote.isRedFlag ? 'redFlag' : 'visitation',
            location: 'Church Office',
            category: 'Visitation Note',
            isRedFlag: newNote.isRedFlag,
            status: 'new'
         };

         await submitNote(notePayload);

         // Refresh list
         const updatedNotes = await fetchMemberNotes(member.id);
         setPastoralNotes(updatedNotes);

         setShowAddNoteModal(false);
         setNewNote({ title: '', description: '', isRedFlag: false });

         if (newNote.isRedFlag && !member.isRedFlagged) {
            onUpdate(member.id, { isRedFlagged: true });
         }
      } catch (error) {
         console.error("Error submitting note:", error);
         alert("Failed to save visitation note.");
      }
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
               <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-md">
                  <img
                     src={member.photoUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=f3f4f6&color=374151&size=128`}
                     alt="Profile"
                     className="w-full h-full object-cover"
                  />
               </div>

               <div className="flex-1">
                  <div className="flex items-start justify-between">
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900">{member.firstName} {member.lastName}</h1>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                           <span>Member ID: <span className="font-medium text-gray-700">#{member.memberId || 'M-' + member.id.slice(0, 4).toUpperCase()}</span></span>
                           <span className="text-gray-300">|</span>
                           <span>Age: <span className="font-medium text-gray-700">{age || 'N/A'}</span></span>
                           <span className="text-gray-300">|</span>
                           <span>Registered: <span className="font-medium text-gray-700">{formatDate(member.registrationDate)}</span></span>
                        </div>

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

                     <button
                        onClick={() => setShowAddNoteModal(true)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                     >
                        <Plus size={16} />
                        Add Visitation Note
                     </button>
                  </div>
               </div>
            </div>
         </div>

         <div className="border-b border-gray-200">
            <nav className="flex gap-6">
               {[
                  { id: 'pastoral', label: 'Visitation Notes' },
                  { id: 'details', label: 'Full Profile' }
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id as any)}
                     className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                  >
                     {tab.label}
                  </button>
               ))}
            </nav>
         </div>

         <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[400px]">
            {activeTab === 'pastoral' && (
               <div>
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-lg font-bold text-gray-900">Member History & Notes</h2>
                     <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                           <Filter size={14} /> Filter
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                           <Download size={14} /> Export
                        </button>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {loadingNotes ? (
                        <div className="flex justify-center py-12">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                     ) : pastoralNotes.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                           <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                           <p className="text-gray-500">No records found for this member.</p>
                        </div>
                     ) : (
                        pastoralNotes.map((note) => (
                           <div key={note.id} className="border-l-4 border-gray-100 pl-4 py-3 hover:bg-gray-50 transition-colors rounded-r-lg">
                              <div className="flex items-start gap-4">
                                 <div className="mt-1">
                                    <NoteIcon type={note.type || note.noteType} status={note.status} />
                                 </div>
                                 <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                       <div>
                                          {note.isRedFlag && (
                                             <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded mb-1">
                                                <AlertTriangle size={10} /> RED FLAG
                                             </span>
                                          )}
                                          <h4 className="font-bold text-gray-900">{note.title}</h4>
                                       </div>
                                       <span className="text-xs text-gray-500">{formatDate(note.date || note.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{note.description || note.content}</p>
                                    <div className="flex items-center gap-4 mt-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                       <span className="flex items-center gap-1"><User size={12} /> Logged by: {note.loggedBy || note.authorName || 'Staff'}</span>
                                       <span className="flex items-center gap-1"><Home size={12} /> {note.location || 'Office'}</span>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            )}

            {activeTab === 'details' && (
               <div className="flex flex-col md:flex-row gap-8">
                  {/* Category Sidebar */}
                  <div className="w-full md:w-64 flex-shrink-0 space-y-1">
                     {[
                        { id: 'personal', label: 'Personal Information', icon: User },
                        { id: 'address', label: 'Living Address', icon: MapPin },
                        { id: 'testimony', label: 'Life Testimony', icon: BookOpen },
                        { id: 'ministry', label: 'Ministry & Discipleship', icon: Heart },
                        { id: 'family', label: 'Family Information', icon: UsersIcon },
                        { id: 'professional', label: 'Professional & Education', icon: Briefcase },
                     ].map((cat) => (
                        <button
                           key={cat.id}
                           onClick={() => {
                              setDetailsCategory(cat.id as any);
                              setIsEditing(false);
                           }}
                           className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${detailsCategory === cat.id
                              ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                        >
                           <cat.icon size={18} className={detailsCategory === cat.id ? 'text-emerald-500' : 'text-gray-400'} />
                           {cat.label}
                        </button>
                     ))}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                     <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                        <div>
                           <h2 className="text-xl font-bold text-gray-900 leading-tight">
                              {detailsCategory === 'personal' && 'Personal Information'}
                              {detailsCategory === 'address' && 'Living Address'}
                              {detailsCategory === 'testimony' && 'Life Testimony'}
                              {detailsCategory === 'ministry' && 'Ministry & Discipleship'}
                              {detailsCategory === 'family' && 'Family Information'}
                              {detailsCategory === 'professional' && 'Professional & Education'}
                           </h2>
                           <p className="text-sm text-gray-500 mt-1">Manage and update specific member details</p>
                        </div>
                        {!isEditing ? (
                           <button
                              onClick={() => {
                                 setEditData(member);
                                 setIsEditing(true);
                              }}
                              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-md shadow-gray-900/10"
                           >
                              <Edit size={16} /> Edit Section
                           </button>
                        ) : (
                           <div className="flex gap-3">
                              <button
                                 onClick={() => setIsEditing(false)}
                                 className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50"
                              >
                                 Cancel
                              </button>
                              <button
                                 onClick={async () => {
                                    await onUpdate(member.id, editData);
                                    setIsEditing(false);
                                 }}
                                 className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                              >
                                 Save Changes
                              </button>
                           </div>
                        )}
                     </div>

                     <div className="animate-fadeIn">
                        {isEditing ? (
                           <div className="space-y-6">
                              {detailsCategory === 'personal' && (
                                 <PersonalAndAddress
                                    data={editData}
                                    update={(u) => setEditData({ ...editData, ...u })}
                                    show="personal"
                                 />
                              )}
                              {detailsCategory === 'address' && (
                                 <PersonalAndAddress
                                    data={editData}
                                    update={(u) => setEditData({ ...editData, ...u })}
                                    show="address"
                                 />
                              )}
                              {detailsCategory === 'testimony' && (
                                 <ReligiousAndMinistry
                                    data={editData}
                                    update={(u) => setEditData({ ...editData, ...u })}
                                    show="testimony"
                                 />
                              )}
                              {detailsCategory === 'ministry' && (
                                 <ReligiousAndMinistry
                                    data={editData}
                                    update={(u) => setEditData({ ...editData, ...u })}
                                    show="ministry"
                                 />
                              )}
                              {detailsCategory === 'family' && (
                                 <FamilyInfo
                                    data={editData}
                                    update={(u) => setEditData({ ...editData, ...u })}
                                 />
                              )}
                              {detailsCategory === 'professional' && (
                                 <ProfessionalInfo
                                    data={editData}
                                    update={(u) => setEditData({ ...editData, ...u })}
                                 />
                              )}
                           </div>
                        ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                              {detailsCategory === 'personal' && (
                                 <>
                                    <DetailItem label="First Name" value={member.firstName} />
                                    <DetailItem label="Middle Name" value={member.middleName} />
                                    <DetailItem label="Last Name" value={member.lastName} />
                                    <DetailItem label="Gender" value={member.gender} />
                                    <DetailItem label="Birth Date" value={formatDate(member.birthDate)} />
                                    <DetailItem label="Nationality" value={member.nationality} />
                                    <DetailItem label="Mobile Phone" value={member.mobilePhone} />
                                 </>
                              )}
                              {detailsCategory === 'address' && (
                                 <>
                                    <DetailItem label="Sub City" value={member.subCity} />
                                    <DetailItem label="Suburb / Area" value={member.suburb} />
                                    <DetailItem label="District" value={member.district} />
                                    <DetailItem label="House Number" value={member.houseNumber} />
                                    <DetailItem label="City" value={member.city} />
                                    <DetailItem label="Country" value={member.country} />
                                    <DetailItem label="Email" value={member.primaryEmail} />
                                 </>
                              )}
                              {detailsCategory === 'testimony' && (
                                 <>
                                    <DetailItem label="Religious Background" value={member.religiousBackground} />
                                    <DetailItem label="Date of Salvation" value={formatDate(member.dateOfSalvation)} />
                                    <DetailItem label="Baptized?" value={member.isBaptized} />
                                    <DetailItem label="Baptism Date" value={formatDate(member.baptismDate)} />
                                    <DetailItem label="Previous Church" value={member.previousChurchName} />
                                    <DetailItem label="Testimony" value={member.howDidYouCome} className="md:col-span-2" />
                                 </>
                              )}
                              {detailsCategory === 'ministry' && (
                                 <>
                                    <DetailItem label="Ministries" value={member.ministries.join(', ') || 'None'} className="md:col-span-2" />
                                    <DetailItem label="Currently in Discipleship?" value={member.currentlyInDiscipleship} />
                                    <DetailItem label="Discipleship Leader" value={member.discipleshipLeader} />
                                 </>
                              )}
                              {detailsCategory === 'family' && (
                                 <>
                                    <DetailItem label="Marital Status" value={member.maritalStatus} />
                                    <DetailItem label="Marriage Date" value={formatDate(member.marriageDate)} />
                                    <DetailItem label="Spouse Name" value={member.spouseName} />
                                    <DetailItem label="Spouse Mobile" value={member.spouseMobile} />
                                    <DetailItem label="Children" value={`${member.children.length} registered`} />
                                 </>
                              )}
                              {detailsCategory === 'professional' && (
                                 <>
                                    <DetailItem label="Professional Status" value={member.professionalStatus} />
                                    <DetailItem label="Occupation" value={member.occupation} />
                                    <DetailItem label="Primary Livelihood" value={member.primaryLivelihood} />
                                    <DetailItem label="Education History" value={`${member.educationHistory.length} records`} />
                                 </>
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'spiritual' && (
               <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900">Spiritual Journey</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <div className="flex items-center gap-2 mb-2 font-bold text-amber-800"><Cross size={18} /> Salvation</div>
                        <p className="text-sm text-gray-600">{formatDate(member.dateOfSalvation)}</p>
                     </div>
                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 mb-2 font-bold text-blue-800"><Droplets size={18} /> Baptism</div>
                        <p className="text-sm text-gray-600">{formatDate(member.baptismDate)}</p>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'family' && (
               <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900">Family Information</h2>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                     <h4 className="font-bold text-gray-900 mb-3">Marital Status</h4>
                     <p className="text-sm text-gray-600">{member.maritalStatus || 'Not recorded'}</p>
                  </div>
               </div>
            )}

         </div>

         {/* Add Note Modal */}
         {showAddNoteModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl animate-scaleIn overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                     <h3 className="font-bold text-lg text-gray-900">New Visitation Note</h3>
                     <button onClick={() => setShowAddNoteModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                     </button>
                  </div>

                  <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Title *</label>
                        <input
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                           placeholder="e.g. Home visit regarding family health"
                           value={newNote.title}
                           onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description *</label>
                        <textarea
                           className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                           rows={4}
                           placeholder="Detailed notes about the visit..."
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
                           Mark as Red Flag (Urgent attention needed)
                        </label>
                     </div>
                  </div>

                  <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                     <button
                        onClick={() => setShowAddNoteModal(false)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 font-bold"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleAddNote}
                        disabled={!newNote.title || !newNote.description}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-600/20"
                     >
                        Save Visitation Note
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};