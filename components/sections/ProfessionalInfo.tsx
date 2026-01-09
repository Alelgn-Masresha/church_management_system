import React from 'react';
import { FormData, EducationRecord } from '../../types';
import { Input, SectionHeader, RadioGroup } from '../FormControls';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  data: FormData;
  update: (fields: Partial<FormData>) => void;
  errors?: Record<string, string>;
}

export const ProfessionalInfo: React.FC<Props> = ({ data, update, errors = {} }) => {
  const addEducation = () => {
    const newEdu: EducationRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: '',
      level: '',
      institution: '',
      startYear: '',
      endYear: ''
    };
    update({ educationHistory: [...data.educationHistory, newEdu] });
  };

  const updateEdu = (id: string, field: keyof EducationRecord, value: any) => {
    const updated = data.educationHistory.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    );
    update({ educationHistory: updated });
  };

  const removeEdu = (id: string) => {
    update({ educationHistory: data.educationHistory.filter(e => e.id !== id) });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <section>
        <SectionHeader title="Academic Information" amharicTitle="የትምህርት መረጃ" />
        <div className="mb-4 text-xs text-gray-500 bg-gray-50 p-3 rounded border">
          <span className="font-bold mr-2 text-gray-700">Codes (ደረጃ):</span>
          1: PhD, 2: MA/MSc, 3: BA/BSc, 4: Diploma, 5: Certificate, 6: Grade 10-12, 7: Other
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="w-full min-w-[700px] divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Type of Education</span>
                  <span className="block text-xs text-gray-400">የትምህርት ዓይነት</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Level</span>
                  <span className="block text-xs text-gray-400">ደረጃ (Code)</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Institution</span>
                  <span className="block text-xs text-gray-400">የተማሩበት ተቋም</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Start Year</span>
                  <span className="block text-xs text-gray-400">የጀመሩበት</span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="block text-xs font-bold text-gray-500 uppercase">End Year</span>
                  <span className="block text-xs text-gray-400">የጨረሱበት</span>
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.educationHistory.map((edu) => (
                <tr key={edu.id}>
                  <td className="px-4 py-2">
                    <input type="text" className="w-full border-gray-300 rounded text-sm"
                      value={edu.type} onChange={e => updateEdu(edu.id, 'type', e.target.value)} />
                  </td>
                  <td className="px-4 py-2 w-24">
                    <select className="w-full border-gray-300 rounded text-sm"
                      value={edu.level} onChange={e => updateEdu(edu.id, 'level', e.target.value)}>
                      <option value="">-</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                      <option value="7">7</option>
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input type="text" className="w-full border-gray-300 rounded text-sm"
                      value={edu.institution} onChange={e => updateEdu(edu.id, 'institution', e.target.value)} />
                  </td>
                  <td className="px-4 py-2 w-24">
                    <input type="number" className="w-full border-gray-300 rounded text-sm" placeholder="YYYY"
                      value={edu.startYear} onChange={e => updateEdu(edu.id, 'startYear', e.target.value)} />
                  </td>
                  <td className="px-4 py-2 w-24">
                    <input type="number" className="w-full border-gray-300 rounded text-sm" placeholder="YYYY"
                      value={edu.endYear} onChange={e => updateEdu(edu.id, 'endYear', e.target.value)} />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => removeEdu(edu.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {data.educationHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500 italic">
                    No education records added.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button
          onClick={addEducation}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors font-medium text-sm"
        >
          <Plus size={16} /> Add Record (መረጃ ጨምር)
        </button>
      </section>

      <section>
        <SectionHeader title="Professional Status" amharicTitle="የስራ ሁኔታ" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <RadioGroup
              label="Current Status"
              amharicLabel="የአሁን ሁኔታ"
              required
              error={errors.professionalStatus}
              name="proStatus"
              value={data.professionalStatus}
              onChange={v => update({ professionalStatus: v })}
              options={[
                { label: 'Student', amharicLabel: 'ተማሪ', value: 'Student' },
                { label: 'Housewife', amharicLabel: 'የቤት እመቤት', value: 'Housewife' },
                { label: 'Professional', amharicLabel: 'ባለሙያ', value: 'Professional' },
                { label: 'Retired', amharicLabel: 'ጡረተኛ', value: 'Retired' },
                { label: 'Job Seeker', amharicLabel: 'ስራ ፈላጊ', value: 'Job Seeker' },
                { label: 'Self-Employed', amharicLabel: 'በግል', value: 'Self-Employed' },
                { label: 'Employed', amharicLabel: 'ተቀጣሪ', value: 'Employed' },
              ]}
            />
          </div>
          <div className="space-y-4">
            <Input label="Occupation" amharicLabel="የስራ መደብ" value={data.occupation} onChange={e => update({ occupation: e.target.value })} />
            <Input label="Primary Livelihood" amharicLabel="ዋና መተዳደሪያ" value={data.primaryLivelihood} onChange={e => update({ primaryLivelihood: e.target.value })} />
          </div>
        </div>
      </section>
    </div>
  );
};