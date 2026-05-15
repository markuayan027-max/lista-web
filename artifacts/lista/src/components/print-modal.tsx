import { motion } from "framer-motion";
import { X, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Enrollment, courses } from "@/lib/institutional-data";
import PrintableTESDAForm from "@/components/printable-tesda-form";

export default function PrintModal({ enrollment, onClose }: { enrollment: Enrollment; onClose: () => void }) {
  // Everyone can print this modal since it's just window.print()
  const canPrint = true; 

  const course = courses.find(c => c.slug === enrollment.courseSlug);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8">
      {/* Backdrop click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl mx-4">
        {/* Toolbar */}
        <div className="no-print flex items-center justify-between bg-white rounded-2xl px-6 py-4 mb-4 shadow-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm">{enrollment.traineeName}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{enrollment.refNo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl font-bold text-slate-500"
            >
              <X className="w-4 h-4 mr-2" /> Close
            </Button>
            {canPrint && (
              <Button
                onClick={handlePrint}
                className="rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Printer className="w-4 h-4" /> Print / Download PDF
              </Button>
            )}
          </div>
        </div>

        {/* Form preview */}
        <div className="overflow-hidden rounded-2xl shadow-2xl border border-slate-200 bg-white">
          <PrintableTESDAForm
            data={{
              ...enrollment,
              // ── Name ──
              firstName: enrollment.firstName,
              middleName: enrollment.middleName || "",
              lastName: enrollment.lastName,
              extensionName: enrollment.extensionName || "",
              
              // ── Birth & Identity ──
              dob: enrollment.dob,
              birthPlace: enrollment.birthPlace || "",
              age: enrollment.age,
              nationality: enrollment.nationality || "Filipino",
              
              // ── Contact ──
              email: enrollment.traineeEmail,
              contact: enrollment.contactNumber,
              telephone: enrollment.telephone || "",
              mobileNumber: enrollment.mobileNumber || enrollment.contactNumber,
              
              // ── Address ──
              address: enrollment.homeAddress,
              barangay: enrollment.barangay || "",
              district: enrollment.district || "",
              city: enrollment.city,
              province: enrollment.province,
              region: enrollment.region || "Region X — Northern Mindanao",
              zipCode: enrollment.zipCode || "9014",
              
              // ── Family ──
              motherName: enrollment.motherMaidenName,
              fatherName: enrollment.fatherName,
              
              // ── Demographics ──
              gender: enrollment.gender,
              civilStatus: enrollment.civilStatus,
              
              // ── Education ──
              education: enrollment.education,
              school: enrollment.schoolLastAttended || "",
              
              // ── Employment ──
              employmentStatus: enrollment.employmentStatus,
              employmentType: enrollment.employmentType || "",
              companyName: enrollment.companyName || "",
              
              // ── TESDA-specific ──
              clientType: enrollment.clientType || enrollment.learnerClassification,
              qualificationType: enrollment.qualificationType || "Full Qualification",
              
              // ── Work Experience & Background ──
              workExperience: enrollment.workExperience || [],
              otherTrainings: enrollment.otherTrainings || [],
              licensureExams: enrollment.licensureExams || [],
              competencyAssessments: enrollment.competencyAssessments || [],
              
              // ── Course ──
              courseName: course?.title,
              schedule: enrollment.preferredSchedule,
              
              // ── Meta ──
              enrollType: enrollment.enrollmentType,
              scholarship: enrollment.scholarshipApplication,
              heardFrom: enrollment.heardFrom || "",
              notes: enrollment.notes || "",
            }}
            refNo={enrollment.refNo}
          />
        </div>
      </div>
    </div>
  );
}