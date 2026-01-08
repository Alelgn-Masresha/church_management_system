
export interface Child {
  id: string;
  fullName: string;
  gender: 'Male' | 'Female' | '';
  birthDate: string;
  isChristian: boolean;
  isMember: boolean;
  mobileNumber?: string;
}

export interface EducationRecord {
  id: string;
  type: string;
  level: string;
  institution: string;
  startYear: string;
  endYear: string;
}

export interface FormData {
  // Personal Info
  firstName: string;
  middleName: string;
  lastName: string;
  mobilePhone: string;
  nationality: string;
  gender: 'Male' | 'Female' | '';
  birthDate: string;
  birthDateType: 'GC' | 'EC';

  // Address
  subCity: string;
  suburb: string;
  district: string;
  houseNumber: string;
  city: string;
  country: string;
  extraMobile: string;
  homePhone: string;
  workPhone: string;
  postalAddress: string;
  primaryEmail: string;
  secondaryEmail: string;

  // Communication
  socials: {
    whatsapp: boolean;
    viber: boolean;
    skype: boolean;
    messenger: boolean;
  };

  // Testimony
  religiousBackground: string;
  dateOfSalvation: string;
  isBaptized: 'Yes' | 'No' | '';
  baptismDate: string;
  previousMember: 'Yes' | 'No' | '';
  previousChurchName: string;
  previousChurchPhone: string;
  previousChurchCity: string;
  previousChurchCountry: string;
  canBringLeaveLetter: 'Yes' | 'No' | 'I Did' | '';
  reasonForNoLetter: string;
  howDidYouCome: string;

  // Ministry
  ministries: string[];
  currentlyInDiscipleship: 'Yes' | 'No' | '';
  discipleshipLeader: string;

  // Marriage
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Spouse Deceased' | '';
  marriageDate: string;
  spouseName: string;
  spouseMobile: string;
  isSpouseChristian: 'Yes' | 'No' | '';
  isSpouseMember: 'Yes' | 'No' | '';
  spouseChurch: string;

  // Children
  children: Child[];

  // Professional / Education
  educationHistory: EducationRecord[];
  professionalStatus: string;
  occupation: string;
  primaryLivelihood: string;
}

export const INITIAL_DATA: FormData = {
  firstName: '', middleName: '', lastName: '', mobilePhone: '+251 ', nationality: 'Ethiopian',
  gender: '', birthDate: '', birthDateType: 'GC',
  subCity: '', suburb: '', district: '', houseNumber: '', city: 'Addis Ababa', country: 'Ethiopia',
  extraMobile: '+251 ', homePhone: '', workPhone: '', postalAddress: '', primaryEmail: '', secondaryEmail: '',
  socials: { whatsapp: false, viber: false, skype: false, messenger: false },
  religiousBackground: '', dateOfSalvation: '', isBaptized: '', baptismDate: '',
  previousMember: '', previousChurchName: '', previousChurchPhone: '', previousChurchCity: '', previousChurchCountry: '',
  canBringLeaveLetter: '', reasonForNoLetter: '', howDidYouCome: '',
  ministries: [], currentlyInDiscipleship: '', discipleshipLeader: '',
  maritalStatus: '', marriageDate: '', spouseName: '', spouseMobile: '', isSpouseChristian: '', isSpouseMember: '', spouseChurch: '',
  children: [],
  educationHistory: [], professionalStatus: '', occupation: '', primaryLivelihood: ''
};

// --- Management Extended Types ---

export type MemberRole = 'Member' | 'Leader' | 'Admin' | 'Pastor' | 'Counsel';
export type MemberStatus = 'Active' | 'Transferred' | 'Inactive';

export interface TransferDetails {
  transferredToChurch: string;
  transferDate: string;
  reason: string;
  status: 'Pending' | 'Completed';
}

export interface Member extends FormData {
  id: string;
  memberId?: string; // e.g. "2024001"
  photoUrl?: string;
  role: MemberRole;
  status: MemberStatus;
  registrationDate: string;
  transferDetails?: TransferDetails;
  assignedGroupId?: string; // Link to HBS Group
  participationScore?: number; // 0-100
  isRedFlagged?: boolean;
  pastoralNotes?: PastoralNote[];
  assignedCounselId?: string;
}

// --- Pastoral Notes Types ---
export type NoteType = 'visitation' | 'phone' | 'counseling' | 'redFlag' | 'followUp' | 'question';
export type NoteLocationType = 'Home Visit' | 'Church Office' | 'Phone Call' | 'Hospital' | 'Other';

export interface PastoralNote {
  id: string;
  date: string;
  type: NoteType;
  title: string;
  category: string;
  description: string;
  loggedBy: string;
  location: NoteLocationType;
  isRedFlag?: boolean;
  status?: 'new' | 'read' | 'replied' | 'answered'; // To track questions
}

// --- HBS Types ---

export interface HBSMember {
  id: string;
  fullName: string;
  mobilePhone: string;
  role: 'Member' | 'Leader' | 'Assistant';
}

export interface Zone {
  id: string;
  name: string;
  area: string;
}

export interface HBSGroup {
  id: string;
  name: string;
  zoneId: string;
  location: string;
  leaderId: string;
  meetingDay: string;
  meetingTime?: string; // e.g. "18:00"
  status?: 'Active' | 'Planning';
}

export interface HBSSession {
  id: string;
  groupId: string;
  sessionDate: string;
  topic: string;
  discussionLeaderId: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  attendance: Record<string, boolean>; // memberId -> isPresent
}
