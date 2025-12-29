
import React, { useState, useMemo } from 'react';
import { Member } from '../../types';
import { Search, UserCheck, Shield, Users, ChevronLeft, ChevronRight, CheckCircle2, Trash2, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface Props {
    members: Member[];
    onAssignCounsels: (memberIds: string[], targetCounselId: string | null) => void;
    onRemoveMember: (memberId: string, isCounselRole: boolean) => void;
    onReplaceMember: (oldId: string, newId: string, successorId?: string) => void;
    onSwapMembers: (id1: string, id2: string) => void;
}

const ITEMS_PER_PAGE = 10;

export const AssignCounsels: React.FC<Props> = ({ members, onAssignCounsels, onRemoveMember, onReplaceMember, onSwapMembers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [activeCounselId, setActiveCounselId] = useState<string | null>(null);
    const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
    const [memberToReplace, setMemberToReplace] = useState<Member | null>(null);
    const [replacementSearch, setReplacementSearch] = useState('');
    const [selectedReplacement, setSelectedReplacement] = useState<Member | null>(null);
    const [successorSearch, setSuccessorSearch] = useState('');
    const [selectedSuccessor, setSelectedSuccessor] = useState<Member | null>(null);

    const activeCounsel = useMemo(() =>
        members.find(m => m.id === activeCounselId),
        [members, activeCounselId]);

    // Filtering
    const filteredMembers = useMemo(() => {
        return members.filter(m => {
            const search = searchTerm.toLowerCase();
            const fullName = `${m.firstName} ${m.middleName} ${m.lastName}`.toLowerCase();
            return fullName.includes(search) || m.mobilePhone.includes(searchTerm);
        });
    }, [members, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
    const paginatedMembers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMembers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredMembers, currentPage]);

    const currentlyAssignedCount = useMemo(() => {
        if (activeCounselId) {
            return members.filter(m => m.assignedCounselId === activeCounselId).length;
        }
        return members.filter(m => m.role === 'Counsel').length;
    }, [members, activeCounselId]);

    const totalAfterAssignment = currentlyAssignedCount + selectedIds.length;
    const isReadyToAssign = totalAfterAssignment <= 9 && selectedIds.length > 0;

    const toggleMember = (id: string) => {
        const availableSlots = 9 - currentlyAssignedCount;
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(i => i !== id);
            }
            if (prev.length >= availableSlots) {
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleAssign = () => {
        if (isReadyToAssign) {
            onAssignCounsels(selectedIds, activeCounselId);
            setSelectedIds([]);
            if (activeCounsel) {
                alert(`Successfully updated ${activeCounsel.firstName}'s group.`);
            } else {
                alert("Successfully updated Pastor Solomon's team.");
            }
        }
    };

    const handleRemove = (e: React.MouseEvent, member: Member) => {
        e.stopPropagation();
        setMemberToRemove(member);
    };

    const confirmRemove = () => {
        if (memberToRemove) {
            onRemoveMember(memberToRemove.id, !activeCounselId);
            setMemberToRemove(null);
        }
    };

    const navigateToAssignment = (member: Member) => {
        // Find if this person HAS subordinates (making them a leader)
        const hasSubordinates = members.some(m => m.assignedCounselId === member.id);

        if (hasSubordinates) {
            // Dive into their group
            setActiveCounselId(member.id);
            setSelectedIds([]);
        } else if (member.assignedCounselId) {
            // Go to their leader's group
            setActiveCounselId(member.assignedCounselId);
            setSelectedIds([]);
        }
    };

    const selectedMembers = members.filter(m => selectedIds.includes(m.id));

    const isReplacementALeader = useMemo(() => {
        if (!selectedReplacement) return false;
        return members.some(m => m.assignedCounselId === selectedReplacement.id);
    }, [selectedReplacement, members]);

    const needsSuccessor = useMemo(() => {
        if (!selectedReplacement || !memberToReplace) return false;

        // If the person moving INTO the new spot is currently leading ANYONE, 
        // they need a successor for their old team.
        return isReplacementALeader || selectedReplacement.role === 'Counsel';
    }, [selectedReplacement, memberToReplace, isReplacementALeader]);

    // Global Stats
    const totalAssigned = useMemo(() =>
        members.filter(m => !!m.assignedCounselId || m.role === 'Counsel').length,
        [members]);
    const assignmentPercentage = Math.round((totalAssigned / members.length) * 100);

    const filteredReplacementMembers = useMemo(() => {
        if (!replacementSearch || !memberToReplace) return [];
        const search = replacementSearch.toLowerCase();
        return members.filter(m => {
            if (m.id === memberToReplace.id) return false;
            return `${m.firstName} ${m.lastName}`.toLowerCase().includes(search) || m.mobilePhone.includes(search);
        });
    }, [members, replacementSearch, memberToReplace]);

    const filteredSuccessorMembers = useMemo(() => {
        if (!successorSearch || !selectedReplacement) return [];
        const search = successorSearch.toLowerCase();
        return members.filter(m => {
            if (m.id === memberToReplace?.id || m.id === selectedReplacement?.id) return false;
            if (!!m.assignedCounselId || m.role === 'Counsel') return false; // Only unassigned
            return `${m.firstName} ${m.lastName}`.toLowerCase().includes(search);
        });
    }, [members, successorSearch, selectedReplacement, memberToReplace]);

    const closeModal = () => {
        setMemberToReplace(null);
        setReplacementSearch('');
        setSelectedReplacement(null);
        setSuccessorSearch('');
        setSelectedSuccessor(null);
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {activeCounsel && (
                        <button
                            onClick={() => {
                                setActiveCounselId(null);
                                setSelectedIds([]);
                            }}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                            title="Back to Pastor's Team"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {activeCounsel ? `${activeCounsel.firstName} ${activeCounsel.lastName}'s Group` : "Pastor Solomon's Team"}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            {activeCounsel
                                ? "Assign members for follow-up under this counsel's care."
                                : "Members assigned to follow-up under Pastor Solomon's supervision."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${isReadyToAssign ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        <Users size={16} />
                        Total: {totalAfterAssignment} / 9
                    </div>
                    <button
                        onClick={handleAssign}
                        disabled={!isReadyToAssign}
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2
                          ${isReadyToAssign
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                        `}
                    >
                        <UserCheck size={18} />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main List Area */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or phone number..."
                                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-400"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Member Name</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Phone</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Counselor</th>
                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedMembers.map(member => {
                                        const isSelected = selectedIds.includes(member.id);
                                        const name = `${member.firstName} ${member.middleName} ${member.lastName}`;

                                        // Find counselor name
                                        const counselor = member.assignedCounselId
                                            ? members.find(m => m.id === member.assignedCounselId)
                                            : null;
                                        const counselorName = counselor
                                            ? `${counselor.firstName} ${counselor.lastName}`
                                            : null;

                                        return (
                                            <tr
                                                key={member.id}
                                                onClick={() => navigateToAssignment(member)}
                                                className={`hover:bg-slate-50 transition-colors cursor-pointer group/row ${isSelected ? 'bg-blue-50/50' : ''}`}
                                            >
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-900 text-sm group-hover/row:text-blue-600 transition-colors">{name}</p>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 text-sm">
                                                    {member.mobilePhone}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {member.role === 'Counsel' ? (
                                                        <span className="flex items-center gap-1.5 text-purple-600 font-medium text-xs">
                                                            <Shield size={12} />
                                                            Pastor Solomon
                                                        </span>
                                                    ) : counselorName ? (
                                                        <span className="flex items-center gap-1.5 text-blue-600 font-medium text-xs">
                                                            <UserCheck size={12} />
                                                            {counselorName}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-xs">Not Assigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => toggleMember(member.id)}
                                                        disabled={!isSelected && (totalAfterAssignment >= 9 || member.role === 'Counsel' || !!member.assignedCounselId)}
                                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all
                                                          ${isSelected
                                                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                                : (totalAfterAssignment >= 9 || member.role === 'Counsel' || !!member.assignedCounselId)
                                                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white'}
                                                        `}
                                                    >
                                                        {isSelected ? 'Deselect' : 'Select'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {paginatedMembers.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                                                No members found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <p className="text-xs text-slate-500">
                                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredMembers.length)} of {filteredMembers.length}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1 rounded hover:bg-white border border-slate-200 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1 rounded hover:bg-white border border-slate-200 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected / Assigned Panel */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 h-full min-h-[400px]">
                        {selectedIds.length > 0 ? (
                            <>
                                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 underline decoration-blue-500 underline-offset-4">
                                    <CheckCircle2 size={18} className="text-blue-600" />
                                    Selecting for {activeCounsel ? 'Follow-up' : 'Assignment'}
                                </h3>
                                <div className="space-y-3">
                                    {selectedMembers.map(member => (
                                        <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg group hover:bg-blue-50 transition-colors">
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{member.firstName} {member.lastName}</p>
                                                <p className="text-[10px] text-slate-500">{member.mobilePhone}</p>
                                            </div>
                                            <button
                                                onClick={() => toggleMember(member.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors"
                                                title="Remove"
                                            >
                                                <CheckCircle2 size={16} className="text-blue-600 fill-blue-600/10 group-hover:text-red-500 group-hover:fill-red-500/10" />
                                            </button>
                                        </div>
                                    ))}

                                    {totalAfterAssignment < 9 && (
                                        <div className="p-8 border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-center">Max of 9 (Available: {9 - totalAfterAssignment})</p>
                                        </div>
                                    )}
                                </div>

                                {totalAfterAssignment === 9 && (
                                    <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-lg">
                                        <p className="text-xs text-amber-700 font-medium italic">Group is full (Maximum of 9 members reached).</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex gap-4 h-full min-h-[400px]">
                                {/* Left Hierarchy Vertical Column */}
                                <div className="shrink-0 pt-4 relative pr-2 border-r border-slate-50 w-24">
                                    {/* Hierarchy Line */}
                                    <div className="absolute left-2.5 top-6 bottom-6 w-0.5 bg-slate-100" />

                                    <div className="space-y-12 relative z-10 w-full">
                                        {/* Pastor Level Node */}
                                        <div
                                            onClick={() => {
                                                setActiveCounselId(null);
                                                setSelectedIds([]);
                                            }}
                                            className={`flex flex-col items-center gap-1 cursor-pointer group transition-all
                                                 ${!activeCounselId ? 'opacity-100' : 'opacity-40 hover:opacity-100'}
                                             `}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all bg-white
                                                 ${!activeCounselId ? 'border-purple-500 ring-4 ring-purple-100 shadow-sm shadow-purple-200' : 'border-slate-300 group-hover:border-purple-400'}
                                             `}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${!activeCounselId ? 'bg-purple-500' : 'bg-slate-300 group-hover:bg-purple-400'}`} />
                                            </div>
                                            <span className={`text-[9px] font-bold text-center leading-tight ${!activeCounselId ? 'text-purple-700' : 'text-slate-400 group-hover:text-purple-600'}`}>Pastor</span>
                                        </div>

                                        {/* Path Nodes */}
                                        {(() => {
                                            const path: Member[] = [];
                                            let current = activeCounsel;
                                            let depth = 0;
                                            while (current && depth < 10) { // Safety limit to prevent infinite loops
                                                path.unshift(current);
                                                current = members.find(m => m.id === current?.assignedCounselId);
                                                depth++;
                                            }
                                            return path.map((member, idx) => {
                                                const isLast = idx === path.length - 1;
                                                return (
                                                    <div
                                                        key={member.id}
                                                        onClick={() => {
                                                            if (!isLast) {
                                                                setActiveCounselId(member.id);
                                                                setSelectedIds([]);
                                                            }
                                                        }}
                                                        className={`flex flex-col items-center gap-1 transition-all
                                                             ${isLast ? 'opacity-100' : 'opacity-40 hover:opacity-100 cursor-pointer group'}
                                                         `}
                                                    >
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all bg-white
                                                             ${isLast ? 'border-blue-500 ring-4 ring-blue-100 shadow-sm shadow-blue-200' : 'border-slate-300 group-hover:border-blue-400'}
                                                         `}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isLast ? 'bg-blue-500' : 'bg-slate-300 group-hover:bg-blue-400'}`} />
                                                        </div>
                                                        <span className={`text-[9px] font-bold text-center leading-tight truncate w-full px-1 ${isLast ? 'text-blue-700' : 'text-slate-400 group-hover:text-blue-600'}`}>
                                                            {member.firstName}
                                                        </span>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>

                                {/* Right Content Area */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-4">
                                        {activeCounsel && (
                                            <button
                                                onClick={() => {
                                                    setActiveCounselId(activeCounsel.assignedCounselId || null);
                                                    setSelectedIds([]);
                                                }}
                                                className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-600"
                                                title={activeCounsel.assignedCounselId ? "Back to parent" : "Back to Pastor Solomon"}
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                        )}
                                        <h3 className="font-bold text-slate-900 flex items-center gap-2 underline decoration-purple-500 underline-offset-4 truncate">
                                            <Shield size={18} className="text-purple-600 shrink-0" />
                                            {activeCounsel ? `Assigned to ${activeCounsel.firstName} ${activeCounsel.lastName}` : "Assigned to Pastor Solomon"}
                                        </h3>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mb-4 italic text-center">
                                        {activeCounsel
                                            ? `Click another counsel to switch, or use the hierarchy markers on the left.`
                                            : "Click a counsel to assign members to them for follow-up."}
                                    </p>

                                    <div className="space-y-3">
                                        {(activeCounselId
                                            ? members.filter(m => m.assignedCounselId === activeCounselId)
                                            : members.filter(m => m.role === 'Counsel' || (!m.assignedCounselId && members.some(sub => sub.assignedCounselId === m.id)))).length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 space-y-3 text-center">
                                                <Users size={40} className="opacity-20" />
                                                <p className="text-xs px-4 italic">
                                                    {activeCounselId
                                                        ? `No members have been assigned to ${activeCounsel?.firstName} yet.`
                                                        : "No members have been assigned as counsels yet."}
                                                </p>
                                            </div>
                                        ) : (
                                            (activeCounselId
                                                ? members.filter(m => m.assignedCounselId === activeCounselId)
                                                : members.filter(m => m.role === 'Counsel' || (!m.assignedCounselId && members.some(sub => sub.assignedCounselId === m.id)))).map(member => (
                                                    <div
                                                        key={member.id}
                                                        onClick={() => {
                                                            if (activeCounselId !== member.id) {
                                                                setActiveCounselId(member.id);
                                                                setSelectedIds([]);
                                                            }
                                                        }}
                                                        className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer
                                                        ${activeCounselId === member.id
                                                                ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-500 ring-offset-2 shadow-md'
                                                                : activeCounselId
                                                                    ? 'bg-blue-50 border-blue-100 hover:bg-blue-100 hover:border-blue-200'
                                                                    : 'bg-purple-50 border-purple-100 hover:bg-purple-100 hover:border-purple-200'}
                                                    `}
                                                    >
                                                        <div className="min-w-0 flex-1 pr-2">
                                                            <p className="text-xs font-bold text-slate-800 truncate">{member.firstName} {member.lastName}</p>
                                                            <p className="text-[10px] text-slate-500 truncate">{member.mobilePhone}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    closeModal();
                                                                    setMemberToReplace(member);
                                                                }}
                                                                className="p-1.5 hover:bg-white/50 rounded-md text-slate-400 hover:text-blue-500 transition-colors"
                                                                title="Replace or Swap Position"
                                                            >
                                                                <RefreshCw size={14} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleRemove(e, member)}
                                                                className="p-1.5 hover:bg-white/50 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                                                                title="Remove Assignment"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                        )}

                                        {/* Empty Slots */}
                                        {currentlyAssignedCount < 9 && Array.from({ length: 9 - currentlyAssignedCount }).map((_, i) => (
                                            <div key={`empty-${i}`} className="p-3 border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center text-slate-200">
                                                <p className="text-[10px] font-bold uppercase tracking-widest">Empty Slot</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Remove Confirmation Modal */}
            {memberToRemove && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMemberToRemove(null)} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-scaleIn">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-50 rounded-xl text-red-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Removal</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Are you sure you want to remove <span className="font-bold text-slate-800">{memberToRemove.firstName} {memberToRemove.lastName}</span> from {activeCounselId ? `${activeCounsel?.firstName}'s group` : 'being a Counselor'}?
                                    </p>
                                </div>
                                <button
                                    onClick={() => setMemberToRemove(null)}
                                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 flex gap-3 justify-end">
                            <button
                                onClick={() => setMemberToRemove(null)}
                                className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmRemove}
                                className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 active:scale-95"
                            >
                                Confirm Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Replace / Swap Modal */}
            {memberToReplace && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-scaleIn">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <RefreshCw size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Replace or Swap Position</h3>
                                    <p className="text-xs text-slate-500">Managing <span className="font-bold text-slate-900">{memberToReplace.firstName} {memberToReplace.lastName}</span></p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search for a replacement member..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={replacementSearch}
                                    onChange={(e) => setReplacementSearch(e.target.value)}
                                />
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                                {filteredReplacementMembers.map(member => (
                                    <div
                                        key={member.id}
                                        onClick={() => setSelectedReplacement(member)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between
                                            ${selectedReplacement?.id === member.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500' : 'bg-white border-slate-100 hover:border-slate-300'}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                                                {member.firstName[0]}{member.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{member.firstName} {member.lastName}</p>
                                                <p className="text-[10px] text-slate-500">{member.mobilePhone}</p>
                                            </div>
                                        </div>
                                        {selectedReplacement?.id === member.id && <CheckCircle2 size={16} className="text-blue-600" />}
                                    </div>
                                ))}
                                {replacementSearch && filteredReplacementMembers.length === 0 && (
                                    <p className="text-center py-8 text-xs text-slate-400 italic">No members found matching your search.</p>
                                )}
                                {!replacementSearch && (
                                    <p className="text-center py-8 text-xs text-slate-400 italic">Type a name to search for a replacement.</p>
                                )}
                            </div>

                            {needsSuccessor && (
                                <div className="space-y-3 p-4 bg-amber-50/50 border border-amber-200 rounded-2xl">
                                    <div className="flex gap-3">
                                        <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                                        <div className="text-xs text-amber-800 leading-relaxed">
                                            <p className="font-bold mb-1">Leadership Hand-off Required</p>
                                            <p>
                                                <span className="font-bold">{selectedReplacement?.firstName}</span> is currently a leader.
                                                Select someone to take over their current group before moving them to this new position.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder={`Who will replace ${selectedReplacement?.firstName}?`}
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-amber-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                            value={successorSearch}
                                            onChange={(e) => setSuccessorSearch(e.target.value)}
                                        />
                                    </div>

                                    <div className="max-h-32 overflow-y-auto space-y-1 px-1">
                                        {filteredSuccessorMembers.map(member => (
                                            <div
                                                key={member.id}
                                                onClick={() => setSelectedSuccessor(member)}
                                                className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between
                                                    ${selectedSuccessor?.id === member.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-300'}
                                                `}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                                        {member.firstName[0]}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-900">{member.firstName} {member.lastName}</span>
                                                </div>
                                                {selectedSuccessor?.id === member.id && <CheckCircle2 size={12} className="text-blue-600" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 flex items-center gap-3 justify-end">
                            <button
                                onClick={() => {
                                    if (selectedReplacement) {
                                        onSwapMembers(memberToReplace.id, selectedReplacement.id);
                                        closeModal();
                                    }
                                }}
                                disabled={!selectedReplacement || (needsSuccessor && !selectedSuccessor)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                                    ${selectedReplacement && (!needsSuccessor || selectedSuccessor)
                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                                `}
                            >
                                <RefreshCw size={16} className={selectedReplacement && (!needsSuccessor || selectedSuccessor) ? 'animate-[spin_3s_linear_infinite]' : ''} />
                                Swap Position
                            </button>
                            <button
                                onClick={() => {
                                    if (selectedReplacement) {
                                        onReplaceMember(memberToReplace.id, selectedReplacement.id, selectedSuccessor?.id);
                                        closeModal();
                                    }
                                }}
                                disabled={!selectedReplacement || (needsSuccessor && !selectedSuccessor)}
                                className={`px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                                    ${selectedReplacement && (!needsSuccessor || selectedSuccessor)
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                                        : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                                `}
                            >
                                <UserCheck size={16} />
                                {needsSuccessor ? 'Replace & Transfer Team' : 'Replace Member'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Assignment Stats Bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-slate-200 p-4 shadow-lg z-30 transition-all">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 px-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Assignment Coverage</p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{totalAssigned}</span>
                                <span className="text-xs text-slate-400">out of</span>
                                <span className="text-sm font-bold text-slate-900">{members.length} members</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md w-full px-4">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Progress</span>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{assignmentPercentage}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                style={{ width: `${assignmentPercentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unassigned</p>
                            <p className="text-sm font-bold text-red-500">{members.length - totalAssigned}</p>
                        </div>
                        <div className="h-8 w-px bg-slate-100" />
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Level Coverage</p>
                            <p className="text-sm font-bold text-green-600">Active</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
