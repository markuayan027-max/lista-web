import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
/** Loads repo-root .env for api-server (restart picks up @workspace/db table names). */
import { config } from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Repo root `.env` — works from `src/` (dev) and `dist/` (bundled). */
const envCandidates = [
  path.resolve(here, "../../../.env"),
  path.resolve(here, "../../../../.env"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    config({ path: envPath, override: false });
    break;
  }
}
