import { useMemo, useState } from "react";
import type { Course } from "@/lib/institutional-data";

export function useCourseCatalogFilters(courses: Course[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category).filter(Boolean));
    return ["All", ...Array.from(cats).sort((a, b) => a.localeCompare(b))];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesCategory =
        selectedCategory === "All" || course.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        course.title.toLowerCase().includes(q) ||
        course.shortDescription.toLowerCase().includes(q) ||
        course.category.toLowerCase().includes(q) ||
        course.ncLevel.toLowerCase().includes(q) ||
        course.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [courses, searchQuery, selectedCategory]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedCategory !== "All";

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredCourses,
    clearFilters,
    hasActiveFilters,
  };
}
