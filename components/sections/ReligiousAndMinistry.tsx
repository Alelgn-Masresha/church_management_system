import React from 'react';
import { FormData } from '../../types';
import { Input, SectionHeader, RadioGroup, Select } from '../FormControls';

interface Props {
  data: FormData;
  update: (fields: Partial<FormData>) => void;
}

export const ReligiousAndMinistry: React.FC<Props> = ({ data, update }) => {
  const toggleMinistry = (ministry: string) => {
    if (data.ministries.includes(ministry)) {
      update({ ministries: data.ministries.filter(m => m !== ministry) });
    } else {
      update({ ministries: [...data.ministries, ministry] });
    }
  };

  const ministriesList = [
    { en: 'Pastoral Care', am: 'የምክር አገልግሎት' },
    { en: 'Teaching Ministry', am: 'የማስተማር አገልግሎት' },
    { en: 'Kids Ministry', am: 'የህጻናት አገልግሎት' },
    { en: 'Youth Ministry', am: 'የወጣቶች አገልግሎት' },
    { en: 'Prayer Ministry', am: 'የጸሎት አገልግሎት' },
    { en: 'Worship Ministry', am: 'የአምልኮ አገልግሎት' },
    { en: 'Evangelism', am: 'ወንጌል ስርጭት' },
    { en: 'Missions', am: 'ሚሽን' },
    { en: 'Charity/Mercy', am: 'የበጎ አድራጎት' },
    { en: 'Audiovisual', am: 'ኦዲዮ ቪዥዋል' },
    { en: 'Technical', am: 'ቴክኒካል' },
    { en: 'Ushering', am: 'አስተናጋጅ' },
    { en: 'Development & Planning', am: 'ልማት እና ፕላን' },
    { en: 'Counseling', am: 'የምክር አገልግሎት' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Life Testimony */}
      <section>
        <SectionHeader title="Life Testimony" amharicTitle="የህይወት ምስክርነት" />
        
        <div className="mb-6">
          <RadioGroup
            label="What is your religious background?"
            amharicLabel="ከዚህ ቀደም በሌላ እምነት ውስጥ ከነበሩ ይጠቀስ?"
            name="religiousBackground"
            value={data.religiousBackground}
            onChange={(val) => update({ religiousBackground: val })}
            options={[
              { label: 'Orthodox Christianity', amharicLabel: 'ኦርቶዶክስ ተዋህዶ', value: 'Orthodox' },
              { label: 'Islam', amharicLabel: 'እስልምና', value: 'Islam' },
              { label: 'Catholic', amharicLabel: 'ካቶሊክ', value: 'Catholic' },
              { label: 'Only Jesus', amharicLabel: 'ሐዋርያት (Only Jesus)', value: 'OnlyJesus' },
              { label: 'Jehovah Witness', amharicLabel: 'ጆሆቫ ምስክር', value: 'JehovahWitness' },
              { label: 'Cultural Belief', amharicLabel: 'ባህላዊ እምነት', value: 'Cultural' },
              { label: 'Others', amharicLabel: 'ሌሎች', value: 'Others' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Input 
            label="Date of Salvation" 
            amharicLabel="ጌታን የተቀበሉበት ቀን"
            type="date" 
            value={data.dateOfSalvation} 
            onChange={e => update({ dateOfSalvation: e.target.value })} 
          />
          <div className="grid grid-cols-2 gap-4">
             <Select
                label="Have you been baptized before?"
                amharicLabel="የውሃ ጥምቀት ወስደዋል?"
                value={data.isBaptized}
                onChange={e => update({ isBaptized: e.target.value as any })}
                options={[{label: 'Yes (አዎ)', value: 'Yes'}, {label: 'No (አይደለም)', value: 'No'}]}
             />
             {data.isBaptized === 'Yes' && (
               <Input 
                 label="Date of Baptism"
                 amharicLabel="የውሃ ጥምቀት የወሰዱበት ቀን" 
                 type="date"
                 value={data.baptismDate}
                 onChange={e => update({ baptismDate: e.target.value })}
               />
             )}
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg space-y-4 shadow-sm">
           <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Previous Church History <span className="text-xs font-normal text-gray-500 ml-2">ያለፈው የቤተክርስቲያን ታሪክ</span></h3>
           <Select
              label="Were you a member of another church previously?"
              amharicLabel="ከዚህ ቀደም በሌላ ቤተክርስቲያን አባል ነበሩ?"
              value={data.previousMember}
              onChange={e => update({ previousMember: e.target.value as any })}
              options={[{label: 'Yes (አዎ)', value: 'Yes'}, {label: 'No (አይደለም)', value: 'No'}]}
           />
           
           {data.previousMember === 'Yes' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                <Input label="Church Name" amharicLabel="የቤተክርስቲያቱ ስም" value={data.previousChurchName} onChange={e => update({previousChurchName: e.target.value})} />
                <Input label="Phone Number" amharicLabel="ስልክ ቁጥር" value={data.previousChurchPhone} onChange={e => update({previousChurchPhone: e.target.value})} />
                <Input label="City" amharicLabel="ከተማ" value={data.previousChurchCity} onChange={e => update({previousChurchCity: e.target.value})} />
                <Input label="Country" amharicLabel="ሀገር" value={data.previousChurchCountry} onChange={e => update({previousChurchCountry: e.target.value})} />
                
                <div className="md:col-span-2 mt-2">
                   <div className="mb-2">
                      <span className="block text-sm font-bold text-gray-800">Can you bring a leave letter from your previous church?</span>
                      <span className="block text-xs text-gray-500">ከዚህ ቀደም አባል ከነበሩበት ቤተክርስቲያን የመልቀቂያ ደብዳቤ ማምጣት ይችላሉ?</span>
                   </div>
                   <div className="flex gap-4 flex-wrap">
                      {[
                        {val: 'Yes', label: 'Yes (አዎ)'},
                        {val: 'No', label: 'No (አልችልም)'},
                        {val: 'I Did', label: 'I Did (አምጥቻለሁ)'}
                      ].map(opt => (
                        <label key={opt.val} className="flex items-center space-x-2">
                          <input type="radio" name="leaveLetter" value={opt.val} checked={data.canBringLeaveLetter === opt.val} onChange={e => update({canBringLeaveLetter: e.target.value as any})} />
                          <span className="text-sm font-medium">{opt.label}</span>
                        </label>
                      ))}
                   </div>
                   {data.canBringLeaveLetter === 'No' && (
                     <Input 
                      label="Reason" 
                      amharicLabel="ካልቻሉ ለምን?"
                      placeholder="Why can't you bring a letter?" 
                      containerClassName="mt-3" 
                      value={data.reasonForNoLetter} 
                      onChange={e => update({reasonForNoLetter: e.target.value})} 
                    />
                   )}
                </div>
             </div>
           )}

           <div className="pt-4">
             <div className="mb-2">
                <span className="block text-sm font-bold text-gray-800">How did you come to this church?</span>
                <span className="block text-xs text-gray-500">ወደዚህ ቤተክርስቲያን እንዴት መጡ?</span>
             </div>
             <textarea 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500" 
                rows={2}
                value={data.howDidYouCome}
                onChange={e => update({howDidYouCome: e.target.value})}
             ></textarea>
           </div>
        </div>
      </section>

      {/* Ministry Information */}
      <section>
        <SectionHeader title="Ministry Information" amharicTitle="የአገልግሎት መረጃ" />
        <p className="mb-4 text-sm text-gray-600">
           Please select the areas where you would like to serve:
           <span className="block text-xs text-gray-400 mt-1">አሁን ማገልገል የሚፈልጉትን ይምረጡ::</span>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {ministriesList.map(item => (
            <label key={item.en} className="flex items-start space-x-2 p-3 border rounded hover:bg-gray-50 cursor-pointer">
              <input 
                type="checkbox" 
                checked={data.ministries.includes(item.en)}
                onChange={() => toggleMinistry(item.en)}
                className="mt-1 rounded text-blue-600 focus:ring-blue-500"
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">{item.en}</span>
                <span className="text-xs text-gray-500">{item.am}</span>
              </div>
            </label>
          ))}
        </div>
      </section>

       {/* Discipleship */}
       <section className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <div className="mb-4 pb-2 border-b border-blue-200">
             <h3 className="font-bold text-blue-900">Discipleship Status</h3>
             <span className="text-xs text-blue-700">የደቀመዝሙርነት ሁኔታ</span>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
             <RadioGroup
                label="Are you currently part of a discipleship program?"
                amharicLabel="በአሁኑ ሰዓት በደቀመዝሙርነት ፕሮግራም ተከታታይ ኖት?"
                name="discipleship"
                row
                value={data.currentlyInDiscipleship}
                onChange={val => update({currentlyInDiscipleship: val as any})}
                options={[
                   {label: 'Yes', amharicLabel: 'አዎ', value: 'Yes'}, 
                   {label: 'No', amharicLabel: 'አይደለም', value: 'No'}
                ]}
             />
             {data.currentlyInDiscipleship === 'Yes' && (
               <Input 
                  label="Group Leader Name" 
                  amharicLabel="የቡድን መሪ ስም"
                  value={data.discipleshipLeader} 
                  onChange={e => update({discipleshipLeader: e.target.value})}
                  containerClassName="w-full md:w-64"
                />
             )}
          </div>
       </section>
    </div>
  );
};