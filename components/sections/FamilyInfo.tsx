import React from 'react';
import { FormData, Child } from '../../types';
import { Input, SectionHeader, RadioGroup, Select } from '../FormControls';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  data: FormData;
  update: (fields: Partial<FormData>) => void;
}

export const FamilyInfo: React.FC<Props> = ({ data, update }) => {
  const addChild = () => {
    const newChild: Child = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: '',
      gender: '',
      birthDate: '',
      isChristian: false,
      isMember: false,
      mobileNumber: ''
    };
    update({ children: [...data.children, newChild] });
  };

  const updateChild = (id: string, field: keyof Child, value: any) => {
    const updatedChildren = data.children.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    update({ children: updatedChildren });
  };

  const removeChild = (id: string) => {
    update({ children: data.children.filter(c => c.id !== id) });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <section>
        <SectionHeader title="Marriage Information" amharicTitle="የጋብቻ መረጃ" />
        <div className="mb-6">
          <RadioGroup
            label="Marital Status"
            amharicLabel="የጋብቻ ሁኔታ"
            name="maritalStatus"
            row
            value={data.maritalStatus}
            onChange={(val) => update({ maritalStatus: val as any })}
            options={[
              { label: 'Single', amharicLabel: 'ያላገባ/ች', value: 'Single' },
              { label: 'Married', amharicLabel: 'ያገባ/ች', value: 'Married' },
              { label: 'Divorced', amharicLabel: 'የተፋታ/ች', value: 'Divorced' },
              { label: 'Spouse Deceased', amharicLabel: 'ባለቤቱ/ቷ ያረፈበት/ባት', value: 'Spouse Deceased' },
            ]}
          />
        </div>

        {data.maritalStatus === 'Married' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-slideDown">
             <Input 
               label="Date of Marriage" 
               amharicLabel="ጋብቻ የተፈጸመበት ቀን"
               type="date" 
               value={data.marriageDate} 
               onChange={e => update({marriageDate: e.target.value})} 
             />
             <Input 
               label="Spouse's Full Name" 
               amharicLabel="የባለቤት ሙሉ ስም"
               value={data.spouseName} 
               onChange={e => update({spouseName: e.target.value})} 
             />
             <Input 
               label="Spouse's Mobile No." 
               amharicLabel="የባለቤት ሞባይል ቁጥር"
               value={data.spouseMobile} 
               onChange={e => update({spouseMobile: e.target.value})} 
             />
             
             <div className="space-y-4">
               <RadioGroup
                  label="Is your spouse a Christian?"
                  amharicLabel="ባለቤትዎ ክርስቲያን ነው/ናት?"
                  name="spouseChristian"
                  row
                  value={data.isSpouseChristian}
                  onChange={v => update({isSpouseChristian: v as any})}
                  options={[
                    {label: 'Yes (አዎ)', value: 'Yes'}, 
                    {label: 'No (አይደለም)', value: 'No'}
                  ]}
               />
               <RadioGroup
                  label="Is your spouse a member of this church?"
                  amharicLabel="ባለቤትዎ የዚህ ቤተክርስቲያን አባል ነው/ናት?"
                  name="spouseMember"
                  row
                  value={data.isSpouseMember}
                  onChange={v => update({isSpouseMember: v as any})}
                  options={[
                    {label: 'Yes (አዎ)', value: 'Yes'}, 
                    {label: 'No (አይደለም)', value: 'No'}
                  ]}
               />
             </div>
             
             {data.isSpouseMember === 'No' && (
               <div className="md:col-span-2">
                 <Input 
                   label="Spouse's Church" 
                   amharicLabel="ካልሆነ የት ቤተክርስቲያን ነው/ናት?"
                   value={data.spouseChurch} 
                   onChange={e => update({spouseChurch: e.target.value})} 
                 />
               </div>
             )}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Children Information" amharicTitle="ልጆች" />
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="w-full min-w-[800px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Full Name</span>
                  <span className="block text-xs text-gray-400">ሙሉ ስም</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Gender</span>
                  <span className="block text-xs text-gray-400">ጾታ</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Birth Date</span>
                  <span className="block text-xs text-gray-400">የልደት ቀን</span>
                </th>
                <th className="px-4 py-3 text-center">
                   <span className="block text-xs font-bold text-gray-500 uppercase">Christian?</span>
                   <span className="block text-xs text-gray-400">አማኝ?</span>
                </th>
                <th className="px-4 py-3 text-center">
                   <span className="block text-xs font-bold text-gray-500 uppercase">Member?</span>
                   <span className="block text-xs text-gray-400">አባል?</span>
                </th>
                <th className="px-4 py-3 text-left">
                   <span className="block text-xs font-bold text-gray-500 uppercase">Mobile Info</span>
                   <span className="block text-xs text-gray-400">ሞባይል</span>
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.children.map((child, index) => (
                <tr key={child.id}>
                  <td className="px-4 py-2">
                    <input 
                      type="text" 
                      className="w-full border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500" 
                      placeholder="Name"
                      value={child.fullName}
                      onChange={e => updateChild(child.id, 'fullName', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select 
                      className="w-full border-gray-300 rounded text-sm"
                      value={child.gender}
                      onChange={e => updateChild(child.id, 'gender', e.target.value)}
                    >
                      <option value="">-</option>
                      <option value="Male">M</option>
                      <option value="Female">F</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input 
                      type="date" 
                      className="w-full border-gray-300 rounded text-sm"
                      value={child.birthDate}
                      onChange={e => updateChild(child.id, 'birthDate', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={child.isChristian}
                      onChange={e => updateChild(child.id, 'isChristian', e.target.checked)}
                    />
                  </td>
                   <td className="px-4 py-2 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={child.isMember}
                      onChange={e => updateChild(child.id, 'isMember', e.target.checked)}
                    />
                  </td>
                  <td className="px-4 py-2">
                     <input 
                      type="text" 
                      className="w-full border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500" 
                      placeholder="Optional"
                      value={child.mobileNumber}
                      onChange={e => updateChild(child.id, 'mobileNumber', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button 
                      onClick={() => removeChild(child.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {data.children.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">
                    No children added yet. (ልጆች ካሉዎት 'Add Child' የሚለውን ይጫኑ)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button 
          onClick={addChild}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors font-medium text-sm"
        >
          <Plus size={16} /> Add Child (ልጅ ጨምር)
        </button>
      </section>
    </div>
  );
};