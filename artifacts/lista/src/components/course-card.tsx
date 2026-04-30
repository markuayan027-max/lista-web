import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { withBase } from "@/lib/with-base";
import { Clock, BarChart, Tag } from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  slug: string;
  title: string;
  category: string;
  level: string;
  durationWeeks: number;
  priceUSD: number;
  shortDescription: string;
  coverImageUrl: string;
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="cursor-pointer"
      >
        <Card className="group overflow-hidden border-card-border shadow-sm transition-all hover:shadow-md">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={withBase(course.coverImageUrl)}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/90 text-primary hover:bg-white text-xs font-semibold backdrop-blur-sm">
                {course.category}
              </Badge>
            </div>
          </div>
          <CardContent className="p-5 space-y-3">
            <h3 className="text-xl font-bold leading-tight group-hover:text-primary/80 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {course.shortDescription}
            </p>
          </CardContent>
          <CardFooter className="p-5 pt-0 flex items-center justify-between border-t border-card-border/50 mt-auto">
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {course.durationWeeks}w
              </span>
              <span className="flex items-center gap-1">
                <BarChart className="h-3.5 w-3.5" />
                {course.level}
              </span>
            </div>
            <span className="text-lg font-bold text-primary">
              ${course.priceUSD}
            </span>
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  );
}
