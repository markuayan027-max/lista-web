import { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Users, BookOpen, FileText, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useCourses, useEnrollments, useUsers } from "@/hooks/use-lista-data";
import { courseTitleBySlug } from "@/lib/lista-insforge-data";
import StatusBadge from "@/components/status-badge";

export default function StaffSearchPage() {
  const [query, setQuery] = useState("");
  const { data: users = [] } = useUsers();
  const { data: enrollments = [] } = useEnrollments();
  const { data: courses = [] } = useCourses();

  const trainees = users.filter((u) => u.role === "trainee");
  
  const searchResults = {
    trainees: query.length > 1 ? trainees.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase()) || 
      t.email.toLowerCase().includes(query.toLowerCase())
    ) : [],
    courses: query.length > 1 ? courses.filter(c => 
      c.title.toLowerCase().includes(query.toLowerCase()) || 
      c.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    ) : [],
    enrollments: query.length > 1 ? enrollments.filter(e => 
      e.refNo.toLowerCase().includes(query.toLowerCase()) ||
      e.traineeName.toLowerCase().includes(query.toLowerCase())
    ) : []
  };

  const hasResults = Object.values(searchResults).some(arr => arr.length > 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pt-4">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        <Input
          placeholder="Search across trainees, courses, and enrollments..."
          className="pl-14 h-16 text-lg bg-card rounded-2xl shadow-sm border-card-border shadow-primary/5 focus-visible:ring-primary/20"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {query.length > 1 ? (
        hasResults ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 w-full justify-start h-auto p-1 bg-muted/50 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg py-2">All Results</TabsTrigger>
              <TabsTrigger value="trainees" className="rounded-lg py-2">Trainees ({searchResults.trainees.length})</TabsTrigger>
              <TabsTrigger value="enrollments" className="rounded-lg py-2">Enrollments ({searchResults.enrollments.length})</TabsTrigger>
              <TabsTrigger value="courses" className="rounded-lg py-2">Courses ({searchResults.courses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8 mt-0">
              {searchResults.trainees.length > 0 && (
                <ResultGroup title="Trainees" icon={Users}>
                  {searchResults.trainees.map(t => (
                    <TraineeResult key={t.id} trainee={t} />
                  ))}
                </ResultGroup>
              )}
              {searchResults.enrollments.length > 0 && (
                <ResultGroup title="Enrollments" icon={FileText}>
                  {searchResults.enrollments.map(e => (
                    <EnrollmentResult key={e.id} enrollment={e} />
                  ))}
                </ResultGroup>
              )}
              {searchResults.courses.length > 0 && (
                <ResultGroup title="Courses" icon={BookOpen}>
                  {searchResults.courses.map(c => (
                    <CourseResult key={c.id} course={c} />
                  ))}
                </ResultGroup>
              )}
            </TabsContent>

            <TabsContent value="trainees" className="space-y-3 mt-0">
              {searchResults.trainees.map(t => <TraineeResult key={t.id} trainee={t} />)}
            </TabsContent>
            
            <TabsContent value="enrollments" className="space-y-3 mt-0">
              {searchResults.enrollments.map(e => <EnrollmentResult key={e.id} enrollment={e} />)}
            </TabsContent>
            
            <TabsContent value="courses" className="space-y-3 mt-0">
              {searchResults.courses.map(c => <CourseResult key={c.id} course={c} />)}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-20 text-muted-foreground bg-card rounded-2xl border border-card-border">
            <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No results found for "{query}"</p>
            <p className="text-sm mt-1">Try checking for typos or using different keywords.</p>
          </div>
        )
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Start typing to search across the entire academy.</p>
        </div>
      )}
    </div>
  );
}

function ResultGroup({ title, icon: Icon, children }: any) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" /> {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function TraineeResult({ trainee }: any) {
  return (
    <Card className="border-card-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group shadow-none">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            {trainee.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold">{trainee.name}</p>
            <p className="text-sm text-muted-foreground">{trainee.email}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardContent>
    </Card>
  );
}

function EnrollmentResult({ enrollment }: { enrollment: { refNo: string; status: string; traineeName: string; courseSlug: string } }) {
  const { data: courses = [] } = useCourses();
  const courseTitle = courseTitleBySlug(courses, enrollment.courseSlug);
  return (
    <Card className="border-card-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group shadow-none">
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase">{enrollment.refNo}</span>
            <StatusBadge status={enrollment.status as any} />
          </div>
          <p className="font-semibold">{enrollment.traineeName}</p>
          <p className="text-sm text-muted-foreground">{courseTitle}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
      </CardContent>
    </Card>
  );
}

function CourseResult({ course }: any) {
  return (
    <Card className="border-card-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group shadow-none">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-lg">{course.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{course.category}</span>
            <span className="text-xs text-muted-foreground">{course.level}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </CardContent>
    </Card>
  );
}
