import { db, courses, announcements, faqs, testimonials, users } from "./index";
import { 
  courses as mockCourses, 
  announcements as mockAnnouncements, 
  faqs as mockFaqs, 
  testimonials as mockTestimonials,
  users as mockUsers
} from "../../../artifacts/lista/src/lib/institutional-data";

async function seed() {
  console.log("Seeding database...");

  try {
    // Seed Courses
    console.log("Seeding courses...");
    for (const course of mockCourses) {
      await db.insert(courses).values({
        slug: course.slug,
        name: course.title,
        ncLevel: course.ncLevel,
        sector: course.category,
        description: course.longDescription,
        shortDescription: course.shortDescription,
        duration: `${course.durationHours} hours`,
        twspScholarship: course.twsp ? "true" : "false",
        coverImageUrl: course.galleryImages[0],
      }).onConflictDoNothing();
    }

    // Seed Announcements
    console.log("Seeding announcements...");
    for (const announcement of mockAnnouncements) {
      await db.insert(announcements).values({
        title: announcement.title,
        body: announcement.body,
        target: announcement.targetRole,
        createdAt: new Date(announcement.createdAt),
      }).onConflictDoNothing();
    }

    // Seed FAQs
    console.log("Seeding FAQs...");
    for (const faq of mockFaqs) {
      await db.insert(faqs).values({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      }).onConflictDoNothing();
    }

    // Seed Testimonials
    console.log("Seeding testimonials...");
    for (const testimonial of mockTestimonials) {
      await db.insert(testimonials).values({
        quote: testimonial.quote,
        attribution: testimonial.name || "Anonymous",
        name: testimonial.name,
        role: testimonial.role,
      }).onConflictDoNothing();
    }

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seed();
