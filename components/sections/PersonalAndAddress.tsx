import React from 'react';
import { FormData } from '../../types';
import { Input, SectionHeader, RadioGroup, Checkbox } from '../FormControls';
import { MessageCircle, Phone, Video, Send } from 'lucide-react';

interface Props {
  data: FormData;
  update: (fields: Partial<FormData>) => void;
}

export const PersonalAndAddress: React.FC<Props> = ({ data, update }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Personal Information */}
      <section>
        <SectionHeader title="Personal Information" amharicTitle="የግል መረጃ" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="First Name"
              amharicLabel="የመጀመሪያ ስም"
              value={data.firstName}
              onChange={(e) => update({ firstName: e.target.value })}
            />
            <Input
              label="Middle Name"
              amharicLabel="የአባት ስም"
              value={data.middleName}
              onChange={(e) => update({ middleName: e.target.value })}
            />
            <Input
              label="Last Name"
              amharicLabel="የአያት ስም"
              value={data.lastName}
              onChange={(e) => update({ lastName: e.target.value })}
            />
            
            <div className="md:col-span-1">
               <Input
                label="Mobile Phone"
                amharicLabel="የሞባይል ስልክ"
                value={data.mobilePhone}
                onChange={(e) => update({ mobilePhone: e.target.value })}
                placeholder="+251"
              />
            </div>
             <div className="md:col-span-2">
               <Input
                label="Nationality"
                amharicLabel="ዜግነት"
                value={data.nationality}
                onChange={(e) => update({ nationality: e.target.value })}
              />
            </div>
          </div>

          <div className="md:col-span-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
               <RadioGroup
                  label="Gender"
                  amharicLabel="ጾታ"
                  name="gender"
                  row
                  value={data.gender}
                  onChange={(val) => update({ gender: val as any })}
                  options={[
                    { label: 'Male', amharicLabel: 'ወንድ', value: 'Male' },
                    { label: 'Female', amharicLabel: 'ሴት', value: 'Female' },
                  ]}
                />
            </div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <div className="flex justify-between items-center mb-1">
                  <div>
                    <span className="block text-sm font-bold text-gray-800">Birth Date</span>
                    <span className="block text-xs text-gray-500 font-medium">የተወለዱበት ቀን</span>
                  </div>
                  <div className="flex gap-2">
                      <label className="flex items-center gap-1 text-xs cursor-pointer font-medium bg-white px-2 py-1 rounded border">
                        <input type="radio" checked={data.birthDateType === 'GC'} onChange={() => update({birthDateType: 'GC'})} /> GC
                      </label>
                      <label className="flex items-center gap-1 text-xs cursor-pointer font-medium bg-white px-2 py-1 rounded border">
                        <input type="radio" checked={data.birthDateType === 'EC'} onChange={() => update({birthDateType: 'EC'})} /> EC
                      </label>
                  </div>
                </div>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm mt-1"
                  value={data.birthDate}
                  onChange={(e) => update({ birthDate: e.target.value })}
                />
            </div>
          </div>
        </div>
      </section>

      {/* Living Address */}
      <section>
        <SectionHeader title="Living Address" amharicTitle="የመኖሪያ አድራሻ" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-4">
               <Input label="Sub City" amharicLabel="ክፍለ ከተማ" value={data.subCity} onChange={e => update({subCity: e.target.value})} />
               <Input label="Suburb" amharicLabel="ልዩ ቦታ/ሰፈር" value={data.suburb} onChange={e => update({suburb: e.target.value})} />
               <Input label="District" amharicLabel="ወረዳ" value={data.district} onChange={e => update({district: e.target.value})} />
               <Input label="House Number" amharicLabel="የቤት ቁጥር" value={data.houseNumber} onChange={e => update({houseNumber: e.target.value})} />
               <div className="grid grid-cols-2 gap-4">
                 <Input label="City" amharicLabel="ከተማ" value={data.city} onChange={e => update({city: e.target.value})} />
                 <Input label="Country" amharicLabel="ሀገር" value={data.country} onChange={e => update({country: e.target.value})} />
               </div>
            </div>

            <div className="space-y-4">
              <Input label="Extra Mobile" amharicLabel="ተጨማሪ ሞባይል" placeholder="+251" value={data.extraMobile} onChange={e => update({extraMobile: e.target.value})} />
              <Input label="Home Phone" amharicLabel="የቤት ስልክ" placeholder="+251" value={data.homePhone} onChange={e => update({homePhone: e.target.value})} />
              <Input label="Work Phone" amharicLabel="የስራ ስልክ" placeholder="+251" value={data.workPhone} onChange={e => update({workPhone: e.target.value})} />
              <Input label="Postal Address" amharicLabel="ፖስታ ሳጥን ቁጥር" value={data.postalAddress} onChange={e => update({postalAddress: e.target.value})} />
              <Input label="Primary Email" amharicLabel="1ኛ ኢሜይል" type="email" value={data.primaryEmail} onChange={e => update({primaryEmail: e.target.value})} />
              <Input label="Secondary Email" amharicLabel="2ኛ ኢሜይል" type="email" value={data.secondaryEmail} onChange={e => update({secondaryEmail: e.target.value})} />
            </div>
        </div>

        {/* Communication Channels */}
        <div className="mt-8 border-t pt-6">
           <div className="mb-4">
             <h3 className="text-sm font-bold text-gray-800">Communication Preference</h3>
             <p className="text-xs text-gray-500">የመገናኛ ዘዴ ምርጫዎ</p>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Checkbox 
                label="WhatsApp" 
                icon={<MessageCircle size={16} className="text-green-600" />}
                checked={data.socials.whatsapp} 
                onChange={(c) => update({ socials: { ...data.socials, whatsapp: c } })} 
              />
              <Checkbox 
                label="Viber" 
                icon={<Phone size={16} className="text-purple-600" />}
                checked={data.socials.viber} 
                onChange={(c) => update({ socials: { ...data.socials, viber: c } })} 
              />
              <Checkbox 
                label="Skype" 
                icon={<Video size={16} className="text-blue-500" />}
                checked={data.socials.skype} 
                onChange={(c) => update({ socials: { ...data.socials, skype: c } })} 
              />
               <Checkbox 
                label="Messenger" 
                icon={<Send size={16} className="text-blue-600" />}
                checked={data.socials.messenger} 
                onChange={(c) => update({ socials: { ...data.socials, messenger: c } })} 
              />
           </div>
        </div>
      </section>
    </div>
  );
};