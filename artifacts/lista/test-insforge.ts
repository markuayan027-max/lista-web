import { insforge } from "./src/lib/insforge.js";

async function test() {
  console.log("Testing connection...");
  try {
    const { data, error } = await insforge.auth.getCurrentUser();
    console.log("Auth error:", error);
    const { data: dbData, error: dbError } = await insforge.db.from("enrollments").select("id").limit(1);
    console.log("DB error:", dbError);
    console.log("Success! DB is responding.");
  } catch(e) {
    console.log("Exception:", e);
  }
}
test();
