import React from 'react';
import { Enrollment, schoolInfo } from '@/lib/institutional-data';
import { cn } from '@/lib/utils';

interface PrintableTESDAFormProps {
  data: Partial<Enrollment> | any;
  refNo?: string;
}

const GridBoxes: React.FC<{ length: number; value: string; className?: string; boxClassName?: (i: number) => string }> = ({ length, value, className, boxClassName }) => {
  const chars = (value || "").toUpperCase().padEnd(length, " ").split("").slice(0, length);
  return (
    <div className={cn("flex border-y border-r border-black overflow-hidden", className)}>
      {chars.map((char, i) => (
        <div key={i} className={cn(
          "w-5 h-6 border-l border-black flex items-center justify-center font-bold text-sm leading-none", 
          boxClassName?.(i)
        )}>
          {char === " " ? "" : char}
        </div>
      ))}
    </div>
  );
};

const PrintableTESDAForm: React.FC<PrintableTESDAFormProps> = ({ data, refNo }) => {
  const refNumString = String(refNo ?? data.refNo ?? "19030612340567890").replace(/[^0-9]/g, "").padEnd(17, "0");
  
  const getRefBoxColor = (i: number) => {
    if (i < 2 || (i >= 6 && i < 11)) return "bg-[#E3F2FD]"; // YY & AC Series: Blue
    if ((i >= 2 && i < 4) || (i >= 11)) return "bg-[#FFEBEE]"; // Region & Series: Pink
    if (i >= 4 && i < 6) return "bg-[#E8F5E9]"; // Province: Green
    return "bg-white";
  };

  return (
    <div className="official-tesda-form bg-white p-[0.5in] text-[#000] font-serif leading-tight w-[8.5in] mx-auto border shadow-2xl print:shadow-none print:p-0 print:m-0" id="printable-form">
      {/* HEADER SECTION */}
      <div className="flex justify-end mb-1">
        <span className="text-[10px] font-sans font-bold">TESDA-SOP-CACO-07-F21</span>
      </div>
      <div className="flex items-center justify-center gap-4 mb-2 border-b-2 border-black pb-2">
        <img src="/TESDA_Logo_official-removebg-preview.png" alt="TESDA" className="w-20 h-20 object-contain" />
        <div className="text-center">
          <h2 className="text-xl font-bold tracking-tight uppercase">Technical Education and Skills Development Authority</h2>
          <p className="text-sm italic">Pangasiwaan sa Edukasyong Teknikal at Pagpapaunlad ng Kasanayan</p>
        </div>
      </div>
      
      <h1 className="text-4xl font-black text-blue-700 text-center my-6 uppercase italic tracking-wider">Application Form</h1>

      {/* REFERENCE NUMBER SECTION */}
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center border border-black bg-white overflow-hidden">
          <div className="px-4 py-1 font-bold text-[11px] uppercase border-r border-black h-full flex items-center bg-white">Reference Number :</div>
          <GridBoxes length={17} value={refNumString} boxClassName={getRefBoxColor} className="border-none" />
        </div>
        <div className="flex w-[340px] text-[7px] font-bold uppercase mt-1 ml-[145px]">
          <div className="w-[40px] text-center">YY</div>
          <div className="w-[40px] text-center">Region</div>
          <div className="w-[40px] text-center">Province</div>
          <div className="w-[100px] text-center">Assigned to AC</div>
          <div className="w-[120px] text-center">Number Series</div>
        </div>
      </div>

      {/* SIGNATURE & PHOTO AREA */}
      <div className="flex justify-between items-center mb-8 h-40">
        <div className="flex-1 flex items-center pr-12 gap-12 h-full">
           <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full border-b border-black"></div>
              <span className="text-[10px] uppercase font-bold mt-1">Applicant's Signature</span>
           </div>
           <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full border-b border-black"></div>
              <span className="text-[10px] uppercase font-bold mt-1">Date</span>
           </div>
        </div>
        <div className="border border-black h-40 w-32 flex items-center justify-center text-center p-2 leading-tight bg-white shrink-0">
           <span className="text-[10px] font-bold uppercase">PICTURE<br/>Colored<br/>Passport Size<br/>White Background</span>
        </div>
      </div>

      {/* INSTITUTION INFO */}
      <table className="w-full border-collapse border border-black mb-4 text-xs">
        <tbody>
          <tr>
            <td className="border border-black p-1 font-bold w-1/3">Name of School/Training Center/Company</td>
            <td className="border border-black p-1 uppercase font-bold text-center">LORENZ INTERNATIONAL SKILLS TRAINING ACADEMY</td>
          </tr>
          <tr>
            <td className="border border-black p-1 font-bold">Address</td>
            <td className="border border-black p-1 uppercase text-center">Poblacion, Gingoog City, Misamis Oriental</td>
          </tr>
          <tr>
            <td className="border border-black p-1 font-bold">Title of Assessment applied for</td>
            <td className="border border-black p-1 uppercase font-black text-sm">{(data.courseName || data.courseSlug || "").replace(/-/g, " ")}</td>
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
      <div className="bg-[#E0E0E0] border border-black p-1 text-[10px] font-black uppercase mb-0">1. CLIENT TYPE</div>
      <div className="grid grid-cols-4 gap-y-1 gap-x-2 text-[9px] font-bold mb-3 border border-black p-2 border-t-0">
         {[ 
           "TVET Graduating Student", "TVET graduate", "Industry worker", "SCEP", "K-12 Student",
           "K-12 Graduate", "OFW", "Domestic Worker", "Indigent", "Indigenous People",
           "PWDs", "Solo Parent", "Others: ________"
         ].map(type => (
            <div key={type} className="flex items-center gap-1.5">
               <div className="w-3 h-3 border border-black flex items-center justify-center shrink-0 text-[10px] font-black">{data.clientType === type ? '✓' : ''}</div>
               <span className="leading-none">{type}</span>
            </div>
         ))}
      </div>

      {/* SECTION 2: PROFILE */}
      <div className="bg-[#F5F5F5] border-x border-t border-black p-1 text-xs font-black uppercase">2. PROFILE</div>
      <div className="border border-black text-[9px]">
         <div className="p-1 border-b border-black font-bold flex justify-between items-center">
           <span>2.1. Name:</span>
           <span className="text-[8px] font-normal italic">* Please write in BLOCK LETTERS (use the boxes provided)</span>
         </div>
         <table className="w-full border-collapse">
            <tbody>
               <tr className="border-b border-black">
                  <td className="w-28 bg-[#E0E0E0] border-r border-black p-1 font-black uppercase text-[9px]">SURNAME</td>
                  <td className="p-1">
                    <GridBoxes length={30} value={data.lastName} />
                  </td>
               </tr>
               <tr className="border-b border-black">
                  <td className="w-28 bg-[#E0E0E0] border-r border-black p-1 font-black uppercase text-[9px]">FIRST NAME</td>
                  <td className="p-1">
                    <GridBoxes length={30} value={data.firstName} />
                  </td>
               </tr>
               <tr className="border-b border-black">
                  <td className="w-28 bg-[#E0E0E0] border-r border-black p-1 font-black uppercase text-[9px] leading-tight">MIDDLE NAME</td>
                  <td className="p-1 flex items-center justify-between">
                    <GridBoxes length={20} value={data.middleName} />
                    <div className="flex items-center gap-1">
                      <span className="text-[7px] font-bold uppercase leading-none">NAME EXTENSION<br/>(e.g. Jr., Sr.)</span>
                      <GridBoxes length={4} value={data.extensionName} className="h-5" boxClassName={() => "h-5 w-4 text-[9px]"} />
                    </div>
                  </td>
               </tr>
            </tbody>
         </table>

         <div className="p-2 border-b border-black">
            <div className="font-bold mb-2">2.2. Mailing Address:</div>
             <div className="space-y-3">
                <div className="grid grid-cols-12 gap-1">
                   <div className="col-span-5 flex flex-col text-center">
                      <div className="border border-black h-7 font-bold flex items-center px-1 uppercase text-[10px]">{data.address || data.street || ""}</div>
                      <div className="text-[8px] font-bold uppercase mt-0.5">Number, Street</div>
                   </div>
                   <div className="col-span-4 flex flex-col text-center">
                      <div className="border border-black h-7 font-bold flex items-center px-1 uppercase text-[10px]">{data.barangay}</div>
                      <div className="text-[8px] font-bold uppercase mt-0.5">Barangay</div>
                   </div>
                   <div className="col-span-3 flex flex-col text-center">
                      <div className="border border-black h-7 font-bold flex items-center px-1 uppercase text-[10px]">{data.district || ""}</div>
                      <div className="text-[8px] font-bold uppercase mt-0.5">District</div>
                   </div>
                </div>
                
                <div className="grid grid-cols-4 gap-1">
                   <div className="flex flex-col text-center">
                      <div className="border border-black h-7 font-bold flex items-center px-1 uppercase text-[10px]">{data.city}</div>
                      <div className="text-[8px] font-bold uppercase mt-0.5">City</div>
                   </div>
                   <div className="flex flex-col text-center">
                      <div className="border border-black h-7 font-bold flex items-center px-1 uppercase text-[10px]">{data.province}</div>
                      <div className="text-[8px] font-bold uppercase mt-0.5">Province</div>
                   </div>
                   <div className="flex flex-col text-center">
                      <div className="border border-black h-7 font-bold flex items-center px-1 uppercase text-[10px]">{data.region}</div>
                      <div className="text-[8px] font-bold uppercase mt-0.5">Region</div>
                   </div>
                   <div className="flex flex-col text-center">
                      <div className="border border-black h-7 font-bold flex items-center px-1 uppercase text-[10px]">{data.zipCode || ""}</div>
                      <div className="text-[8px] font-bold uppercase mt-0.5">Zip Code</div>
                   </div>
                </div>
             </div>
         </div>

         <div className="grid grid-cols-2 border-b border-black divide-x divide-black">
            <div className="p-1 flex flex-col">
               <div className="flex gap-2">
                 <span className="font-bold">2.3. Mother's Name:</span>
                 <span className="font-bold uppercase flex-1 border-b border-black border-dotted">{data.motherName}</span>
               </div>
            </div>
            <div className="p-1 flex flex-col">
               <div className="flex gap-2">
                 <span className="font-bold">2.4. Father's Name:</span>
                 <span className="font-bold uppercase flex-1 border-b border-black border-dotted">{data.fatherName}</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-10 border-b border-black divide-x divide-black min-h-[4rem]">
            <div className="col-span-1 p-1">
               <div className="font-bold text-[8px] mb-1">2.5. Sex</div>
               <div className="flex flex-col gap-1 text-[7px]">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 border border-black flex items-center justify-center font-black">{data.gender === 'Male' ? '✓' : ''}</div> Male</div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 border border-black flex items-center justify-center font-black">{data.gender === 'Female' ? '✓' : ''}</div> Female</div>
               </div>
            </div>
            <div className="col-span-2 p-1">
               <div className="font-bold text-[8px] mb-1">2.6. Civil Status</div>
               <div className="grid grid-cols-1 gap-0.5 text-[7px]">
                  {["Single", "Married", "Widow/er", "Separated"].map(s => (
                     <div key={s} className="flex items-center gap-1"><div className="w-2.5 h-2.5 border border-black flex items-center justify-center font-black text-[9px] leading-none">{data.civilStatus === s ? '✓' : ''}</div> {s}</div>
                  ))}
               </div>
            </div>
            <div className="col-span-3 p-1">
               <div className="font-bold text-[8px] mb-1">2.7. Contact Number(s)</div>
               <div className="space-y-0.5 text-[7px]">
                  <div className="flex gap-1"><span>Tel:</span> <span className="border-b border-black flex-1 h-2.5"></span></div>
                  <div className="flex gap-1"><span>Mobile:</span> <span className="border-b border-black flex-1 h-2.5 font-bold">{data.contact}</span></div>
                  <div className="flex gap-1"><span>E-mail:</span> <span className="border-b border-black flex-1 h-2.5 font-bold lowercase">{data.email}</span></div>
                  <div className="flex gap-1"><span>Fax:</span> <span className="border-b border-black flex-1 h-2.5"></span></div>
                  <div className="flex gap-1"><span>Others:</span> <span className="border-b border-black flex-1 h-2.5"></span></div>
               </div>
            </div>
            <div className="col-span-2 p-1">
               <div className="font-bold text-[7px] leading-none mb-1">2.8. Highest Educational Attainment</div>
               <div className="grid grid-cols-1 text-[6px]">
                  {["Elementary graduate", "HS graduate", "TVET Graduate", "College Level", "College Graduate"].map(e => (
                     <div key={e} className="flex items-center gap-1 leading-none h-2.5">
                        <div className="w-2 h-2 border border-black flex items-center justify-center shrink-0 font-black text-[7px]">{data.education === e ? '✓' : ''}</div> 
                        <span>{e}</span>
                     </div>
                  ))}
                  <div className="flex items-center gap-1 leading-none h-2.5">
                    <div className="w-2 h-2 border border-black"></div>
                    <span>Others: ________</span>
                  </div>
               </div>
            </div>
            <div className="col-span-2 p-1">
               <div className="font-bold text-[8px] mb-1 leading-none">2.9. Employment Status</div>
               <div className="grid grid-cols-1 gap-0.5 text-[6.5px] font-bold">
                  <div className="flex items-center gap-1 font-black underline mb-0.5">Employed:</div>
                  {["Casual", "Contractual", "Job Order", "Probationary", "Permanent", "Self-Employed"].map(s => (
                    <div key={s} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 border border-black flex items-center justify-center font-black">{data.employmentStatus === s ? '✓' : ''}</div>
                      {s}
                    </div>
                  ))}
                  <div className="flex items-center gap-1 font-black underline mt-1 mb-0.5">Unemployed:</div>
                  {["TVET Graduate", "Fresh Graduate", "Finished Course", "OFW Returnee"].map(s => (
                    <div key={s} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 border border-black flex items-center justify-center font-black">{data.employmentStatus === s ? '✓' : ''}</div>
                      {s}
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="grid grid-cols-12 divide-x divide-black h-12">
            <div className="col-span-4 p-1 flex items-center gap-2">
               <span className="font-bold text-[8px] shrink-0">2.10. Birth date:</span>
               <div className="flex flex-col items-center">
                  <div className="flex border border-black divide-x divide-black h-6 bg-white">
                    <div className="w-4 flex items-center justify-center font-bold text-[10px]">{data.dob?.split('-')[1]?.[0]}</div>
                    <div className="w-4 flex items-center justify-center font-bold text-[10px]">{data.dob?.split('-')[1]?.[1]}</div>
                    <div className="w-4 flex items-center justify-center font-bold text-[10px]">{data.dob?.split('-')[2]?.[0]}</div>
                    <div className="w-4 flex items-center justify-center font-bold text-[10px]">{data.dob?.split('-')[2]?.[1]}</div>
                    <div className="w-4 flex items-center justify-center font-bold text-[10px]">{data.dob?.split('-')[0]?.[2]}</div>
                    <div className="w-4 flex items-center justify-center font-bold text-[10px]">{data.dob?.split('-')[0]?.[3]}</div>
                  </div>
                  <div className="flex w-full justify-between px-1 text-[6px] font-bold uppercase">
                     <span>M M</span>
                     <span>D D</span>
                     <span>Y Y</span>
                  </div>
               </div>
            </div>
            <div className="col-span-5 p-1 flex flex-col justify-center">
               <div className="flex gap-1 items-end">
                  <span className="font-bold text-[8px] shrink-0">2.11. Birth place:</span> 
                  <span className="border-b border-black flex-1 font-bold uppercase text-[8px] px-1 h-4 flex items-center">{data.birthPlace}</span>
               </div>
            </div>
            <div className="col-span-3 p-1 flex items-center gap-2">
               <div className="flex items-center gap-1">
                 <span className="font-bold text-[8px]">2.12. Age:</span> 
                 <span className="border-b border-black font-black text-[11px] px-2 h-4 flex items-center">{data.age}</span>
               </div>
               <div className="flex flex-col items-center flex-1">
                  <div className="border-b border-black w-full h-4 text-center font-bold uppercase text-[9px]">{data.nationality || "FILIPINO"}</div>
                  <span className="text-[6px] font-bold">2.13. Nationality</span>
               </div>
            </div>
         </div>
      </div>

      {/* SECTION 3: WORK EXPERIENCE */}
      <div className="bg-slate-200 border border-black p-1 text-xs font-black uppercase mt-2 mb-1">3. Work Experience (National Qualification-related)</div>
      <table className="w-full border-collapse border border-black text-[9px] mb-4">
         <thead>
          <tr className="bg-slate-100 text-[8px] font-bold">
               <th className="border border-black p-0.5 w-[30%]">3.1. Name of Company</th>
               <th className="border border-black p-0.5 w-[15%]">3.2. Position</th>
               <th className="border border-black p-0.5 w-[15%]">3.3. Inclusive Dates</th>
               <th className="border border-black p-0.5 w-[10%]">3.4. Monthly Salary</th>
               <th className="border border-black p-0.5 w-[15%]">3.5. Status of Appointment</th>
               <th className="border border-black p-0.5 w-[15%]">3.6. No. of Yrs. Working Exp.</th>
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

      {/* SECTION 4: OTHER TRAININGS */}
      <div className="bg-slate-200 border border-black p-1 text-xs font-black uppercase mt-2 mb-1">4. Other Training/Seminars Attended (National Qualification-Related)</div>
      <table className="w-full border-collapse border border-black text-[9px] mb-4">
         <thead>
            <tr className="bg-slate-100 text-center font-bold">
               <th className="border border-black p-1 w-1/3">Title</th>
               <th className="border border-black p-1">Venue</th>
               <th className="border border-black p-1">Inclusive Dates</th>
               <th className="border border-black p-1">No. of Hours</th>
               <th className="border border-black p-1">Conducted By</th>
            </tr>
         </thead>
         <tbody>
            {[0, 1, 2].map(i => {
               const train = data.otherTrainings?.[i];
               return (
                  <tr key={i} className="h-6">
                     <td className="border border-black px-1 font-bold">{train?.title || ''}</td>
                     <td className="border border-black px-1 text-center">{train?.venue || ''}</td>
                     <td className="border border-black px-1 text-center">{train?.inclusiveDates || ''}</td>
                     <td className="border border-black px-1 text-center">{train?.noOfHours || ''}</td>
                     <td className="border border-black px-1 text-center">{train?.conductedBy || ''}</td>
                  </tr>
               );
            })}
         </tbody>
      </table>

      {/* SECTION 5: LICENSURE EXAMINATIONS */}
      <div className="bg-slate-200 border border-black p-1 text-xs font-black uppercase mt-2 mb-1">5. Licensure Examination(s) Passed</div>
      <table className="w-full border-collapse border border-black text-[9px] mb-4">
         <thead>
            <tr className="bg-slate-100 text-center font-bold">
               <th className="border border-black p-1 w-1/4">Title</th>
               <th className="border border-black p-1">Year Taken</th>
               <th className="border border-black p-1">Examination Venue</th>
               <th className="border border-black p-1">Rating</th>
               <th className="border border-black p-1">Remarks</th>
               <th className="border border-black p-1">Expiry Date</th>
            </tr>
         </thead>
         <tbody>
            {[0, 1, 2].map(i => {
               const exam = data.licensureExams?.[i];
               return (
                  <tr key={i} className="h-6">
                     <td className="border border-black px-1 font-bold">{exam?.title || ''}</td>
                     <td className="border border-black px-1 text-center">{exam?.yearTaken || ''}</td>
                     <td className="border border-black px-1 text-center">{exam?.examinationVenue || ''}</td>
                     <td className="border border-black px-1 text-center">{exam?.rating || ''}</td>
                     <td className="border border-black px-1 text-center">{exam?.remarks || ''}</td>
                     <td className="border border-black px-1 text-center">{exam?.expiryDate || ''}</td>
                  </tr>
               );
            })}
         </tbody>
      </table>

      {/* SECTION 6: COMPETENCY ASSESSMENTS */}
      <div className="bg-slate-200 border border-black p-1 text-xs font-black uppercase mt-2 mb-1">6. Competency Assessment(s) Passed</div>
      <table className="w-full border-collapse border border-black text-[9px] mb-4">
         <thead>
            <tr className="bg-slate-100 text-center font-bold">
               <th className="border border-black p-1 w-1/4">Title</th>
               <th className="border border-black p-1">Qualification Level</th>
               <th className="border border-black p-1">Industry Sector</th>
               <th className="border border-black p-1">Certificate Number</th>
               <th className="border border-black p-1">Date of Issuance</th>
               <th className="border border-black p-1">Expiration Date</th>
            </tr>
         </thead>
         <tbody>
            {[0, 1, 2].map(i => {
               const comp = data.competencyAssessments?.[i];
               return (
                  <tr key={i} className="h-6">
                     <td className="border border-black px-1 font-bold">{comp?.title || ''}</td>
                     <td className="border border-black px-1 text-center">{comp?.qualificationLevel || ''}</td>
                     <td className="border border-black px-1 text-center">{comp?.industrySector || ''}</td>
                     <td className="border border-black px-1 text-center">{comp?.certificateNumber || ''}</td>
                     <td className="border border-black px-1 text-center">{comp?.dateOfIssuance || ''}</td>
                     <td className="border border-black px-1 text-center">{comp?.expirationDate || ''}</td>
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
            <div className="flex items-center gap-2 border-b border-black p-2 bg-white">
               <span className="text-[10px] font-bold uppercase shrink-0">REFERENCE NUMBER :</span>
               <GridBoxes length={17} value={refNumString} boxClassName={getRefBoxColor} />
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
         <div className="p-2 border-b border-black flex justify-between items-center bg-slate-50">
            <span className="font-bold text-[10px]">Name of Assessment Center:</span>
            <span className="font-black uppercase text-[11px]">LORENZ INTERNATIONAL SKILLS TRAINING ACADEMY</span>
         </div>
         <div className="grid grid-cols-2 h-28">
            <div className="border-r border-black p-2 space-y-1">
               <div className="text-[9px] font-bold uppercase mb-1 text-slate-600 italic underline">Check submitted requirements:</div>
               <div className="flex items-center gap-2 text-[9px]"><div className="w-3.5 h-3.5 border border-black shrink-0"></div> Accomplished Self-Assessment Guide</div>
               <div className="flex items-center gap-2 text-[9px]"><div className="w-3.5 h-3.5 border border-black shrink-0"></div> Three (3) pieces colored passport size pictures</div>
               <div className="flex items-center gap-2 text-[9px]"><div className="w-3.5 h-3.5 border border-black shrink-0"></div> Transcript of Records / Diploma</div>
            </div>
            <div className="p-2 space-y-1">
               <div className="text-[9px] font-bold uppercase mb-1 text-slate-600 italic underline">Remarks:</div>
               <div className="flex items-center gap-2 text-[9px]"><div className="w-3.5 h-3.5 border border-black shrink-0"></div> Bring own Personal Protective Equipment</div>
               <div className="flex items-center gap-2 text-[9px]"><div className="w-3.5 h-3.5 border border-black shrink-0"></div> Bring 1 long brown envelope</div>
               <div className="flex items-center gap-2 text-[9px]"><div className="w-3.5 h-3.5 border border-black shrink-0"></div> Others. Pls. specify _________________</div>
            </div>
         </div>
         <div className="grid grid-cols-2 border-t border-black bg-white divide-x divide-black">
            <div className="p-2 flex items-center justify-between">
               <span className="font-bold text-[10px] uppercase">Assessment Date:</span> 
               <span className="font-black underline text-[12px]">{data.assessmentDate || "APRIL 11, 2026"}</span>
            </div>
            <div className="p-2 flex items-center justify-between">
               <span className="font-bold text-[10px] uppercase">Assessment Time:</span> 
               <span className="font-black underline text-[12px]">{data.assessmentTime || "8:00 AM"}</span>
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
