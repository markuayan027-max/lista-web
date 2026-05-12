import React from 'react';
import { Enrollment, schoolInfo } from '@/lib/institutional-data';
import { cn } from '@/lib/utils';

interface PrintableTESDAFormProps {
  data: Partial<Enrollment> | any;
  refNo?: string;
}

const PrintableTESDAForm: React.FC<PrintableTESDAFormProps> = ({ data, refNo }) => {
  const referenceNumber = (refNo || data.refNo || "19030612340567890").replace(/[^0-9]/g, "").padEnd(15, "0").split("");

  return (
    <div className="official-tesda-form bg-white p-[0.5in] text-[#000] font-serif leading-tight w-[8.5in] mx-auto border shadow-2xl print:shadow-none print:p-0 print:m-0" id="printable-form">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-center gap-4 mb-2 border-b-2 border-black pb-2">
        <img src="/TESDA_Logo_official-removebg-preview.png" alt="TESDA" className="w-20 h-20 object-contain" />
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight uppercase">Technical Education and Skills Development Authority</h2>
          <p className="text-sm italic">Pangasiwaan sa Edukasyong Teknikal at Pagpapaunlad ng Kasanayan</p>
        </div>
      </div>

      <div className="text-right text-[10px] mb-1 font-sans font-bold">TESDA-SOP-CACO-07-F21</div>
      
      <h1 className="text-3xl font-black text-blue-700 text-center mb-4 uppercase italic tracking-wider">Application Form</h1>

      {/* REFERENCE NUMBER BOXES */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className="text-[10px] font-bold uppercase">Reference Number :</span>
        <div className="flex border-y border-r border-black">
          {referenceNumber.map((char, i) => (
            <div key={i} className={cn(
               "w-6 h-7 border-l border-black flex items-center justify-center font-bold text-lg",
               i < 2 ? "bg-blue-100" : i < 4 ? "bg-rose-100" : i < 6 ? "bg-emerald-100" : i < 11 ? "bg-orange-100" : "bg-slate-100"
            )}>
              {char}
            </div>
          ))}
        </div>
      </div>

      {/* SIGNATURE & PHOTO AREA */}
      <div className="grid grid-cols-3 gap-8 mb-8 items-end">
        <div className="col-span-2 grid grid-cols-2 gap-4">
           <div className="border-b border-black text-center pt-8">
              <span className="text-xs uppercase font-bold block border-t border-black mt-4">Applicant's Signature</span>
           </div>
           <div className="border-b border-black text-center pt-8">
              <span className="text-xs uppercase font-bold block border-t border-black mt-4">Date</span>
           </div>
        </div>
        <div className="border-2 border-black h-40 w-32 ml-auto flex items-center justify-center text-center p-2 leading-tight">
           <span className="text-[10px] font-bold uppercase">PICTURE<br/>Colored<br/>Passport Size<br/>White Background</span>
        </div>
      </div>

      {/* INSTITUTION INFO */}
      <table className="w-full border-collapse border border-black mb-4 text-xs">
        <tbody>
          <tr>
            <td className="border border-black p-1 font-bold w-1/3">Name of School/Training Center/Company</td>
            <td className="border border-black p-1 uppercase font-bold">{schoolInfo.fullName}</td>
          </tr>
          <tr>
            <td className="border border-black p-1 font-bold">Address</td>
            <td className="border border-black p-1 uppercase">{schoolInfo.city}, {schoolInfo.province}</td>
          </tr>
          <tr>
            <td className="border border-black p-1 font-bold">Title of Assessment applied for</td>
            <td className="border border-black p-1 uppercase font-black text-sm">{(data.courseName || data.courseSlug || "DRESSMAKING NC II").replace(/-/g, " ")}</td>
          </tr>
        </tbody>
      </table>

      {/* OPTIONS */}
      <div className="flex gap-20 justify-center text-xs font-bold mb-4">
        <div className="flex items-center gap-2">
           <div className="w-4 h-4 border border-black flex items-center justify-center">{data.qualificationType !== 'COC' ? '✓' : ''}</div>
           <span>Full Qualification</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-4 h-4 border border-black flex items-center justify-center">{data.qualificationType === 'COC' ? '✓' : ''}</div>
           <span>COC</span>
        </div>
      </div>

      {/* SECTION 1: CLIENT TYPE */}
      <div className="bg-slate-200 border border-black p-1 text-xs font-black uppercase mb-1">1. CLIENT TYPE</div>
      <div className="grid grid-cols-4 gap-2 text-[10px] font-bold mb-4 border border-black p-2">
         {[ "TVET Graduating Student", "TVET graduate", "Industry worker", "SCEP" ].map(type => (
            <div key={type} className="flex items-center gap-2">
               <div className="w-3 h-3 border border-black flex items-center justify-center shrink-0">{data.clientType === type ? '✓' : ''}</div>
               <span>{type}</span>
            </div>
         ))}
      </div>

      {/* SECTION 2: PROFILE */}
      <div className="bg-slate-200 border border-black p-1 text-xs font-black uppercase mb-1">2. PROFILE</div>
      <div className="border border-black text-[10px]">
         <div className="p-1 border-b border-black font-bold">2.1. Name:</div>
         <table className="w-full border-collapse">
            <tbody>
               <tr className="border-b border-black">
                  <td className="w-24 bg-slate-100 border-r border-black p-1 font-black uppercase">SURNAME</td>
                  <td className="p-1 font-bold uppercase tracking-[0.3em]">{data.lastName}</td>
               </tr>
               <tr className="border-b border-black">
                  <td className="w-24 bg-slate-100 border-r border-black p-1 font-black uppercase">FIRSTNAME</td>
                  <td className="p-1 font-bold uppercase tracking-[0.3em]">{data.firstName}</td>
               </tr>
               <tr className="border-b border-black">
                  <td className="w-24 bg-slate-100 border-r border-black p-1 font-black uppercase leading-none">MIDDLE NAME</td>
                  <td className="p-1 font-bold uppercase tracking-[0.3em] flex justify-between">
                     <span>{data.middleName}</span>
                     <span className="text-[8px] font-normal tracking-normal border-l border-black pl-2">NAME EXTENSION (e.g. Jr., Sr.) : <span className="font-bold underline">{data.extensionName || 'N/A'}</span></span>
                  </td>
               </tr>
            </tbody>
         </table>

         <div className="p-1 border-b border-black flex gap-4">
            <div className="flex-1">
               <div className="font-bold mb-4">2.2. Mailing Address</div>
               <div className="grid grid-cols-3 gap-2">
                  <div className="border-b border-black h-6 font-bold text-center underline">{data.address}</div>
                  <div className="border-b border-black h-6 font-bold text-center underline">{data.barangay}</div>
                  <div className="border-b border-black h-6 font-bold text-center underline">{data.district || 'N/A'}</div>
                  <div className="text-[8px] text-center font-bold uppercase -mt-1">Number, Street</div>
                  <div className="text-[8px] text-center font-bold uppercase -mt-1">Barangay</div>
                  <div className="text-[8px] text-center font-bold uppercase -mt-1">District</div>
               </div>
               <div className="grid grid-cols-4 gap-2 mt-2">
                  <div className="border-b border-black h-6 font-bold text-center underline">{data.city}</div>
                  <div className="border-b border-black h-6 font-bold text-center underline">{data.province}</div>
                  <div className="border-b border-black h-6 font-bold text-center underline">{data.region}</div>
                  <div className="border-b border-black h-6 font-bold text-center underline">{data.zipCode}</div>
                  <div className="text-[8px] text-center font-bold uppercase -mt-1">City</div>
                  <div className="text-[8px] text-center font-bold uppercase -mt-1">Province</div>
                  <div className="text-[8px] text-center font-bold uppercase -mt-1">Region</div>
                  <div className="text-[8px] text-center font-bold uppercase -mt-1">Zip Code</div>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 border-b border-black">
            <div className="p-1 border-r border-black">
               <span className="font-bold">2.3. Mother's Name:</span> <span className="underline font-bold uppercase">{data.motherName}</span>
            </div>
            <div className="p-1">
               <span className="font-bold">2.4. Father's Name:</span> <span className="underline font-bold uppercase">{data.fatherName}</span>
            </div>
         </div>

         <div className="grid grid-cols-10 border-b border-black">
            <div className="col-span-2 p-1 border-r border-black">
               <div className="font-bold mb-1">2.5. Sex</div>
               <div className="flex gap-2">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 border border-black flex items-center justify-center">{data.gender === 'Male' ? '✓' : ''}</div> Male</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 border border-black flex items-center justify-center">{data.gender === 'Female' ? '✓' : ''}</div> Female</div>
               </div>
            </div>
            <div className="col-span-2 p-1 border-r border-black">
               <div className="font-bold mb-1">2.6. Civil Status</div>
               <div className="grid grid-cols-2 gap-x-2 text-[8px]">
                  {["Single", "Married", "Widow/er", "Separated"].map(s => (
                     <div key={s} className="flex items-center gap-1"><div className="w-2 h-2 border border-black flex items-center justify-center">{data.civilStatus === s ? '✓' : ''}</div> {s}</div>
                  ))}
               </div>
            </div>
            <div className="col-span-2 p-1 border-r border-black">
               <div className="font-bold mb-1">2.7. Contact Number(s)</div>
               <div className="text-[8px]">
                  <div className="flex justify-between border-b border-black/20">Tel: <span className="font-bold underline">{data.contact}</span></div>
                  <div className="flex justify-between border-b border-black/20">Mobile: <span className="font-bold underline">{data.contact}</span></div>
                  <div className="flex justify-between">E-mail: <span className="font-bold underline">{data.email}</span></div>
               </div>
            </div>
            <div className="col-span-2 p-1 border-r border-black">
               <div className="font-bold mb-1 leading-none">2.8. Highest Ed Attainment</div>
               <div className="grid grid-cols-1 text-[8px]">
                  {["Elementary graduate", "HS graduate", "TVET Graduate", "College Level", "College Graduate"].map(e => (
                     <div key={e} className="flex items-center gap-1 leading-none"><div className="w-2 h-2 border border-black flex items-center justify-center shrink-0">{data.education === e ? '✓' : ''}</div> {e}</div>
                  ))}
               </div>
            </div>
            <div className="col-span-2 p-1">
               <div className="font-bold mb-1 leading-none">2.9. Employment Status</div>
               <div className="grid grid-cols-2 gap-x-2 text-[7px] font-bold">
                  {["Casual", "Contractual", "Job Order", "Probationary", "Permanent", "Self-Employed", "OFW"].map(e => (
                     <div key={e} className="flex items-center gap-1 leading-none">{data.employmentStatus === e ? '✓' : ''} {e}</div>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-3">
            <div className="p-1 border-r border-black flex items-center gap-2">
               <span className="font-bold">2.10. Birth date:</span>
               <div className="flex border border-black divide-x divide-black h-5">
                  <div className="w-4 flex items-center justify-center">{data.dob?.split('-')[1]}</div>
                  <div className="w-4 flex items-center justify-center">{data.dob?.split('-')[2]}</div>
                  <div className="w-6 flex items-center justify-center font-bold text-[9px]">{data.dob?.split('-')[0]?.substring(2)}</div>
               </div>
               <div className="flex flex-col text-[7px] leading-none font-bold">
                  <span>M M</span>
                  <span>D D</span>
                  <span>Y Y</span>
               </div>
            </div>
            <div className="p-1 border-r border-black">
               <span className="font-bold">2.11. Birth place:</span> <span className="underline font-bold uppercase">{data.birthPlace}</span>
            </div>
            <div className="p-1 flex items-center gap-2">
               <span className="font-bold">2.11. Age:</span> <span className="underline font-black text-sm">{data.age}</span>
            </div>
         </div>
      </div>

      {/* SECTION 3: WORK EXPERIENCE */}
      <div className="bg-slate-200 border border-black p-1 text-xs font-black uppercase mt-2 mb-1">3. Work Experience (National Qualification-related)</div>
      <table className="w-full border-collapse border border-black text-[9px] mb-4">
         <thead>
            <tr className="bg-slate-100 text-center font-bold">
               <th className="border border-black p-1 w-1/3">Name of Company</th>
               <th className="border border-black p-1">Position</th>
               <th className="border border-black p-1">Inclusive Dates</th>
               <th className="border border-black p-1">Monthly Salary</th>
               <th className="border border-black p-1">Status of Appointment</th>
               <th className="border border-black p-1">No. of Yrs. Working Exp.</th>
            </tr>
         </thead>
         <tbody>
            {[0, 1, 2].map(i => {
               const exp = data.workExperience?.[i];
               return (
                  <tr key={i} className="h-6">
                     <td className="border border-black px-1 font-bold">{exp?.company || ''}</td>
                     <td className="border border-black px-1 text-center">{exp?.position || ''}</td>
                     <td className="border border-black px-1 text-center">{exp?.dates || ''}</td>
                     <td className="border border-black px-1 text-center">{exp?.salary || ''}</td>
                     <td className="border border-black px-1 text-center">{exp?.status || ''}</td>
                     <td className="border border-black px-1 text-center">{exp?.yearsExp || ''}</td>
                  </tr>
               );
            })}
         </tbody>
      </table>

      {/* DOTTED LINE SEPARATOR */}
      <div className="border-t-2 border-dashed border-black my-8 relative">
         <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.5em]">CUT HERE</div>
      </div>

      {/* ADMISSION SLIP SECTION */}
      <div className="border-2 border-black p-1 bg-cyan-100 text-center font-black text-2xl uppercase tracking-[0.3em] mb-4">ADMISSION SLIP</div>

      <div className="grid grid-cols-4 gap-4 mb-4">
         <div className="col-span-3 border border-black">
            <div className="flex items-center gap-2 border-b border-black p-2 bg-slate-50">
               <span className="text-[10px] font-bold uppercase shrink-0">REFERENCE NUMBER :</span>
               <div className="flex border border-black divide-x divide-black bg-white">
                  {referenceNumber.map((char, i) => (
                    <div key={i} className={cn("w-5 h-6 flex items-center justify-center font-bold text-sm", i < 11 ? "bg-slate-200" : "bg-white")}>{char}</div>
                  ))}
               </div>
            </div>
            
            <div className="grid grid-cols-2 text-xs">
               <div className="border-r border-b border-black p-2">
                  <span className="text-[10px] font-bold uppercase block text-slate-500">Name of Applicant:</span>
                  <span className="font-bold text-lg uppercase tracking-tight">{data.lastName}, {data.firstName} {data.middleName}</span>
               </div>
               <div className="border-b border-black p-2">
                  <span className="text-[10px] font-bold uppercase block text-slate-500">Tel. Number:</span>
                  <span className="font-bold text-lg">{data.contact}</span>
               </div>
               <div className="border-r border-black p-2">
                  <span className="text-[10px] font-bold uppercase block text-slate-500">Assessment Applied for:</span>
                  <span className="font-black text-lg underline">{(data.courseName || data.courseSlug || "DRESSMAKING NC II").replace(/-/g, " ")}</span>
               </div>
               <div className="p-2 space-y-2">
                  <div className="flex justify-between items-end border-b border-black/50">
                     <span className="text-[8px] font-bold uppercase text-slate-500">Official Receipt Number:</span>
                     <span className="font-mono text-sm">_________________</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-black/50">
                     <span className="text-[8px] font-bold uppercase text-slate-500">Date Issued:</span>
                     <span className="font-mono text-sm">_________________</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="col-span-1 border-2 border-black flex flex-col items-center justify-center text-center p-2 leading-tight">
            <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-black/50 p-2">
               <span className="text-[9px] font-bold uppercase text-slate-400">PICTURE<br/>Colored<br/>Passport Size<br/>White Background</span>
            </div>
         </div>
      </div>

      <div className="bg-slate-300 border border-black p-1 text-[10px] font-black text-center uppercase tracking-widest mb-2">To be accomplished by the Processing Officer</div>

      <div className="border border-black text-xs mb-4">
         <div className="p-2 border-b border-black flex justify-between items-center">
            <span className="font-bold">Name of Assessment Center:</span>
            <span className="font-black uppercase">{schoolInfo.fullName}</span>
         </div>
         <div className="grid grid-cols-2 h-20">
            <div className="border-r border-black p-2 space-y-1">
               <div className="text-[9px] font-bold uppercase mb-1 text-slate-500 italic underline">Check submitted requirements:</div>
               <div className="flex items-center gap-2 text-[9px]"><div className="w-3 h-3 border border-black"></div> Accomplished Self-Assessment Guide</div>
               <div className="flex items-center gap-2 text-[9px]"><div className="w-3 h-3 border border-black"></div> Three (3) pieces colored passport size pictures</div>
            </div>
            <div className="p-2 space-y-1">
               <div className="text-[9px] font-bold uppercase mb-1 text-slate-500 italic underline">Remarks:</div>
               <div className="flex items-center gap-2 text-[9px]"><div className="w-3 h-3 border border-black"></div> Bring own Personal Protective Equipment</div>
               <div className="flex items-center gap-2 text-[9px]"><div className="w-3 h-3 border border-black"></div> Others. Pls. specify _________________</div>
            </div>
         </div>
         <div className="grid grid-cols-2 border-t border-black bg-slate-50">
            <div className="border-r border-black p-2">
               <span className="font-bold text-[10px]">Assessment Date:</span> <span className="font-mono underline ml-4">April 11, 2026</span>
            </div>
            <div className="p-2 text-right">
               <span className="font-bold text-[10px]">Assessment Time:</span> <span className="font-mono underline ml-4">8am - 5pm</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-12 mb-8">
         <div className="text-center border-t-2 border-black pt-1">
            <span className="text-[10px] font-black uppercase">Printed Name & Signature of Processing Officer</span>
            <div className="mt-4 flex justify-between px-4 text-[8px] font-bold italic">
               <span>Date: _______________</span>
            </div>
         </div>
         <div className="text-center border-t-2 border-black pt-1">
            <span className="text-[10px] font-black uppercase">Printed Name & Signature of Applicant</span>
            <div className="mt-4 flex justify-between px-4 text-[8px] font-bold italic">
               <span>Date: _______________</span>
            </div>
         </div>
      </div>

      <div className="bg-rose-50 border-2 border-rose-200 p-4 text-center">
         <p className="text-sm font-black text-rose-700 tracking-wider uppercase">NOTE: PLEASE BRING THIS ADMISSION SLIP ON YOUR ASSESSMENT DATE.</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-form, #printable-form * { visibility: visible; }
          #printable-form {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            border: none;
            padding: 0;
            margin: 0;
          }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default PrintableTESDAForm;
