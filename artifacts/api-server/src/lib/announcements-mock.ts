/** Fallback announcements when DB is unreachable (matches seed_data.sql). */
export const MOCK_ANNOUNCEMENTS = [
  {
    id: "seed-twsp",
    title: "TWSP Scholarship Slots Available!",
    body: "Scholarship slots for Bookkeeping NC III, Driving NC II & Agricultural Crops Production NC I under Training for Work Scholarship Program (TWSP) with training benefits. Enroll now — limited slots only. First come, first served.",
    target: "all",
    createdAt: new Date("2024-10-28T08:00:00Z"),
  },
  {
    id: "seed-women",
    title: "National Women's Celebration Month Capability Training",
    body: "In March 2024, LISTA hosted a transformative three-day capability training program in support of National Women's Celebration Month. Thirty women from Gingoog City participated in practical sessions covering urban gardening, composting, soil preparation, and seedling cultivation.",
    target: "all",
    createdAt: new Date("2024-03-20T09:00:00Z"),
  },
  {
    id: "seed-rabbitry",
    title: "Training of Trainers on Rabbitry Production",
    body: "In June 2024, LISTA's training farm in Lunotan became the venue for a five-day Training of Trainers on Rabbitry Production as an Enterprise — organized by ATI-RTC X.",
    target: "all",
    createdAt: new Date("2024-06-03T12:00:00Z"),
  },
];
