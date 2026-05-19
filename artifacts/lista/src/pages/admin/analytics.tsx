import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatCard from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock, Award } from "lucide-react";
import { useCourses, useDerivedCertificates, useEnrollments, useUsers } from "@/hooks/use-lista-data";
import {
  buildMonthlyEnrollmentSeries,
  computePeriodTrend,
  countInLastDays,
  isFormalEnrollment,
} from "@/lib/analytics-utils";
import { AnalyticsSkeleton } from "@/components/skeletons";
import { ContentFadeIn } from "@/components/skeletons/primitives";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

const COLORS = ["#0f172a", "#3b82f6", "#0ea5e9", "#60a5fa", "#94a3b8"];

export default function AdminAnalyticsPage() {
  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments();
  const { data: courses = [] } = useCourses();
  const { data: users = [] } = useUsers();
  const { data: certificates = [] } = useDerivedCertificates();

  const formalEnrollments = useMemo(
    () => enrollments.filter(isFormalEnrollment),
    [enrollments],
  );

  const totalEnrollments = formalEnrollments.length;
  const activeTrainees = users.filter((u) => u.role === "trainee").length;
  const pendingApplications = formalEnrollments.filter((e) => e.status === "pending").length;
  const certificatesIssued = certificates.filter((c) => c.status === "issued").length;

  const enrollmentTrend = useMemo(() => {
    const last30 = countInLastDays(formalEnrollments, 30);
    const prev30 = countInLastDays(formalEnrollments, 60) - last30;
    return computePeriodTrend(last30, prev30);
  }, [formalEnrollments]);

  const pendingTrend = useMemo(() => {
    const pending = formalEnrollments.filter((e) => e.status === "pending");
    const last30 = countInLastDays(pending, 30);
    const prev30 = countInLastDays(pending, 60) - last30;
    return computePeriodTrend(last30, prev30);
  }, [formalEnrollments]);

  const enrollmentData = useMemo(
    () => buildMonthlyEnrollmentSeries(formalEnrollments, 12),
    [formalEnrollments],
  );

  const courseMixData = useMemo(
    () =>
      Object.entries(
        formalEnrollments.reduce(
          (acc, curr) => {
            const course = courses.find((c) => c.slug === curr.courseSlug);
            const label = course?.category?.trim() || "Uncategorized";
            acc[label] = (acc[label] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      ).map(([name, value]) => ({ name, value })),
    [formalEnrollments, courses],
  );

  const statusData = useMemo(
    () => [
      { name: "Pending", count: formalEnrollments.filter((e) => e.status === "pending").length },
      { name: "Confirmed", count: formalEnrollments.filter((e) => e.status === "confirmed").length },
      { name: "Rejected", count: formalEnrollments.filter((e) => e.status === "rejected").length },
    ],
    [formalEnrollments],
  );

  const topCourses = useMemo(
    () =>
      courses
        .map((course) => ({
          ...course,
          enrollmentCount: formalEnrollments.filter((e) => e.courseSlug === course.slug).length,
        }))
        .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
        .slice(0, 5),
    [courses, formalEnrollments],
  );

  const hasEnrollmentChartData = enrollmentData.some((d) => d.enrollments > 0);

  if (enrollmentsLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <ContentFadeIn>
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="show">

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Enrollments"
          value={totalEnrollments}
          trend={enrollmentTrend}
          icon={BookOpen}
          accent="bg-primary-electric/15"
        />
        <StatCard label="Active Trainees" value={activeTrainees} icon={Users} accent="bg-primary-indigo/15" />
        <StatCard
          label="Pending Applications"
          value={pendingApplications}
          trend={pendingTrend}
          icon={Clock}
          accent="bg-amber-100"
        />
        <StatCard
          label="Certificates Issued"
          value={certificatesIssued}
          icon={Award}
          accent="bg-emerald-100"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-card-border">
            <CardHeader>
              <CardTitle className="text-base font-bold">Enrollments Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {hasEnrollmentChartData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={enrollmentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        dx={-10}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="enrollments"
                        stroke="#0f172a"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No enrollment records yet. Counts will appear as trainees submit applications.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-card-border h-full">
            <CardHeader>
              <CardTitle className="text-base font-bold">Course Mix</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {courseMixData.length > 0 ? (
                <>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={courseMixData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {courseMixData.map((entry, index) => (
                            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {courseMixData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-muted-foreground">
                          {entry.name} ({entry.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-[300px] w-full items-center justify-center text-sm text-muted-foreground text-center px-6">
                  No course enrollments to chart yet. Assign courses when trainees apply.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="shadow-sm border-card-border h-full">
            <CardHeader>
              <CardTitle className="text-base font-bold">Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar dataKey="count" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={32}>
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            entry.name === "Pending"
                              ? "#f59e0b"
                              : entry.name === "Confirmed"
                                ? "#10b981"
                                : "#f43f5e"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="shadow-sm border-card-border h-full">
            <CardHeader>
              <CardTitle className="text-base font-bold">Top Performing Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto hide-scrollbar">
                {topCourses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-card-border hover:bg-transparent">
                        <TableHead className="font-semibold text-muted-foreground">Course</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Category</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Level</TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-right">
                          Enrollments
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topCourses.map((course) => (
                        <TableRow key={course.id} className="border-b border-card-border/50">
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium bg-muted/50 border-transparent">
                              {course.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">{course.level}</TableCell>
                          <TableCell className="text-right font-bold">{course.enrollmentCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="py-12 text-center text-sm text-muted-foreground">No courses in catalog.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
    </ContentFadeIn>
  );
}
