import { X, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Enrollment } from "@/lib/institutional-data";
import { useCourses } from "@/hooks/use-lista-data";
import { courseTitleBySlug } from "@/lib/lista-insforge-data";
import PrintableTESDAForm from "@/components/printable-tesda-form";

export default function PrintModal({ enrollment, onClose }: { enrollment: Enrollment; onClose: () => void }) {
  const { data: courses = [] } = useCourses();
  const courseTitle = courseTitleBySlug(courses, enrollment.courseSlug);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="print-modal-overlay fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 print:static print:overflow-visible print:bg-white print:py-0"
      role="dialog"
      aria-modal="true"
      aria-label={`TESDA application form for ${enrollment.traineeName}`}
    >
      <div className="no-print absolute inset-0" onClick={onClose} aria-hidden />

      <div className="relative z-10 w-full max-w-5xl mx-4 print:max-w-none print:mx-0">
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
            <Button variant="outline" onClick={onClose} className="rounded-xl font-bold text-slate-500">
              <X className="w-4 h-4 mr-2" /> Close
            </Button>
            <Button
              onClick={handlePrint}
              className="rounded-xl font-bold gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Printer className="w-4 h-4" /> Print / Download PDF
            </Button>
          </div>
        </div>

        <p className="no-print mb-3 text-center text-xs text-slate-500">
          For PDF: choose <strong>Save as PDF</strong>, paper <strong>Letter</strong>, margins <strong>Default</strong>, and enable{" "}
          <strong>Background graphics</strong>.
        </p>

        <div className="print-preview-shell overflow-x-auto overflow-y-visible rounded-2xl shadow-2xl border border-slate-200 bg-white print:overflow-visible print:rounded-none print:border-0 print:shadow-none">
          <PrintableTESDAForm
            data={{
              ...enrollment,
              firstName: enrollment.firstName,
              middleName: enrollment.middleName || "",
              lastName: enrollment.lastName,
              extensionName: enrollment.extensionName || "",
              dob: enrollment.dob,
              birthPlace: enrollment.birthPlace || "",
              age: enrollment.age,
              nationality: enrollment.nationality || "Filipino",
              email: enrollment.traineeEmail,
              contact: enrollment.contactNumber,
              telephone: enrollment.telephone || "",
              mobileNumber: enrollment.mobileNumber || enrollment.contactNumber,
              address: enrollment.homeAddress,
              barangay: enrollment.barangay || "",
              district: enrollment.district || "",
              city: enrollment.city,
              province: enrollment.province,
              region: enrollment.region || "Region X — Northern Mindanao",
              zipCode: enrollment.zipCode || "9014",
              motherName: enrollment.motherMaidenName,
              fatherName: enrollment.fatherName,
              gender: enrollment.gender,
              civilStatus: enrollment.civilStatus,
              education: enrollment.education,
              school: enrollment.schoolLastAttended || "",
              employmentStatus: enrollment.employmentStatus,
              employmentType: enrollment.employmentType || "",
              companyName: enrollment.companyName || "",
              clientType: enrollment.clientType || enrollment.learnerClassification,
              qualificationType: enrollment.qualificationType || "Full Qualification",
              workExperience: enrollment.workExperience || [],
              otherTrainings: enrollment.otherTrainings || [],
              licensureExams: enrollment.licensureExams || [],
              competencyAssessments: enrollment.competencyAssessments || [],
              courseName: courseTitle,
              schedule: enrollment.preferredSchedule,
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
