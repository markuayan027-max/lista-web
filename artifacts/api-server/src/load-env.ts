import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
/** Loads repo-root .env for api-server (restart picks up @workspace/db table names). */
import { config } from "dotenv";

/** Cloudflare Workers: no on-disk .env; use wrangler [vars] + dashboard secrets. */
function loadDotenvFromDisk(): void {
  const metaUrl = import.meta.url;
  if (typeof metaUrl !== "string" || !metaUrl) {
    return;
  }

  let here: string;
  try {
    here = path.dirname(fileURLToPath(metaUrl));
  } catch {
    return;
  }

  /** Repo root `.env` — works from `src/` (dev) and `dist/` (bundled Node). */
  const envCandidates = [
    path.resolve(here, "../../../.env"),
    path.resolve(here, "../../../../.env"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
  ];

  for (const envPath of envCandidates) {
    try {
      if (fs.existsSync(envPath)) {
        config({ path: envPath, override: false });
        break;
      }
    } catch {
      // Workers may lack filesystem access for arbitrary paths.
    }
  }
}

loadDotenvFromDisk();
