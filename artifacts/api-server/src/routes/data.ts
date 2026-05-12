import { Router } from "express";
import { db, courses, announcements, faqs, testimonials, cases, incidents } from "@workspace/db";

const router = Router();

router.get("/courses", async (req, res) => {
  const data = await db.select().from(courses);
  res.json(data);
});

router.get("/announcements", async (req, res) => {
  const data = await db.select().from(announcements);
  res.json(data);
});

router.get("/faqs", async (req, res) => {
  const data = await db.select().from(faqs);
  res.json(data);
});

router.get("/testimonials", async (req, res) => {
  const data = await db.select().from(testimonials);
  res.json(data);
});

router.get("/cases", async (req, res) => {
  const data = await db.select().from(cases);
  res.json(data);
});

router.get("/incidents", async (req, res) => {
  const data = await db.select().from(incidents);
  res.json(data);
});

export default router;
